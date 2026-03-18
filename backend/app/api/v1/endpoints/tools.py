"""
Power Tools Unified Endpoint – all 10 AI add-on tools.

Tools:
  1. remix          – Content Remix Engine (handled separately in remix.py too)
  2. competitor     – Competitor Shadow Analyzer
  3. feedback       – Feedback Alchemy Platform
  4. echo           – Social Echo Amplifier
  5. seo_mirage     – SEO Mirage Creator
  6. churn_shield   – Churn Shield Defender
  7. harmony_pricer – Dynamic Harmony Pricer
  8. viral_spark    – Viral Spark Igniter
  9. audience_map   – Audience Mirage Mapper
 10. ad_alchemy     – Ad Alchemy Optimizer

Designed and created by Amarktai Network
"""

from __future__ import annotations

import uuid
from datetime import datetime, date
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.tools import (
    CompetitorProfile, FeedbackAnalysis, EchoAmplification,
    SeoMirageReport, ChurnShieldReport, HarmonyPricerReport,
    ViralSparkReport, AudienceMapReport, AdAlchemyReport,
)
from app.models.user import User
from app.models.user_api_key import UserAPIKey

router = APIRouter()


# ─── Shared helper ───────────────────────────────────────────────────────────

def _get_hf_token(db: Session, user: User) -> str | None:
    row = db.query(UserAPIKey).filter(
        UserAPIKey.user_id == user.id,
        UserAPIKey.key_name == "HUGGINGFACE_TOKEN",
        UserAPIKey.is_active == True,
    ).first()
    if row:
        return row.get_decrypted_key()
    return settings.HUGGINGFACE_TOKEN or None


def _require_hf(db: Session, user: User) -> str:
    token = _get_hf_token(db, user)
    if not token:
        raise HTTPException(
            status_code=503,
            detail="AI content generation is not configured. Add your AI token in Integrations or contact your admin.",
        )
    return token


# ═══════════════════════════════════════════════════════════════════════════════
# 2. COMPETITOR SHADOW ANALYZER
# ═══════════════════════════════════════════════════════════════════════════════

class CompetitorCreate(BaseModel):
    competitor_name: str
    competitor_url: str
    our_niche: str | None = None
    social_handles: dict[str, str] = {}


