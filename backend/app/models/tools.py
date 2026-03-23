"""
DB models for all 10 power tools:
  1. ContentRemix          – Content Remix Engine
  2. CompetitorProfile     – Competitor Shadow Analyzer
  3. FeedbackAnalysis      – Feedback Alchemy Platform
  4. EchoAmplification     – Social Echo Amplifier
  5. SeoMirageReport       – SEO Mirage Creator
  6. ChurnShieldReport     – Churn Shield Defender
  7. HarmonyPricerReport   – Dynamic Harmony Pricer
  8. ViralSparkReport      – Viral Spark Igniter
  9. AudienceMapReport     – Audience Mirage Mapper
 10. AdAlchemyReport       – Ad Alchemy Optimizer
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text, Boolean, Float, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


# ── 1. Content Remix Engine ──────────────────────────────────────────────────

class ContentRemix(Base):
    """A single remix job: source content → N platform snippets."""
    __tablename__ = "content_remixes"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String(36), ForeignKey("webapps.id"), nullable=True)

    source_type = Column(String(16), nullable=False)          # url | text
    source_url = Column(String(512), nullable=True)
    source_text = Column(Text, nullable=True)
    source_title = Column(String(512), nullable=True)

    target_platforms = Column(JSON, default=list)
    snippets = Column(JSON, default=list)                 # [{platform, title, caption, hashtags, key_points}]
    trending_hashtags = Column(JSON, default=list)

    # Integration with core scheduler
    auto_schedule = Column(Boolean, default=False)        # auto-queue approved snippets
    remix_booster_enabled = Column(Boolean, default=False)

    status = Column(String(32), default="pending")        # pending|processing|done|failed
    error_message = Column(String(512), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 2. Competitor Shadow Analyzer ────────────────────────────────────────────

class CompetitorProfile(Base):
    """One competitor tracked with latest analysis report."""
    __tablename__ = "competitor_profiles"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    competitor_name = Column(String(255), nullable=False)
    competitor_url = Column(String(512), nullable=False)
    social_handles = Column(JSON, default=dict)           # {twitter: "@handle", ...}
    our_niche = Column(String(255), nullable=True)

    last_scraped_at = Column(DateTime(timezone=True), nullable=True)
    scraped_content_preview = Column(Text, nullable=True)

    content_strategy = Column(Text, nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    content_gaps = Column(JSON, default=list)
    counter_strategies = Column(JSON, default=list)
    top_topics = Column(JSON, default=list)
    posting_frequency = Column(String(64), nullable=True)
    engagement_level = Column(String(32), nullable=True)
    sentiment_score = Column(Float, nullable=True)
    predicted_next_moves = Column(JSON, default=list)     # expansion: pattern-based predictions

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 3. Feedback Alchemy Platform ─────────────────────────────────────────────

class FeedbackAnalysis(Base):
    """A batch of feedback transformed into marketing recommendations."""
    __tablename__ = "feedback_analyses"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String(36), ForeignKey("webapps.id"), nullable=True)

    source = Column(String(32), nullable=True)                # manual|social|review_site
    raw_feedback = Column(JSON, default=list)

    overall_sentiment = Column(String(32), nullable=True)
    sentiment_score = Column(Float, nullable=True)
    key_themes = Column(JSON, default=list)
    praise_points = Column(JSON, default=list)
    pain_points = Column(JSON, default=list)
    ad_copy_suggestions = Column(JSON, default=list)
    response_templates = Column(JSON, default=list)
    ab_test_ideas = Column(JSON, default=list)

    # Feed into scheduler
    auto_apply_to_templates = Column(Boolean, default=False)

    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 4. Social Echo Amplifier ──────────────────────────────────────────────────

class EchoAmplification(Base):
    """Visitor interaction → amplified social campaign."""
    __tablename__ = "echo_amplifications"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    trigger_text = Column(Text, nullable=False)           # original visitor query/comment
    trigger_source = Column(String(32), nullable=True)    # chat|comment|dm|review
    brand_voice = Column(String(64), nullable=True)

    # Generated amplifications
    thread_posts = Column(JSON, default=list)             # [{platform, content, hashtags}]
    story_content = Column(JSON, default=list)
    virality_score = Column(Float, nullable=True)         # 0-100
    priority = Column(String(16), default="medium")       # high|medium|low

    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 5. SEO Mirage Creator ─────────────────────────────────────────────────────

class SeoMirageReport(Base):
    """SEO-optimized content/alt-text/hashtags for a page or post."""
    __tablename__ = "seo_mirage_reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    content_id = Column(String(36), ForeignKey("content.id"), nullable=True)  # tie to existing post

    target_url = Column(String(512), nullable=True)
    input_text = Column(Text, nullable=True)
    platform = Column(String(64), nullable=True)

    seo_title = Column(String(512), nullable=True)
    seo_description = Column(String(512), nullable=True)
    alt_text = Column(String(512), nullable=True)
    optimized_hashtags = Column(JSON, default=list)
    keyword_density_report = Column(JSON, default=dict)
    algorithm_tips = Column(JSON, default=list)           # platform-specific tips
    enhanced_caption = Column(Text, nullable=True)

    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 6. Churn Shield Defender ──────────────────────────────────────────────────

class ChurnShieldReport(Base):
    """Daily audience churn prediction + retention campaign."""
    __tablename__ = "churn_shield_reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    platform = Column(String(64), nullable=False)
    analysis_date = Column(String(16), nullable=True)

    # Risk assessment
    churn_risk_score = Column(Float, nullable=True)       # 0-100
    at_risk_segments = Column(JSON, default=list)
    dropout_patterns = Column(JSON, default=list)

    # Retention actions
    reengagement_posts = Column(JSON, default=list)       # ready-to-post content
    dm_templates = Column(JSON, default=list)
    loyalty_campaign = Column(JSON, default=dict)

    auto_deploy = Column(Boolean, default=False)
    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 7. Dynamic Harmony Pricer ────────────────────────────────────────────────

class HarmonyPricerReport(Base):
    """Recommended ad price / bid adjustments based on buzz + competitor data."""
    __tablename__ = "harmony_pricer_reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    product_name = Column(String(255), nullable=False)
    current_price = Column(String(20), nullable=True)
    platform = Column(String(64), nullable=True)

    competitor_prices = Column(JSON, default=list)
    buzz_score = Column(Float, nullable=True)
    sentiment_score = Column(Float, nullable=True)

    recommended_price = Column(String(20), nullable=True)
    price_rationale = Column(Text, nullable=True)
    ad_copy_variants = Column(JSON, default=list)         # copy for each price point
    simulated_roi = Column(JSON, default=dict)

    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 8. Viral Spark Igniter ───────────────────────────────────────────────────

class ViralSparkReport(Base):
    """Daily viral opportunity report + hooks/challenges for scheduled posts."""
    __tablename__ = "viral_spark_reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String(36), ForeignKey("webapps.id"), nullable=True)

    report_date = Column(String(16), nullable=True)
    niche = Column(String(128), nullable=True)

    trending_topics = Column(JSON, default=list)
    viral_opportunities = Column(JSON, default=list)      # [{topic, score, hook, challenge}]
    hooks = Column(JSON, default=list)
    challenges = Column(JSON, default=list)
    best_posting_windows = Column(JSON, default=list)     # [{platform, time, reason}]
    predicted_reach_multiplier = Column(Float, nullable=True)

    # Integration with scheduler
    auto_inject_hooks = Column(Boolean, default=False)

    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 9. Audience Mirage Mapper ────────────────────────────────────────────────

class AudienceMapReport(Base):
    """Psychographic audience segments + campaign suggestions."""
    __tablename__ = "audience_map_reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String(36), ForeignKey("webapps.id"), nullable=True)

    platform = Column(String(64), nullable=True)
    data_summary = Column(Text, nullable=True)            # summary of input social data

    segments = Column(JSON, default=list)                 # [{name, description, size_pct, interests}]
    campaign_suggestions = Column(JSON, default=list)     # per-segment campaigns
    targeting_recommendations = Column(JSON, default=list)
    cross_platform_insights = Column(JSON, default=list)
    response_mirage = Column(JSON, default=dict)          # predicted response per segment

    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])


# ── 10. Ad Alchemy Optimizer ─────────────────────────────────────────────────

class AdAlchemyReport(Base):
    """A/B tested ad copy variants + winner recommendation."""
    __tablename__ = "ad_alchemy_reports"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    content_id = Column(String(36), ForeignKey("content.id"), nullable=True)

    product_or_service = Column(String(255), nullable=False)
    platform = Column(String(64), nullable=True)
    current_copy = Column(Text, nullable=True)

    variants = Column(JSON, default=list)                 # [{variant_id, headline, body, cta, score}]
    recommended_winner = Column(JSON, default=dict)
    global_benchmark_comparison = Column(JSON, default=dict)
    improvement_suggestions = Column(JSON, default=list)
    auto_deploy_winner = Column(Boolean, default=False)

    status = Column(String(32), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])

