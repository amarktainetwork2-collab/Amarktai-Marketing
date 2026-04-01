"""
Celery Tasks for AmarktAI Marketing

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
    from app.services.scraper import scrape_page
    from app.models.user_api_key import UserIntegration

    hf_token = _get_hf_token(db, user)

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
    # Free tier: cap at 3 platforms (admin bypasses all limits)
    from app.api.deps import is_admin_user
    if user.plan.value == "free" and not is_admin_user(user):
        platforms = platforms[:3]

    for webapp in webapps[:1]:  # 1 webapp per cycle to stay within HF Pro limits
        # Enrich webapp data by scraping live website copy
        live_description = webapp.description or ""
        try:
            scraped = asyncio.run(scrape_page(str(webapp.url), timeout=15))
            if scraped and not scraped.error and scraped.full_text:
                live_description = scraped.full_text[:1200]
        except Exception as exc:
            print(f"⚠️  Scrape failed for {webapp.url}: {exc}")

        webapp_data = {
            "name": webapp.name,
            "url": str(webapp.url),
            "description": live_description or webapp.description,
            "category": webapp.category,
            "target_audience": webapp.target_audience,
            "key_features": webapp.key_features or [],
        }
        if hf_token:
            try:
                generator = HuggingFaceGenerator(hf_token)
                results = asyncio.run(generator.generate_batch(webapp_data, platforms))
            except Exception as exc:
                print(f"⚠️  HF generation failed for {webapp.url}: {exc}")
                results = {p: HuggingFaceGenerator._fallback_content(webapp_data, p) for p in platforms}
        else:
            results = {p: HuggingFaceGenerator._fallback_content(webapp_data, p) for p in platforms}

        for platform, content_dict in results.items():
            if content_dict.get("_generation_error") and not content_dict.get("caption"):
                continue
            content_type = (
                ContentType.VIDEO if platform in ("youtube", "tiktok", "snapchat") else ContentType.IMAGE
            )
            from app.services.media_service import placeholder_image, placeholder_video
            if content_type == ContentType.VIDEO:
                media_urls = [placeholder_video(webapp_data)]
            else:
                media_urls = [placeholder_image(webapp_data, platform)]
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
                media_urls=media_urls,
                generation_metadata={"window": window, "generator": "huggingface" if hf_token else "template"},
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
        _emit_sse(item.user_id, "content:failed", {
            "content_id": item.id, "platform": item.platform,
            "error": f"No credentials for {item.platform}",
        })
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
        _emit_sse(item.user_id, "content:posted", {
            "content_id": item.id, "platform": item.platform,
            "post_id": result.post_id, "url": result.url,
        })
        # Send email notification + integration event
        _notify_content_posted(db, item, result)
    else:
        item.status = ContentStatus.FAILED
        item.generation_metadata = {
            **(item.generation_metadata or {}),
            "post_error": result.error,
        }
        print(f"❌  Failed to post {item.id} → {item.platform}: {result.error}")
        _emit_sse(item.user_id, "content:failed", {
            "content_id": item.id, "platform": item.platform,
            "error": result.error,
        })

    db.commit()


def _emit_sse(user_id: str, event_type: str, data: dict) -> None:
    """Publish an SSE event to connected clients. Safe to call from tasks."""
    try:
        from app.api.v1.endpoints.events import publish_event
        publish_event(user_id, event_type, data)
    except Exception:
        pass  # SSE is best-effort — never block the task


def _notify_content_posted(db: Session, item: Content, result) -> None:
    """Send email notification and AmarktAI Network event after successful post."""
    try:
        user = db.query(User).filter(User.id == item.user_id).first()
        if user and user.email:
            from app.services.email_service import send_content_posted
            send_content_posted(user.email, item.platform, item.title or "", result.url)
    except Exception:
        pass
    try:
        from app.services.integration import send_event
        asyncio.run(send_event("content.posted", {
            "platform": item.platform, "content_id": item.id,
        }))
    except Exception:
        pass


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


# ---------------------------------------------------------------------------
# Daily power tool tasks for the remaining 6 tools
# ---------------------------------------------------------------------------

def _get_user_hf_token(db: Session, user_id: str) -> str | None:
    """Helper: get HF token for any user_id (not a User object)."""
    from app.models.user_api_key import UserAPIKey
    row = db.query(UserAPIKey).filter_by(
        user_id=user_id, key_name="HUGGINGFACE_TOKEN", is_active=True
    ).first()
    return row.get_decrypted_key() if row else settings.HUGGINGFACE_TOKEN or None


@shared_task(bind=True, name="app.workers.tasks.daily_feedback_alchemy")
def daily_feedback_alchemy(self):
    """Process latest engagement replies as feedback and generate marketing insights."""
    print("⚗️  Daily Feedback Alchemy starting…")
    from app.models.tools import FeedbackAnalysis
    from app.models.engagement import EngagementReply
    from app.api.v1.endpoints.tools import _run_feedback_analysis

    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            token = _get_user_hf_token(db, user.id)
            if not token:
                continue
            # Collect last 20 engagement texts as feedback
            replies = (
                db.query(EngagementReply)
                .filter(EngagementReply.user_id == user.id)
                .order_by(EngagementReply.created_at.desc())
                .limit(20)
                .all()
            )
            if not replies:
                continue
            feedback_texts = [r.original_text for r in replies if r.original_text]
            webapp = db.query(WebApp).filter(WebApp.user_id == user.id, WebApp.is_active == True).first()
            r = FeedbackAnalysis(
                id=str(uuid.uuid4()),
                user_id=user.id,
                webapp_id=webapp.id if webapp else None,
                source="social",
                raw_feedback=feedback_texts,
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_feedback_analysis(r.id, token))
            except Exception as exc:
                print(f"❌  Feedback alchemy {user.id}: {exc}")
        print("✅  Feedback Alchemy done")
    finally:
        db.close()


@shared_task(bind=True, name="app.workers.tasks.daily_seo_mirage")
def daily_seo_mirage(self):
    """Generate SEO mirage reports for recently posted content."""
    print("🔮  Daily SEO Mirage starting…")
    from app.models.tools import SeoMirageReport
    from app.models.content import Content as ContentModel, ContentStatus
    from app.api.v1.endpoints.tools import _run_seo_mirage

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        recent_posts = (
            db.query(ContentModel)
            .filter(
                ContentModel.status == ContentStatus.POSTED,
                ContentModel.posted_at >= cutoff,
            )
            .all()
        )
        for item in recent_posts:
            token = _get_user_hf_token(db, item.user_id)
            if not token:
                continue
            r = SeoMirageReport(
                id=str(uuid.uuid4()),
                user_id=item.user_id,
                content_id=item.id,
                input_text=item.caption,
                platform=item.platform,
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_seo_mirage(r.id, token))
            except Exception as exc:
                print(f"❌  SEO Mirage {item.id}: {exc}")
        print(f"✅  SEO Mirage done ({len(recent_posts)} posts)")
    finally:
        db.close()


@shared_task(bind=True, name="app.workers.tasks.daily_harmony_pricer")
def daily_harmony_pricer(self):
    """Run dynamic pricing analysis for users with webapps."""
    print("💰  Daily Harmony Pricer starting…")
    from app.models.tools import HarmonyPricerReport
    from app.api.v1.endpoints.tools import _run_harmony_pricer

    db = SessionLocal()
    try:
        webapps = db.query(WebApp).filter(WebApp.is_active == True).all()
        for webapp in webapps:
            token = _get_user_hf_token(db, webapp.user_id)
            if not token:
                continue
            r = HarmonyPricerReport(
                id=str(uuid.uuid4()),
                user_id=webapp.user_id,
                product_name=webapp.name,
                current_price="0.00",
                platform="social",
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_harmony_pricer(r.id, token))
            except Exception as exc:
                print(f"❌  Harmony Pricer {webapp.id}: {exc}")
        print("✅  Harmony Pricer done")
    finally:
        db.close()


@shared_task(bind=True, name="app.workers.tasks.daily_echo_amplifier")
def daily_echo_amplifier(self):
    """Amplify the most-engaged recent comments/mentions into social threads."""
    print("📣  Daily Echo Amplifier starting…")
    from app.models.tools import EchoAmplification
    from app.models.engagement import EngagementReply
    from app.api.v1.endpoints.tools import _run_echo_amplifier

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        high_value = (
            db.query(EngagementReply)
            .filter(EngagementReply.created_at >= cutoff)
            .order_by(EngagementReply.created_at.desc())
            .limit(10)
            .all()
        )
        for eng in high_value:
            token = _get_user_hf_token(db, eng.user_id)
            if not token:
                continue
            r = EchoAmplification(
                id=str(uuid.uuid4()),
                user_id=eng.user_id,
                trigger_text=eng.original_text,
                trigger_source=eng.engagement_type or "comment",
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_echo_amplifier(r.id, token))
            except Exception as exc:
                print(f"❌  Echo Amplifier {eng.id}: {exc}")
        print("✅  Echo Amplifier done")
    finally:
        db.close()


@shared_task(bind=True, name="app.workers.tasks.daily_audience_mapper")
def daily_audience_mapper(self):
    """Refresh audience psychographic maps for each active webapp."""
    print("🗺️  Daily Audience Mapper starting…")
    from app.models.tools import AudienceMapReport
    from app.api.v1.endpoints.tools import _run_audience_mapper

    db = SessionLocal()
    try:
        webapps = db.query(WebApp).filter(WebApp.is_active == True).all()
        for webapp in webapps:
            token = _get_user_hf_token(db, webapp.user_id)
            if not token:
                continue
            r = AudienceMapReport(
                id=str(uuid.uuid4()),
                user_id=webapp.user_id,
                webapp_id=webapp.id,
                platform="multi",
                data_summary=f"{webapp.name}: {webapp.description or ''}",
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_audience_mapper(r.id, token))
            except Exception as exc:
                print(f"❌  Audience Mapper {webapp.id}: {exc}")
        print("✅  Audience Mapper done")
    finally:
        db.close()


@shared_task(bind=True, name="app.workers.tasks.daily_ad_alchemy")
def daily_ad_alchemy(self):
    """Generate A/B ad copy variants for recently posted content."""
    print("⚗️  Daily Ad Alchemy starting…")
    from app.models.tools import AdAlchemyReport
    from app.models.content import Content as ContentModel, ContentStatus
    from app.api.v1.endpoints.tools import _run_ad_alchemy

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(hours=48)
        recent = (
            db.query(ContentModel)
            .filter(
                ContentModel.status == ContentStatus.POSTED,
                ContentModel.posted_at >= cutoff,
            )
            .all()
        )
        for item in recent:
            token = _get_user_hf_token(db, item.user_id)
            if not token:
                continue
            r = AdAlchemyReport(
                id=str(uuid.uuid4()),
                user_id=item.user_id,
                content_id=item.id,
                product_or_service=item.title or "Product",
                current_copy=item.caption or "",
                platform=item.platform,
                status="pending",
            )
            db.add(r)
            db.commit()
            try:
                asyncio.run(_run_ad_alchemy(r.id, token))
            except Exception as exc:
                print(f"❌  Ad Alchemy {item.id}: {exc}")
        print("✅  Ad Alchemy done")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Auto-repurpose: remix top-performing posts to other platforms
# ---------------------------------------------------------------------------

@shared_task(bind=True, name="app.workers.tasks.auto_repurpose_top_content")
def auto_repurpose_top_content(self):
    """
    Find top-performing posted content (high views/likes) from the last 7 days
    and automatically create remix jobs to re-publish on platforms not yet covered.
    Runs daily at 06:00 UTC.
    """
    print("♻️  Auto-repurpose: top content starting…")
    from app.models.content import Content as ContentModel, ContentStatus, ContentType
    from app.services.hf_generator import HuggingFaceGenerator
    from app.models.user_api_key import UserIntegration

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=7)
        # Fetch content with engagement above median
        top_content = (
            db.query(ContentModel)
            .filter(
                ContentModel.status == ContentStatus.POSTED,
                ContentModel.posted_at >= cutoff,
                ContentModel.views >= 100,
            )
            .order_by(ContentModel.views.desc())
            .limit(5)
            .all()
        )

        for item in top_content:
            token = _get_user_hf_token(db, item.user_id)
            if not token:
                continue

            # Find platforms this user has connected but this post wasn't on
            connected = (
                db.query(UserIntegration)
                .filter(UserIntegration.user_id == item.user_id, UserIntegration.is_connected == True)
                .all()
            )
            source_platform = item.platform
            other_platforms = [i.platform for i in connected if i.platform != source_platform][:3]

            if not other_platforms:
                continue

            generator = HuggingFaceGenerator(token)
            source_text = f"{item.title}\n\n{item.caption}\n\n{' '.join(f'#{h}' for h in (item.hashtags or []))}"

            for platform in other_platforms:
                try:
                    remix = asyncio.run(
                        generator.remix_to_platform(source_text, platform, item.hashtags or [])
                    )
                    new_content = ContentModel(
                        id=str(uuid.uuid4()),
                        user_id=item.user_id,
                        webapp_id=item.webapp_id,
                        platform=platform,
                        type=ContentType.VIDEO if platform in ("youtube", "tiktok") else ContentType.IMAGE,
                        status=ContentStatus.PENDING,
                        title=remix.get("title", item.title),
                        caption=remix.get("caption", item.caption),
                        hashtags=remix.get("hashtags", item.hashtags or []),
                        media_urls=[],
                        generation_metadata={"source": "auto_repurpose", "original_id": item.id},
                    )
                    db.add(new_content)
                except Exception as exc:
                    print(f"❌  Repurpose {item.id} → {platform}: {exc}")

        db.commit()
        print(f"✅  Auto-repurpose: processed {len(top_content)} top posts")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Comment-to-lead conversion: capture interested commenters as leads
# ---------------------------------------------------------------------------

_INTEREST_SIGNALS = [
    "how much", "price", "cost", "buy", "purchase", "sign up", "signup",
    "interested", "where can i", "how do i", "link", "dm me", "send me",
    "want this", "need this", "how to get", "how to join", "subscribe",
    "enroll", "register", "free trial", "demo", "tell me more",
]


@shared_task(bind=True, name="app.workers.tasks.poll_and_capture_comment_leads")
def poll_and_capture_comment_leads(self):
    """
    Scan recent engagement replies for interest signals.
    Any comment containing a buy/interest keyword that isn't already a lead
    gets auto-captured as a new lead.
    Runs every 2 hours.
    """
    print("🎯  Comment-to-lead scan starting…")
    from app.models.engagement import EngagementReply
    from app.models.lead import Lead

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(hours=3)
        new_engagements = (
            db.query(EngagementReply)
            .filter(EngagementReply.created_at >= cutoff)
            .all()
        )

        captured = 0
        for eng in new_engagements:
            text_lower = (eng.original_text or "").lower()
            if not any(sig in text_lower for sig in _INTEREST_SIGNALS):
                continue

            # Check not already captured
            existing = (
                db.query(Lead)
                .filter(
                    Lead.user_id == eng.user_id,
                    Lead.source_platform == eng.platform,
                    Lead.notes == f"comment:{eng.platform_comment_id}",
                )
                .first()
            )
            if existing:
                continue

            # Create lead from comment
            lead = Lead(
                id=str(uuid.uuid4()),
                user_id=eng.user_id,
                name=eng.author_name,
                email=f"social_{eng.platform}_{eng.author_platform_id or eng.id}@example.com",
                source_platform=eng.platform,
                utm_source=eng.platform,
                utm_medium="comment",
                utm_campaign="organic",
                qualifiers={"interest_text": eng.original_text[:200], "type": "comment_lead"},
                lead_score=45,  # Mid-score — needs follow-up
                is_qualified=False,
                status="new",
                notes=f"comment:{eng.platform_comment_id}",
            )
            db.add(lead)
            captured += 1
            # SSE notification for lead capture
            _emit_sse(eng.user_id, "lead:captured", {
                "lead_id": lead.id, "platform": eng.platform,
                "name": eng.author_name or "Unknown",
            })

        db.commit()
        print(f"✅  Comment-to-lead: captured {captured} new leads")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# search_and_suggest_groups  – weekly task to find new groups per webapp
# ---------------------------------------------------------------------------

@shared_task(name="app.workers.tasks.search_and_suggest_groups")
def search_and_suggest_groups():
    """
    Weekly: for every active webapp of every user, search Facebook and Reddit
    for relevant groups/communities and store them as SUGGESTED in the DB.
    Users will see the suggestions in the Groups dashboard.
    """
    import asyncio
    import uuid

    db: Session = SessionLocal()
    try:
        from app.models.webapp import WebApp
        from app.models.business_group import BusinessGroup, GroupStatus
        from app.models.user_api_key import UserIntegration
        from app.services.group_search import (
            search_groups_for_webapp,
            extract_keywords_from_scraped,
        )

        webapps = db.query(WebApp).filter(WebApp.is_active == True).all()
        total_saved = 0

        for webapp in webapps:
            keywords = extract_keywords_from_scraped(webapp.scraped_data, webapp.name)
            if not keywords:
                keywords = f"{webapp.name} {webapp.category} {webapp.target_audience}"

            # Get FB token for this user if available
            fb_integ = db.query(UserIntegration).filter(
                UserIntegration.user_id == webapp.user_id,
                UserIntegration.platform == "facebook",
                UserIntegration.is_connected == True,
            ).first()
            fb_token = fb_integ.get_access_token() if fb_integ else None

            for platform in ["reddit", "facebook", "telegram", "discord"]:
                if platform == "facebook" and not fb_token:
                    continue
                try:
                    search_loop = asyncio.new_event_loop()
                    try:
                        suggestions = search_loop.run_until_complete(
                            search_groups_for_webapp(
                                platform=platform,
                                keywords=keywords,
                                facebook_token=fb_token,
                                limit=5,
                            )
                        )
                    finally:
                        search_loop.close()
                except Exception as exc:
                    print(f"  ⚠️  Group search error ({platform}): {exc}")
                    continue

                for s in suggestions:
                    existing = db.query(BusinessGroup).filter(
                        BusinessGroup.webapp_id == webapp.id,
                        BusinessGroup.platform == platform,
                        BusinessGroup.group_name == s.group_name,
                    ).first()
                    if existing:
                        continue
                    grp = BusinessGroup(
                        id=str(uuid.uuid4()),
                        user_id=webapp.user_id,
                        webapp_id=webapp.id,
                        platform=platform,
                        group_id=s.group_id or None,
                        group_name=s.group_name,
                        group_url=s.group_url,
                        description=s.description,
                        member_count=s.member_count,
                        status=GroupStatus.SUGGESTED,
                        keywords_used=keywords[:300],
                        compliance_note=(
                            "Join this group manually via the link, "
                            "then click Confirm Join to enable AI posting."
                        ),
                    )
                    db.add(grp)
                    total_saved += 1

        db.commit()
        print(f"✅  Weekly group search complete: {total_saved} new suggestions saved")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# post_to_active_groups  – 3× daily, posts HF-generated content to groups
# ---------------------------------------------------------------------------

@shared_task(name="app.workers.tasks.post_to_active_groups")
def post_to_active_groups():
    """
    3× daily: post AI-generated content to all ACTIVE groups for all users.
    Rate limit: each group receives at most 2 posts per 24-hour window.
    Content is generated specifically for each platform & webapp context.
    """
    import asyncio

    db: Session = SessionLocal()
    try:
        from app.models.webapp import WebApp
        from app.models.business_group import BusinessGroup, GroupStatus
        from app.models.user_api_key import UserIntegration
        from app.services.hf_generator import HuggingFaceGenerator as HFGenerator
        from app.services.posting_service import (
            post_to_facebook_group,
            post_to_reddit,
            post_to_telegram_channel,
            post_to_discord_channel,
        )

        active_groups = (
            db.query(BusinessGroup)
            .filter(
                BusinessGroup.status == GroupStatus.ACTIVE,
                BusinessGroup.group_id != None,
                BusinessGroup.group_id != "",
            )
            .all()
        )

        posted_count = 0

        for grp in active_groups:
            try:
                webapp = db.query(WebApp).filter(WebApp.id == grp.webapp_id).first()
                if not webapp:
                    continue

                hf_token = _get_hf_token(db, webapp.user)
                generator = HFGenerator(hf_token)

                platform = grp.platform.value if hasattr(grp.platform, "value") else str(grp.platform)

                # Generate platform-appropriate content
                try:
                    gen_loop = asyncio.new_event_loop()
                    try:
                        text = gen_loop.run_until_complete(
                            generator.generate_post(
                                business_name=webapp.name,
                                business_description=webapp.description,
                                website_content=str(webapp.scraped_data or {})[:500],
                                platform=platform,
                                content_type="organic group post",
                            )
                        )
                    finally:
                        gen_loop.close()
                except Exception as ge:
                    print(f"  ⚠️  HF generate error for group {grp.id}: {ge}")
                    continue

                # Get platform credentials
                integ = db.query(UserIntegration).filter(
                    UserIntegration.user_id == grp.user_id,
                    UserIntegration.platform == platform,
                    UserIntegration.is_connected == True,
                ).first()

                result = None
                try:
                    posting_loop = asyncio.new_event_loop()
                    try:
                        if platform == "facebook":
                            if not integ:
                                continue
                            result = posting_loop.run_until_complete(
                                post_to_facebook_group(
                                    access_token=integ.get_access_token(),
                                    group_id=grp.group_id,
                                    text=text,
                                    link=webapp.url,
                                )
                            )

                        elif platform == "reddit":
                            if not integ:
                                continue
                            import json
                            creds = {}
                            if integ.platform_data:
                                try:
                                    creds = json.loads(integ.platform_data)
                                except Exception:
                                    pass
                            result = posting_loop.run_until_complete(
                                post_to_reddit(
                                    client_id=creds.get("client_id", ""),
                                    client_secret=creds.get("client_secret", ""),
                                    username=creds.get("username", ""),
                                    password=creds.get("password", ""),
                                    subreddit=grp.group_id,
                                    title=text[:300],
                                    text=text,
                                    url=webapp.url,
                                )
                            )

                        elif platform == "telegram":
                            if not integ:
                                continue
                            result = posting_loop.run_until_complete(
                                post_to_telegram_channel(
                                    bot_token=integ.get_access_token(),
                                    chat_id=grp.group_id,
                                    text=text,
                                )
                            )

                        elif platform == "discord":
                            result = posting_loop.run_until_complete(
                                post_to_discord_channel(
                                    webhook_url=grp.group_id,
                                    text=text,
                                )
                            )
                    finally:
                        posting_loop.close()
                except Exception as pe:
                    print(f"  ⚠️  Post error for group {grp.id} ({platform}): {pe}")
                    continue

                if result and result.success:
                    grp.posts_sent = (grp.posts_sent or 0) + 1
                    posted_count += 1

            except Exception as e:
                print(f"  ⚠️  Error processing group {grp.id}: {e}")
                continue

        db.commit()
        print(f"✅  Group posts complete: {posted_count} posts sent to {len(active_groups)} active groups")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# refresh_all_webapp_scrapes  – nightly re-scrape all webapp URLs
# ---------------------------------------------------------------------------

@shared_task(name="app.workers.tasks.refresh_all_webapp_scrapes")
def refresh_all_webapp_scrapes():
    """
    Nightly at 00:30 UTC: re-scrape every active webapp URL and cache the
    result in webapp.scraped_data for use in content generation & group search.
    """
    import asyncio

    db: Session = SessionLocal()
    try:
        from app.models.webapp import WebApp
        from app.services.scraper import scrape_page

        webapps = db.query(WebApp).filter(WebApp.is_active == True).all()
        refreshed = 0

        for webapp in webapps:
            try:
                scrape_loop = asyncio.new_event_loop()
                try:
                    page = scrape_loop.run_until_complete(scrape_page(webapp.url))
                finally:
                    scrape_loop.close()
                if not page.error:
                    webapp.scraped_data = {
                        "title": page.title,
                        "meta_description": page.meta_description,
                        "headings": page.headings[:10],
                        "paragraphs": page.paragraphs[:5],
                        "full_text": page.full_text[:2000],
                        "social_links": page.social_links,
                    }
                    refreshed += 1
            except Exception as exc:
                print(f"  ⚠️  Scrape error for {webapp.url}: {exc}")

        db.commit()
        print(f"✅  Nightly scrape refresh: {refreshed}/{len(webapps)} webapps updated")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# send_weekly_digest_emails  – weekly digest email for all users
# ---------------------------------------------------------------------------

@shared_task(name="app.workers.tasks.send_weekly_digest_emails")
def send_weekly_digest_emails():
    """
    Weekly on Monday at 09:00 UTC: send a digest email summarising last week's
    content performance to every user who has notification_email enabled.
    """
    from app.services.email_service import send_weekly_digest

    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        sent = 0
        for user in users:
            prefs = user.notification_preferences or {}
            if not prefs.get("email", True):
                continue
            if not user.email:
                continue

            # Gather stats for last 7 days
            cutoff = datetime.utcnow() - timedelta(days=7)
            from sqlalchemy import func
            posted = (
                db.query(Content)
                .filter(
                    Content.user_id == user.id,
                    Content.status == ContentStatus.POSTED,
                    Content.posted_at >= cutoff,
                )
            )
            total_posts = posted.count()
            total_views = (
                db.query(func.coalesce(func.sum(Content.views), 0))
                .filter(
                    Content.user_id == user.id,
                    Content.status == ContentStatus.POSTED,
                    Content.posted_at >= cutoff,
                )
                .scalar()
            ) or 0
            total_engagement = 0
            try:
                rows = posted.all()
                for c in rows:
                    total_engagement += (getattr(c, "likes", 0) or 0) + (getattr(c, "comments", 0) or 0) + (getattr(c, "shares", 0) or 0)
            except Exception:
                pass
            avg_rate = (total_engagement / max(total_views, 1)) * 100 if total_views else 0.0

            stats = {
                "total_posts": total_posts,
                "total_views": int(total_views),
                "avg_engagement_rate": round(avg_rate, 1),
            }
            try:
                send_weekly_digest(user.email, user.name, stats)
                sent += 1
            except Exception as exc:
                print(f"  ⚠️  Digest email failed for {user.email}: {exc}")

        print(f"✅  Weekly digest: {sent} emails sent")
    finally:
        db.close()
