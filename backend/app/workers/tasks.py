"""
Celery Tasks for Amarktai Marketing

Core tasks:
  run_content_generation_and_post  – generate + queue content (3× daily)
  post_approved_content            – post APPROVED items every 15 min
  sync_platform_analytics          – pull analytics from platforms
  analyze_ab_tests                 – declare A/B test winners
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta

import httpx
from celery import shared_task
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.content import Content, ContentStatus, ContentType
from app.models.user import User
from app.models.webapp import WebApp


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_hf_token(db: Session, user: User) -> str | None:
    """Return user's HuggingFace token, falling back to system key."""
    from app.models.user_api_key import UserAPIKey

    row = (
        db.query(UserAPIKey)
        .filter(
            UserAPIKey.user_id == user.id,
            UserAPIKey.key_name == "HUGGINGFACE_TOKEN",
            UserAPIKey.is_active == True,
        )
        .first()
    )
    if row:
        return row.get_decrypted_key()
    return settings.HUGGINGFACE_TOKEN or None


def _get_platform_credentials(db: Session, user_id: str, platform: str) -> dict:
    """Return decrypted OAuth credentials for a connected platform."""
    from app.models.user_api_key import UserIntegration
    import json

    integ = (
        db.query(UserIntegration)
        .filter(
            UserIntegration.user_id == user_id,
            UserIntegration.platform == platform,
            UserIntegration.is_connected == True,
        )
        .first()
    )
    if not integ:
        return {}

    creds: dict = {}
    if integ.get_access_token():
        creds["access_token"] = integ.get_access_token()
    if integ.get_refresh_token():
        creds["access_token_secret"] = integ.get_refresh_token()

    # Extra per-platform data (stored as JSON in platform_data)
    if integ.platform_data:
        try:
            extra = json.loads(integ.platform_data)
            creds.update(extra)
        except Exception:
            pass

    return creds


# ---------------------------------------------------------------------------
# Task: generate content and add to approval queue (3× per day)
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=2, name="app.workers.tasks.run_content_generation_and_post")
def run_content_generation_and_post(self, window: str = "morning"):
    """
    Generate HuggingFace content for every active user's webapp and put
    the result in the PENDING approval queue.

    Called 3× daily (08:00, 13:00, 18:00 UTC).
    """
    print(f"🤖 [{window}] Content generation started – {datetime.utcnow().isoformat()}")
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            try:
                _generate_for_user(db, user, window)
            except Exception as exc:
                print(f"❌ Generation failed for user {user.id}: {exc}")
        print(f"✅ [{window}] Content generation complete")
    finally:
        db.close()


def _generate_for_user(db: Session, user: User, window: str) -> None:
    """Generate content for one user and persist to DB."""
    from app.services.hf_generator import HuggingFaceGenerator
    from app.models.user_api_key import UserIntegration

    hf_token = _get_hf_token(db, user)
    if not hf_token:
        print(f"⏭️  User {user.id}: no HuggingFace token, skipping")
        return

    # Quota guard
    if user.monthly_content_used >= user.monthly_content_quota:
        print(f"⏭️  User {user.id}: monthly quota exceeded")
        return

    webapps = db.query(WebApp).filter(WebApp.user_id == user.id, WebApp.is_active == True).all()
    if not webapps:
        return

    integrations = (
        db.query(UserIntegration)
        .filter(UserIntegration.user_id == user.id, UserIntegration.is_connected == True)
        .all()
    )
    platforms = [i.platform for i in integrations] or [
        "youtube", "tiktok", "instagram", "twitter", "linkedin", "facebook"
    ]
    # Free tier: cap at 3 platforms
    if user.plan.value == "free":
        platforms = platforms[:3]

    generator = HuggingFaceGenerator(hf_token)

    for webapp in webapps[:1]:  # 1 webapp per cycle to stay within HF free limits
        webapp_data = {
            "name": webapp.name,
            "url": str(webapp.url),
            "description": webapp.description,
            "category": webapp.category,
            "target_audience": webapp.target_audience,
            "key_features": webapp.key_features or [],
        }
        results = asyncio.run(generator.generate_batch(webapp_data, platforms))

        for platform, content_dict in results.items():
            if content_dict.get("_generation_error") and not content_dict.get("caption"):
                continue
            content_type = (
                ContentType.VIDEO if platform in ("youtube", "tiktok") else ContentType.IMAGE
            )
            db_content = Content(
                id=str(uuid.uuid4()),
                user_id=user.id,
                webapp_id=webapp.id,
                platform=platform,
                type=content_type,
                status=ContentStatus.PENDING,
                title=content_dict.get("title", "Generated Post"),
                caption=content_dict.get("caption", ""),
                hashtags=content_dict.get("hashtags", []),
                media_urls=[],
                generation_metadata={"window": window, "generator": "huggingface"},
            )
            db.add(db_content)

        user.monthly_content_used = (user.monthly_content_used or 0) + len(results)
        db.commit()
        print(f"✅  User {user.id}: generated {len(results)} items for window={window}")