async def _run_competitor_analysis(profile_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    from app.services.scraper import scrape_page
    db = SessionLocal()
    try:
        profile = db.query(CompetitorProfile).filter(CompetitorProfile.id == profile_id).first()
        if not profile:
            return
        gen = HuggingFaceGenerator(hf_token)

        page = await scrape_page(profile.competitor_url)
        scraped = page.full_text or f"Company: {profile.competitor_name}"
        profile.scraped_content_preview = scraped[:500]
        profile.last_scraped_at = datetime.utcnow()

        insights = await gen.generate_competitor_insights(
            profile.competitor_name, scraped, profile.our_niche or "marketing"
        )
        # Predicted next moves (extra expansion feature)
        next_moves_prompt = (
            f"Based on {profile.competitor_name}'s strategy: {insights.get('content_strategy','')}, "
            "predict their next 3 likely social moves as a JSON array."
        )
        try:
            import re, json
            raw = await gen._call_text_generation(gen._inference_url, next_moves_prompt, 200)
            match = re.search(r"\[.*?\]", raw, re.DOTALL)
            profile.predicted_next_moves = json.loads(match.group()) if match else []
        except Exception:
            profile.predicted_next_moves = []

        profile.content_strategy = insights.get("content_strategy", "")
        profile.strengths = insights.get("strengths", [])
        profile.weaknesses = insights.get("weaknesses", [])
        profile.content_gaps = insights.get("content_gaps", [])
        profile.counter_strategies = insights.get("recommended_counter_strategies", [])
        profile.top_topics = insights.get("top_topics", [])
        profile.posting_frequency = insights.get("estimated_posting_frequency", "")
        profile.engagement_level = insights.get("audience_engagement_level", "medium")
        db.commit()
    except Exception as exc:
        print(f"❌ Competitor analysis failed: {exc}")
    finally:
        db.close()


@router.post("/competitor", status_code=202)
async def add_competitor(
    body: CompetitorCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Add a competitor to track. Analysis runs in background."""
    hf_token = _require_hf(db, current_user)
    profile = CompetitorProfile(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        competitor_name=body.competitor_name,
        competitor_url=body.competitor_url,
        our_niche=body.our_niche,
        social_handles=body.social_handles,
    )
    db.add(profile)
    db.commit()
    background_tasks.add_task(_run_competitor_analysis, profile.id, hf_token)
    return {"id": profile.id, "status": "analysis_queued"}


@router.get("/competitor")
async def list_competitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    profiles = db.query(CompetitorProfile).filter(
        CompetitorProfile.user_id == current_user.id,
        CompetitorProfile.is_active == True,
    ).order_by(CompetitorProfile.created_at.desc()).all()
    return [
        {
            "id": p.id, "competitor_name": p.competitor_name,
            "competitor_url": p.competitor_url, "our_niche": p.our_niche,
            "engagement_level": p.engagement_level,
            "content_gaps_count": len(p.content_gaps or []),
            "last_scraped_at": p.last_scraped_at.isoformat() if p.last_scraped_at else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in profiles
    ]


@router.get("/competitor/{profile_id}")
async def get_competitor(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    p = db.query(CompetitorProfile).filter(
        CompetitorProfile.id == profile_id,
        CompetitorProfile.user_id == current_user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return {
        "id": p.id, "competitor_name": p.competitor_name, "competitor_url": p.competitor_url,
        "our_niche": p.our_niche, "social_handles": p.social_handles,
        "content_strategy": p.content_strategy, "strengths": p.strengths,
        "weaknesses": p.weaknesses, "content_gaps": p.content_gaps,
        "counter_strategies": p.counter_strategies, "top_topics": p.top_topics,
        "posting_frequency": p.posting_frequency, "engagement_level": p.engagement_level,
        "predicted_next_moves": p.predicted_next_moves,
        "scraped_content_preview": p.scraped_content_preview,
        "last_scraped_at": p.last_scraped_at.isoformat() if p.last_scraped_at else None,
    }


@router.post("/competitor/{profile_id}/refresh", status_code=202)
async def refresh_competitor(
    profile_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Re-run analysis for an existing competitor."""
    hf_token = _require_hf(db, current_user)
    p = db.query(CompetitorProfile).filter(
        CompetitorProfile.id == profile_id, CompetitorProfile.user_id == current_user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Competitor not found")
    background_tasks.add_task(_run_competitor_analysis, profile_id, hf_token)
    return {"message": "Re-analysis queued"}


@router.delete("/competitor/{profile_id}", status_code=204)
async def delete_competitor(
    profile_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(CompetitorProfile).filter(
        CompetitorProfile.id == profile_id, CompetitorProfile.user_id == current_user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Competitor not found")
    p.is_active = False
    db.commit()


# ═══════════════════════════════════════════════════════════════════════════════
# 3. FEEDBACK ALCHEMY PLATFORM
# ═══════════════════════════════════════════════════════════════════════════════

class FeedbackCreate(BaseModel):
    feedback_texts: list[str]
    source: str = "manual"
    webapp_id: str | None = None
    business_context: str = ""
    auto_apply_to_templates: bool = False


async def _run_feedback_analysis(analysis_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    db = SessionLocal()
    try:
        fa = db.query(FeedbackAnalysis).filter(FeedbackAnalysis.id == analysis_id).first()
        if not fa:
            return
        gen = HuggingFaceGenerator(hf_token)
        texts = fa.raw_feedback or []

        # Individual sentiment scores
        sentiments = []
        for text in texts[:10]:
            s = await gen.analyze_sentiment(text)
            sentiments.append(s["score"] if s["label"] == "POSITIVE" else 1 - s["score"])
        avg_score = sum(sentiments) / len(sentiments) if sentiments else 0.5
        fa.sentiment_score = round(avg_score, 3)
        fa.overall_sentiment = "positive" if avg_score > 0.6 else "negative" if avg_score < 0.4 else "mixed"

        # Full insights from HF
        ctx = fa.raw_feedback[0][:200] if fa.raw_feedback else "general business"
        insights = await gen.generate_feedback_insights(texts, ctx)
        fa.key_themes = insights.get("key_themes", [])
        fa.praise_points = insights.get("praise_points", [])
        fa.pain_points = insights.get("pain_points", [])
        fa.ad_copy_suggestions = insights.get("ad_copy_suggestions", [])
        fa.response_templates = insights.get("response_templates", [])
        fa.ab_test_ideas = insights.get("ab_test_ideas", [])
        fa.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ Feedback analysis failed: {exc}")
    finally:
        db.close()


@router.post("/feedback", status_code=202)
async def create_feedback_analysis(
    body: FeedbackCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    if not body.feedback_texts:
        raise HTTPException(status_code=400, detail="At least one feedback text required")
    fa = FeedbackAnalysis(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        webapp_id=body.webapp_id,
        source=body.source,
        raw_feedback=body.feedback_texts,
        auto_apply_to_templates=body.auto_apply_to_templates,
        status="pending",
    )
    db.add(fa)
    db.commit()
    background_tasks.add_task(_run_feedback_analysis, fa.id, hf_token)
    return {"id": fa.id, "status": "pending"}


@router.get("/feedback")
async def list_feedback_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    analyses = db.query(FeedbackAnalysis).filter(
        FeedbackAnalysis.user_id == current_user.id
    ).order_by(FeedbackAnalysis.created_at.desc()).limit(30).all()
    return [
        {
            "id": a.id, "source": a.source,
            "overall_sentiment": a.overall_sentiment,
            "sentiment_score": a.sentiment_score,
            "feedback_count": len(a.raw_feedback or []),
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in analyses
    ]


@router.get("/feedback/{analysis_id}")
async def get_feedback_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    a = db.query(FeedbackAnalysis).filter(
        FeedbackAnalysis.id == analysis_id,
        FeedbackAnalysis.user_id == current_user.id,
    ).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {
        "id": a.id, "source": a.source, "overall_sentiment": a.overall_sentiment,
        "sentiment_score": a.sentiment_score, "key_themes": a.key_themes,
        "praise_points": a.praise_points, "pain_points": a.pain_points,
        "ad_copy_suggestions": a.ad_copy_suggestions,
        "response_templates": a.response_templates, "ab_test_ideas": a.ab_test_ideas,
        "status": a.status,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 4. SOCIAL ECHO AMPLIFIER
# ═══════════════════════════════════════════════════════════════════════════════

class EchoRequest(BaseModel):
    trigger_text: str
    trigger_source: str = "chat"
    brand_voice: str = "professional and engaging"
    target_platforms: list[str] = ["twitter", "instagram", "linkedin"]


async def _run_echo_amplification(echo_id: str, hf_token: str, platforms: list[str]):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    db = SessionLocal()
    try:
        echo = db.query(EchoAmplification).filter(EchoAmplification.id == echo_id).first()
        if not echo:
            return
        gen = HuggingFaceGenerator(hf_token)
        thread_posts = []
        for platform in platforms:
            snippet = await gen.remix_to_platform(echo.trigger_text, platform)
            snippet["platform"] = platform
            thread_posts.append(snippet)

        # Virality scoring
        sentiment = await gen.analyze_sentiment(echo.trigger_text)
        echo.virality_score = round(sentiment["score"] * 100, 1)
        echo.priority = "high" if echo.virality_score > 70 else "medium" if echo.virality_score > 40 else "low"
        echo.thread_posts = thread_posts
        echo.story_content = thread_posts[:2]  # first 2 as story variants
        echo.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ Echo amplification failed: {exc}")
    finally:
        db.close()


@router.post("/echo", status_code=202)
async def create_echo_amplification(
    body: EchoRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    echo = EchoAmplification(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        trigger_text=body.trigger_text,
        trigger_source=body.trigger_source,
        brand_voice=body.brand_voice,
        status="pending",
    )
    db.add(echo)
    db.commit()
    background_tasks.add_task(_run_echo_amplification, echo.id, hf_token, body.target_platforms)
    return {"id": echo.id, "status": "pending"}


@router.get("/echo")
async def list_echoes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    items = db.query(EchoAmplification).filter(
        EchoAmplification.user_id == current_user.id
    ).order_by(EchoAmplification.created_at.desc()).limit(30).all()
    return [
        {
            "id": i.id, "trigger_text": i.trigger_text[:100],
            "trigger_source": i.trigger_source, "virality_score": i.virality_score,
            "priority": i.priority, "post_count": len(i.thread_posts or []),
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in items
    ]


@router.get("/echo/{echo_id}")
async def get_echo(
    echo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    i = db.query(EchoAmplification).filter(
        EchoAmplification.id == echo_id, EchoAmplification.user_id == current_user.id,
    ).first()
    if not i:
        raise HTTPException(status_code=404, detail="Echo not found")
    return {
        "id": i.id, "trigger_text": i.trigger_text, "trigger_source": i.trigger_source,
        "brand_voice": i.brand_voice, "thread_posts": i.thread_posts,
        "story_content": i.story_content, "virality_score": i.virality_score,
        "priority": i.priority, "status": i.status,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 5. SEO MIRAGE CREATOR
# ═══════════════════════════════════════════════════════════════════════════════

class SeoMirageRequest(BaseModel):
    input_text: str | None = None
    target_url: str | None = None
    platform: str = "instagram"
    content_id: str | None = None


async def _run_seo_mirage(report_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    from app.services.scraper import scrape_page
    db = SessionLocal()
    try:
        r = db.query(SeoMirageReport).filter(SeoMirageReport.id == report_id).first()
        if not r:
            return
        gen = HuggingFaceGenerator(hf_token)
        text = r.input_text or ""
        if r.target_url and not text:
            page = await scrape_page(r.target_url)
            text = page.full_text

        keywords = await gen.extract_keywords(text, 12)
        platform_hint = {
            "instagram": "Use storytelling and emojis. Instagram favors Reels with 3-5 hashtags in caption + 15-20 in first comment.",
            "tiktok": "Hook in first 3 seconds. Use trending sounds reference. 3-5 hashtags. Short punchy text.",
            "youtube": "SEO title with keyword first. Description with timestamp links. Tags matter.",
            "linkedin": "Professional tone. No hashtag spam. Bold hook line. Call to action.",
            "twitter": "Character limit matters. 1-2 hashtags max. Engage with question.",
            "facebook": "Conversational. Link preview matters. 1-3 hashtags.",
        }.get(r.platform, "Optimise for engagement and discoverability.")

        import re, json
        seo_prompt = f"""Generate SEO-optimised social media metadata for {r.platform}.

Content: {text[:800]}
Keywords found: {', '.join(keywords[:8])}
Platform tip: {platform_hint}

Respond ONLY with JSON:
{{
  "seo_title": "...",
  "seo_description": "...",
  "alt_text": "descriptive alt text for the image",
  "optimized_hashtags": ["tag1","tag2"],
  "algorithm_tips": ["tip1","tip2","tip3"],
  "enhanced_caption": "full enhanced caption"
}}"""
        raw = await gen._call_text_generation(gen._inference_url, seo_prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(match.group()) if match else {}
        except Exception:
            data = {}

        r.seo_title = data.get("seo_title", "")
        r.seo_description = data.get("seo_description", "")
        r.alt_text = data.get("alt_text", "")
        r.optimized_hashtags = data.get("optimized_hashtags", keywords[:10])
        r.keyword_density_report = {k: 1 for k in keywords}
        r.algorithm_tips = data.get("algorithm_tips", [])
        r.enhanced_caption = data.get("enhanced_caption", "")
        r.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ SEO Mirage failed: {exc}")
    finally:
        db.close()


@router.post("/seo-mirage", status_code=202)
async def create_seo_mirage(
    body: SeoMirageRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    if not body.input_text and not body.target_url:
        raise HTTPException(status_code=400, detail="input_text or target_url required")
    r = SeoMirageReport(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        content_id=body.content_id,
        input_text=body.input_text,
        target_url=body.target_url,
        platform=body.platform,
        status="pending",
    )
    db.add(r)
    db.commit()
    background_tasks.add_task(_run_seo_mirage, r.id, hf_token)
    return {"id": r.id, "status": "pending"}


@router.get("/seo-mirage/{report_id}")
async def get_seo_mirage(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    r = db.query(SeoMirageReport).filter(
        SeoMirageReport.id == report_id, SeoMirageReport.user_id == current_user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": r.id, "platform": r.platform, "seo_title": r.seo_title,
        "seo_description": r.seo_description, "alt_text": r.alt_text,
        "optimized_hashtags": r.optimized_hashtags,
        "keyword_density_report": r.keyword_density_report,
        "algorithm_tips": r.algorithm_tips, "enhanced_caption": r.enhanced_caption,
        "status": r.status,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 6. CHURN SHIELD DEFENDER
# ═══════════════════════════════════════════════════════════════════════════════

class ChurnShieldRequest(BaseModel):
    platform: str
    audience_data_summary: str  # e.g. "Lost 200 followers last week, engagement dropped 15%"
    brand_voice: str = "warm and encouraging"


async def _run_churn_shield(report_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    import re, json
    db = SessionLocal()
    try:
        r = db.query(ChurnShieldReport).filter(ChurnShieldReport.id == report_id).first()
        if not r:
            return
        gen = HuggingFaceGenerator(hf_token)

        # Use audience data from the report (stored in dropout_patterns temporarily)
        audience_summary = (r.dropout_patterns or [""])[0] if r.dropout_patterns else "general audience drop"

        prompt = f"""You are a retention marketing expert. Analyse this audience churn situation and provide a retention plan.

Platform: {r.platform}
Audience data: {audience_summary}

Respond ONLY with JSON:
{{
  "churn_risk_score": 65,
  "at_risk_segments": ["inactive followers","recent unfollowers"],
  "dropout_patterns": ["low engagement on weekends","posts too frequent"],
  "reengagement_posts": [
    {{"title": "We miss you!", "caption": "...", "platform": "{r.platform}", "hashtags": []}},
    {{"title": "Behind the scenes", "caption": "...", "platform": "{r.platform}", "hashtags": []}}
  ],
  "dm_templates": [
    {{"scenario": "inactive 30 days", "template": "Hey {{name}}, we noticed..."}}
  ],
  "loyalty_campaign": {{
    "name": "Win-Back Week",
    "description": "...",
    "duration_days": 7,
    "posts_per_day": 2
  }}
}}"""
        raw = await gen._call_text_generation(gen._inference_url, prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(match.group()) if match else {}
        except Exception:
            data = {}

        r.churn_risk_score = data.get("churn_risk_score", 50)
        r.at_risk_segments = data.get("at_risk_segments", [])
        r.dropout_patterns = data.get("dropout_patterns", [])
        r.reengagement_posts = data.get("reengagement_posts", [])
        r.dm_templates = data.get("dm_templates", [])
        r.loyalty_campaign = data.get("loyalty_campaign", {})
        r.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ Churn Shield failed: {exc}")
    finally:
        db.close()


@router.post("/churn-shield", status_code=202)
async def create_churn_shield(
    body: ChurnShieldRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    r = ChurnShieldReport(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        platform=body.platform,
        analysis_date=str(date.today()),
        dropout_patterns=[body.audience_data_summary],  # store input temporarily
        status="pending",
    )
    db.add(r)
    db.commit()
    background_tasks.add_task(_run_churn_shield, r.id, hf_token)
    return {"id": r.id, "status": "pending"}


@router.get("/churn-shield")
async def list_churn_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    reports = db.query(ChurnShieldReport).filter(
        ChurnShieldReport.user_id == current_user.id
    ).order_by(ChurnShieldReport.created_at.desc()).limit(20).all()
    return [
        {
            "id": r.id, "platform": r.platform, "churn_risk_score": r.churn_risk_score,
            "analysis_date": r.analysis_date, "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


@router.get("/churn-shield/{report_id}")
async def get_churn_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    r = db.query(ChurnShieldReport).filter(
        ChurnShieldReport.id == report_id, ChurnShieldReport.user_id == current_user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": r.id, "platform": r.platform, "churn_risk_score": r.churn_risk_score,
        "at_risk_segments": r.at_risk_segments, "dropout_patterns": r.dropout_patterns,
        "reengagement_posts": r.reengagement_posts, "dm_templates": r.dm_templates,
        "loyalty_campaign": r.loyalty_campaign, "status": r.status,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 7. DYNAMIC HARMONY PRICER
# ═══════════════════════════════════════════════════════════════════════════════

class HarmonyPricerRequest(BaseModel):
    product_name: str
    current_price: str
    platform: str = "facebook"
    competitor_prices: list[str] = []
    market_buzz: str = ""  # e.g. "trending search term, high demand"


async def _run_harmony_pricer(report_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    import re, json
    db = SessionLocal()
    try:
        r = db.query(HarmonyPricerReport).filter(HarmonyPricerReport.id == report_id).first()
        if not r:
            return
        gen = HuggingFaceGenerator(hf_token)
        sentiment = await gen.analyze_sentiment(r.product_name + " " + (r.simulated_roi or {}).get("buzz", ""))
        r.sentiment_score = round(sentiment["score"], 3)
        r.buzz_score = round(r.sentiment_score * 100, 1)

        comp_prices_str = ", ".join(r.competitor_prices) if r.competitor_prices else "unknown"
        prompt = f"""You are a pricing strategist for social media ads.

Product: {r.product_name}
Current price: {r.current_price}
Competitor prices: {comp_prices_str}
Market buzz score: {r.buzz_score}/100
Platform: {r.platform}

Respond ONLY with JSON:
{{
  "recommended_price": "$X.XX",
  "price_rationale": "brief explanation",
  "ad_copy_variants": [
    {{"price_point": "$X", "headline": "...", "body": "...", "cta": "..."}},
    {{"price_point": "$Y", "headline": "...", "body": "...", "cta": "..."}}
  ],
  "simulated_roi": {{
    "low": "X%", "mid": "Y%", "high": "Z%"
  }}
}}"""
        raw = await gen._call_text_generation(gen._inference_url, prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(match.group()) if match else {}
        except Exception:
            data = {}

        r.recommended_price = data.get("recommended_price", r.current_price)
        r.price_rationale = data.get("price_rationale", "")
        r.ad_copy_variants = data.get("ad_copy_variants", [])
        r.simulated_roi = data.get("simulated_roi", {})
        r.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ Harmony Pricer failed: {exc}")
    finally:
        db.close()


@router.post("/harmony-pricer", status_code=202)
async def create_harmony_pricer(
    body: HarmonyPricerRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    r = HarmonyPricerReport(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        product_name=body.product_name,
        current_price=body.current_price,
        platform=body.platform,
        competitor_prices=body.competitor_prices,
        simulated_roi={"buzz": body.market_buzz},
        status="pending",
    )
    db.add(r)
    db.commit()
    background_tasks.add_task(_run_harmony_pricer, r.id, hf_token)
    return {"id": r.id, "status": "pending"}


@router.get("/harmony-pricer/{report_id}")
async def get_harmony_pricer(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    r = db.query(HarmonyPricerReport).filter(
        HarmonyPricerReport.id == report_id, HarmonyPricerReport.user_id == current_user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": r.id, "product_name": r.product_name, "current_price": r.current_price,
        "recommended_price": r.recommended_price, "price_rationale": r.price_rationale,
        "buzz_score": r.buzz_score, "sentiment_score": r.sentiment_score,
        "ad_copy_variants": r.ad_copy_variants, "simulated_roi": r.simulated_roi,
        "status": r.status,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 8. VIRAL SPARK IGNITER
# ═══════════════════════════════════════════════════════════════════════════════

class ViralSparkRequest(BaseModel):
    niche: str
    brand_voice: str = "energetic and authentic"
    webapp_id: str | None = None
    auto_inject_hooks: bool = False


async def _run_viral_spark(report_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    import re, json
    db = SessionLocal()
    try:
        r = db.query(ViralSparkReport).filter(ViralSparkReport.id == report_id).first()
        if not r:
            return
        gen = HuggingFaceGenerator(hf_token)
        today = str(date.today())

        prompt = f"""You are a viral content strategist. Generate a viral opportunity report.

Niche: {r.niche}
Brand voice: energetic and authentic
Date: {today}

Respond ONLY with JSON:
{{
  "trending_topics": ["topic1","topic2","topic3"],
  "viral_opportunities": [
    {{"topic": "...", "score": 85, "hook": "...", "challenge": "..."}},
    {{"topic": "...", "score": 72, "hook": "...", "challenge": "..."}}
  ],
  "hooks": ["hook1","hook2","hook3"],
  "challenges": ["challenge1","challenge2"],
  "best_posting_windows": [
    {{"platform":"instagram","time":"18:00","reason":"peak engagement"}},
    {{"platform":"tiktok","time":"20:00","reason":"highest discovery rate"}}
  ],
  "predicted_reach_multiplier": 2.3
}}"""
        raw = await gen._call_text_generation(gen._inference_url, prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(match.group()) if match else {}
        except Exception:
            data = {}

        r.trending_topics = data.get("trending_topics", [])
        r.viral_opportunities = data.get("viral_opportunities", [])
        r.hooks = data.get("hooks", [])
        r.challenges = data.get("challenges", [])
        r.best_posting_windows = data.get("best_posting_windows", [])
        r.predicted_reach_multiplier = data.get("predicted_reach_multiplier", 1.0)
        r.report_date = today
        r.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ Viral Spark failed: {exc}")
    finally:
        db.close()


@router.post("/viral-spark", status_code=202)
async def create_viral_spark(
    body: ViralSparkRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    r = ViralSparkReport(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        webapp_id=body.webapp_id,
        niche=body.niche,
        auto_inject_hooks=body.auto_inject_hooks,
        status="pending",
    )
    db.add(r)
    db.commit()
    background_tasks.add_task(_run_viral_spark, r.id, hf_token)
    return {"id": r.id, "status": "pending"}


@router.get("/viral-spark")
async def list_viral_sparks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    items = db.query(ViralSparkReport).filter(
        ViralSparkReport.user_id == current_user.id
    ).order_by(ViralSparkReport.created_at.desc()).limit(20).all()
    return [
        {
            "id": i.id, "niche": i.niche, "report_date": i.report_date,
            "predicted_reach_multiplier": i.predicted_reach_multiplier,
            "opportunity_count": len(i.viral_opportunities or []),
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in items
    ]


@router.get("/viral-spark/{report_id}")
async def get_viral_spark(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    r = db.query(ViralSparkReport).filter(
        ViralSparkReport.id == report_id, ViralSparkReport.user_id == current_user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": r.id, "niche": r.niche, "report_date": r.report_date,
        "trending_topics": r.trending_topics, "viral_opportunities": r.viral_opportunities,
        "hooks": r.hooks, "challenges": r.challenges,
        "best_posting_windows": r.best_posting_windows,
        "predicted_reach_multiplier": r.predicted_reach_multiplier, "status": r.status,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 9. AUDIENCE MIRAGE MAPPER
# ═══════════════════════════════════════════════════════════════════════════════

class AudienceMapRequest(BaseModel):
    platform: str = "instagram"
    data_summary: str  # e.g. "18-35 age group, 60% female, interests: fitness, travel, tech"
    webapp_id: str | None = None


async def _run_audience_map(report_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    import re, json
    db = SessionLocal()
    try:
        r = db.query(AudienceMapReport).filter(AudienceMapReport.id == report_id).first()
        if not r:
            return
        gen = HuggingFaceGenerator(hf_token)
        prompt = f"""You are an audience psychographic analyst.

Platform: {r.platform}
Audience data: {r.data_summary}

Respond ONLY with JSON:
{{
  "segments": [
    {{"name":"Early Adopters","description":"...","size_pct":25,"interests":["tech","innovation"],"best_content_type":"short-video"}},
    {{"name":"Value Seekers","description":"...","size_pct":40,"interests":["deals","reviews"],"best_content_type":"carousel"}}
  ],
  "campaign_suggestions": [
    {{"segment":"Early Adopters","campaign_idea":"...","platform":"{r.platform}","estimated_ctr":"3.2%"}}
  ],
  "targeting_recommendations": ["Use lookalike audiences from top engagers","Target interest clusters"],
  "cross_platform_insights": ["Early Adopters also active on LinkedIn","Value Seekers dominate Facebook groups"],
  "response_mirage": {{
    "Early Adopters": {{"predicted_ctr":"4.1%","predicted_engagement_rate":"6.2%"}},
    "Value Seekers": {{"predicted_ctr":"2.8%","predicted_engagement_rate":"4.5%"}}
  }}
}}"""
        raw = await gen._call_text_generation(gen._inference_url, prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(match.group()) if match else {}
        except Exception:
            data = {}

        r.segments = data.get("segments", [])
        r.campaign_suggestions = data.get("campaign_suggestions", [])
        r.targeting_recommendations = data.get("targeting_recommendations", [])
        r.cross_platform_insights = data.get("cross_platform_insights", [])
        r.response_mirage = data.get("response_mirage", {})
        r.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ Audience Map failed: {exc}")
    finally:
        db.close()


@router.post("/audience-map", status_code=202)
async def create_audience_map(
    body: AudienceMapRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    r = AudienceMapReport(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        webapp_id=body.webapp_id,
        platform=body.platform,
        data_summary=body.data_summary,
        status="pending",
    )
    db.add(r)
    db.commit()
    background_tasks.add_task(_run_audience_map, r.id, hf_token)
    return {"id": r.id, "status": "pending"}


@router.get("/audience-map/{report_id}")
async def get_audience_map(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    r = db.query(AudienceMapReport).filter(
        AudienceMapReport.id == report_id, AudienceMapReport.user_id == current_user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": r.id, "platform": r.platform, "segments": r.segments,
        "campaign_suggestions": r.campaign_suggestions,
        "targeting_recommendations": r.targeting_recommendations,
        "cross_platform_insights": r.cross_platform_insights,
        "response_mirage": r.response_mirage, "status": r.status,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 10. AD ALCHEMY OPTIMIZER
# ═══════════════════════════════════════════════════════════════════════════════

class AdAlchemyRequest(BaseModel):
    product_or_service: str
    platform: str = "facebook"
    current_copy: str | None = None
    content_id: str | None = None
    auto_deploy_winner: bool = False


async def _run_ad_alchemy(report_id: str, hf_token: str):
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    import re, json
    db = SessionLocal()
    try:
        r = db.query(AdAlchemyReport).filter(AdAlchemyReport.id == report_id).first()
        if not r:
            return
        gen = HuggingFaceGenerator(hf_token)
        prompt = f"""You are a performance ad copywriter running A/B tests.

Product/Service: {r.product_or_service}
Platform: {r.platform}
Current copy: {r.current_copy or "none provided"}

Generate 3 A/B test variants and pick a winner. Respond ONLY with JSON:
{{
  "variants": [
    {{"variant_id":"A","headline":"...","body":"...","cta":"Shop Now","score":72,"rationale":"..."}},
    {{"variant_id":"B","headline":"...","body":"...","cta":"Learn More","score":85,"rationale":"..."}},
    {{"variant_id":"C","headline":"...","body":"...","cta":"Get Started","score":78,"rationale":"..."}}
  ],
  "recommended_winner": {{"variant_id":"B","reason":"highest predicted CTR due to urgency framing"}},
  "global_benchmark_comparison": {{"avg_ctr":"2.1%","your_predicted_ctr":"3.4%","improvement":"+62%"}},
  "improvement_suggestions": ["Add social proof","Use numbers in headline","Test emoji in CTA"]
}}"""
        raw = await gen._call_text_generation(gen._inference_url, prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(match.group()) if match else {}
        except Exception:
            data = {}

        r.variants = data.get("variants", [])
        r.recommended_winner = data.get("recommended_winner", {})
        r.global_benchmark_comparison = data.get("global_benchmark_comparison", {})
        r.improvement_suggestions = data.get("improvement_suggestions", [])
        r.status = "done"
        db.commit()
    except Exception as exc:
        print(f"❌ Ad Alchemy failed: {exc}")
    finally:
        db.close()


@router.post("/ad-alchemy", status_code=202)
async def create_ad_alchemy(
    body: AdAlchemyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    hf_token = _require_hf(db, current_user)
    r = AdAlchemyReport(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        product_or_service=body.product_or_service,
        platform=body.platform,
        current_copy=body.current_copy,
        content_id=body.content_id,
        auto_deploy_winner=body.auto_deploy_winner,
        status="pending",
    )
    db.add(r)
    db.commit()
    background_tasks.add_task(_run_ad_alchemy, r.id, hf_token)
    return {"id": r.id, "status": "pending"}


@router.get("/ad-alchemy/{report_id}")
async def get_ad_alchemy(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    r = db.query(AdAlchemyReport).filter(
        AdAlchemyReport.id == report_id, AdAlchemyReport.user_id == current_user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": r.id, "product_or_service": r.product_or_service, "platform": r.platform,
        "variants": r.variants, "recommended_winner": r.recommended_winner,
        "global_benchmark_comparison": r.global_benchmark_comparison,
        "improvement_suggestions": r.improvement_suggestions, "status": r.status,
    }