# ---------------------------------------------------------------------------
# Task: post APPROVED content to platforms
# ---------------------------------------------------------------------------

@shared_task(bind=True, max_retries=2, name="app.workers.tasks.post_approved_content")
def post_approved_content(self):
    """
    Find APPROVED content items and post them to their platforms.
    Runs every 15 minutes.
    """
    db = SessionLocal()
    try:
        items = (
            db.query(Content)
            .filter(Content.status == ContentStatus.APPROVED)
            .order_by(Content.created_at)
            .limit(50)
            .all()
        )
        for item in items:
            try:
                _post_single_item(db, item)
            except Exception as exc:
                print(f"❌ Post failed for content {item.id}: {exc}")
                item.status = ContentStatus.FAILED
                db.commit()
    finally:
        db.close()


def _post_single_item(db: Session, item: Content) -> None:
    from app.services.posting_service import post_to_platform
    from app.models.webapp import WebApp

    creds = _get_platform_credentials(db, item.user_id, item.platform)
    if not creds:
        # No credentials connected – mark as failed
        item.status = ContentStatus.FAILED
        db.commit()
        print(f"⚠️  No credentials for {item.platform}, content {item.id}")
        return

    webapp = db.query(WebApp).filter(WebApp.id == item.webapp_id).first()
    webapp_url = str(webapp.url) if webapp else ""

    result = asyncio.run(
        post_to_platform(
            platform=item.platform,
            credentials=creds,
            caption=item.caption,
            title=item.title,
            hashtags=item.hashtags or [],
            media_urls=item.media_urls or [],
            webapp_url=webapp_url,
        )
    )

    if result.success:
        item.status = ContentStatus.POSTED
        item.posted_at = datetime.utcnow()
        item.platform_post_id = result.post_id
        print(f"✅  Posted {item.id} → {item.platform}: {result.url}")
    else:
        item.status = ContentStatus.FAILED
        item.generation_metadata = {
            **(item.generation_metadata or {}),
            "post_error": result.error,
        }
        print(f"❌  Failed to post {item.id} → {item.platform}: {result.error}")

    db.commit()


# ---------------------------------------------------------------------------
# Task: sync analytics
# ---------------------------------------------------------------------------

@shared_task(bind=True, name="app.workers.tasks.sync_platform_analytics")
def sync_platform_analytics(self):
    """Pull view/like/comment counts for recently posted content."""
    print("📊 Syncing platform analytics…")
    db = SessionLocal()
    try:
        from app.models.user_api_key import UserIntegration

        # Get all content posted in the last 7 days
        cutoff = datetime.utcnow() - timedelta(days=7)
        posted_items = (
            db.query(Content)
            .filter(
                Content.status == "posted",
                Content.posted_at >= cutoff,
                Content.platform_post_id != None,
            )
            .all()
        )

        for item in posted_items:
            try:
                _sync_content_analytics(db, item)
            except Exception as exc:
                print(f"⚠️  Analytics sync failed for {item.id}: {exc}")

        db.commit()
        print(f"✅ Analytics sync complete ({len(posted_items)} items checked)")
    finally:
        db.close()


def _sync_content_analytics(db: Session, item: Content) -> None:
    """Fetch updated metrics for a single posted content item."""
    creds = _get_platform_credentials(db, item.user_id, item.platform)
    if not creds:
        return

    metrics: dict = {}

    try:
        if item.platform == "twitter" and creds.get("api_key"):
            # Twitter v2 tweet metrics
            import tweepy  # type: ignore
            client = tweepy.Client(
                consumer_key=creds["api_key"],
                consumer_secret=creds["api_secret"],
                access_token=creds["access_token"],
                access_token_secret=creds["access_token_secret"],
            )
            response = client.get_tweet(
                item.platform_post_id,
                tweet_fields=["public_metrics"],
            )
            if response.data:
                m = response.data.public_metrics or {}
                metrics = {
                    "views": m.get("impression_count", 0),
                    "likes": m.get("like_count", 0),
                    "comments": m.get("reply_count", 0),
                    "shares": m.get("retweet_count", 0),
                }

        elif item.platform in ("facebook", "instagram") and creds.get("page_access_token"):
            # Facebook/Instagram Graph API post insights
            token = creds.get("page_access_token") or creds.get("access_token")
            async def _fb_fetch():
                async with httpx.AsyncClient(timeout=15) as c:
                    r = await c.get(
                        f"https://graph.facebook.com/v18.0/{item.platform_post_id}",
                        params={
                            "fields": "likes.summary(true),comments.summary(true),shares",
                            "access_token": token,
                        },
                    )
                    return r.json() if r.is_success else {}
            data = asyncio.run(_fb_fetch())
            metrics = {
                "likes": data.get("likes", {}).get("summary", {}).get("total_count", 0),
                "comments": data.get("comments", {}).get("summary", {}).get("total_count", 0),
                "shares": data.get("shares", {}).get("count", 0),
            }

        elif item.platform == "youtube" and creds.get("access_token"):
            # YouTube Data API v3
            async def _yt_fetch():
                async with httpx.AsyncClient(timeout=15) as c:
                    r = await c.get(
                        "https://www.googleapis.com/youtube/v3/videos",
                        params={
                            "part": "statistics",
                            "id": item.platform_post_id,
                            "access_token": creds["access_token"],
                        },
                    )
                    return r.json() if r.is_success else {}
            data = asyncio.run(_yt_fetch())
            items_data = data.get("items", [])
            if items_data:
                s = items_data[0].get("statistics", {})
                metrics = {
                    "views": int(s.get("viewCount", 0)),
                    "likes": int(s.get("likeCount", 0)),
                    "comments": int(s.get("commentCount", 0)),
                }

    except Exception as exc:
        print(f"⚠️  Platform API error for {item.platform}/{item.platform_post_id}: {exc}")
        return

    if metrics:
        if metrics.get("views") is not None:
            item.views = metrics["views"]
        if metrics.get("likes") is not None:
            item.likes = metrics["likes"]
        if metrics.get("comments") is not None:
            item.comments = metrics["comments"]
        if metrics.get("shares") is not None:
            item.shares = metrics["shares"]
        total = (item.views or 0)
        clicks = item.clicks or 0
        item.ctr = round((clicks / total) * 100, 2) if total > 0 else 0.0
        print(f"📈  Updated analytics for {item.id} ({item.platform}): views={item.views}")


# ---------------------------------------------------------------------------
# Task: A/B test analysis
# ---------------------------------------------------------------------------

@shared_task(bind=True, name="app.workers.tasks.analyze_ab_tests")
def analyze_ab_tests(self):
    """Analyse running A/B tests and declare winners."""
    print("🧪 Analysing A/B tests…")
    db = SessionLocal()
    try:
        from app.models.engagement import ABTest

        running = (
            db.query(ABTest)
            .filter(
                ABTest.status == "running",
                ABTest.started_at <= datetime.utcnow() - timedelta(hours=24),
            )
            .all()
        )

        for test in running:
            try:
                best_variant = None
                best_score = 0.0

                for variant in (test.variants or []):
                    metrics = (test.variant_metrics or {}).get(variant.get("variant_id", ""), {})
                    score = (
                        metrics.get("views", 0) * 0.3
                        + metrics.get("likes", 0) * 0.3
                        + metrics.get("comments", 0) * 0.25
                        + metrics.get("shares", 0) * 0.15
                    )
                    if score > best_score:
                        best_score = score
                        best_variant = variant

                baseline = (test.variant_metrics or {}).get("A", {})
                baseline_score = (
                    baseline.get("views", 0) * 0.3
                    + baseline.get("likes", 0) * 0.3
                    + baseline.get("comments", 0) * 0.25
                    + baseline.get("shares", 0) * 0.15
                )

                improvement = (
                    (best_score - baseline_score) / baseline_score * 100
                    if baseline_score > 0
                    else 0
                )

                if best_variant and improvement > 10:
                    test.winning_variant_id = best_variant.get("variant_id")
                    test.confidence_level = str(min(95, 70 + improvement))
                    test.improvement_percent = str(round(improvement, 2))
                    test.status = "completed"
                    test.ended_at = datetime.utcnow()

                # Force-end tests running more than 7 days
                if test.started_at <= datetime.utcnow() - timedelta(days=7):
                    test.status = "completed"
                    test.ended_at = datetime.utcnow()

                db.commit()
            except Exception as exc:
                print(f"❌ A/B test {test.id}: {exc}")

        print(f"✅ A/B test analysis done ({len(running)} tests checked)")
    finally:
        db.close()



# ---------------------------------------------------------------------------
# Daily automation tasks for Power Tools
# ---------------------------------------------------------------------------

@shared_task(bind=True, name="app.workers.tasks.daily_competitor_refresh")
def daily_competitor_refresh(self):
    """Nightly crawl + re-analysis of all active competitor profiles."""
    print("🕵️  Daily competitor refresh starting…")
    import asyncio
    from app.models.tools import CompetitorProfile
    from app.api.v1.endpoints.tools import _run_competitor_analysis

    db = SessionLocal()
    try:
        profiles = db.query(CompetitorProfile).filter(CompetitorProfile.is_active == True).all()
        for p in profiles:
            row = db.query(__import__('app.models.user_api_key', fromlist=['UserAPIKey']).UserAPIKey).filter_by(
                user_id=p.user_id, key_name="HUGGINGFACE_TOKEN", is_active=True
            ).first()
            token = row.get_decrypted_key() if row else settings.HUGGINGFACE_TOKEN
            if token:
                try:
                    asyncio.run(_run_competitor_analysis(p.id, token))
                except Exception as exc:
                    print(f"❌  Competitor {p.id}: {exc}")
        print(f"✅  Refreshed {len(profiles)} competitor profiles")
    finally:
        db.close()


@shared_task(bind=True, name="app.workers.tasks.daily_viral_spark")
def daily_viral_spark(self):
    """Generate a fresh Viral Spark report for each active user."""
    print("⚡  Daily Viral Spark generation…")
    import asyncio, uuid
    from app.models.tools import ViralSparkReport
    from app.models.webapp import WebApp
    from app.api.v1.endpoints.tools import _run_viral_spark

    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            row = db.query(__import__('app.models.user_api_key', fromlist=['UserAPIKey']).UserAPIKey).filter_by(
                user_id=user.id, key_name="HUGGINGFACE_TOKEN", is_active=True
            ).first()
            token = row.get_decrypted_key() if row else settings.HUGGINGFACE_TOKEN
            if not token:
                continue
            webapp = db.query(WebApp).filter(WebApp.user_id == user.id, WebApp.is_active == True).first()
            niche = (webapp.category or webapp.name) if webapp else "general marketing"
            r = ViralSparkReport(
                id=str(uuid.uuid4()),
                user_id=user.id,
                webapp_id=webapp.id if webapp else None,
                niche=niche,
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_viral_spark(r.id, token))
            except Exception as exc:
                print(f"❌  Viral Spark for {user.id}: {exc}")
        print("✅  Viral Spark done")
    finally:
        db.close()


@shared_task(bind=True, name="app.workers.tasks.daily_churn_check")
def daily_churn_check(self):
    """Nightly churn risk check for users with connected platforms."""
    print("🛡️  Daily churn shield check…")
    import asyncio, uuid
    from app.models.tools import ChurnShieldReport
    from app.models.user_api_key import UserIntegration
    from app.api.v1.endpoints.tools import _run_churn_shield

    db = SessionLocal()
    try:
        integrations = db.query(UserIntegration).filter(UserIntegration.is_connected == True).all()
        for integ in integrations:
            row = db.query(__import__('app.models.user_api_key', fromlist=['UserAPIKey']).UserAPIKey).filter_by(
                user_id=integ.user_id, key_name="HUGGINGFACE_TOKEN", is_active=True
            ).first()
            token = row.get_decrypted_key() if row else settings.HUGGINGFACE_TOKEN
            if not token:
                continue
            r = ChurnShieldReport(
                id=str(uuid.uuid4()),
                user_id=integ.user_id,
                platform=integ.platform,
                dropout_patterns=["Automated daily churn check"],
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_churn_shield(r.id, token))
            except Exception as exc:
                print(f"❌  Churn check {integ.platform}/{integ.user_id}: {exc}")
        print("✅  Churn shield done")
    finally:
        db.close()
