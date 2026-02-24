"""
DB models for the three power tools:
- ContentRemix       (Content Remix Engine)
- CompetitorProfile  (Competitor Shadow Analyzer)
- FeedbackAnalysis   (Feedback Alchemy Platform)
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class ContentRemix(Base):
    """A single remix job: source content → N platform snippets."""
    __tablename__ = "content_remixes"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String, ForeignKey("webapps.id"), nullable=True)

    # Source
    source_type = Column(String, nullable=False)          # url | text | file
    source_url = Column(String, nullable=True)
    source_text = Column(Text, nullable=True)
    source_title = Column(String, nullable=True)

    # Platforms requested
    target_platforms = Column(JSON, default=list)         # ["instagram","tiktok",…]

    # Output snippets — list of {platform, title, caption, hashtags, key_points}
    snippets = Column(JSON, default=list)

    # Trending hashtags used
    trending_hashtags = Column(JSON, default=list)

    status = Column(String, default="pending")            # pending|processing|done|failed
    error_message = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])


class CompetitorProfile(Base):
    """One competitor being tracked + latest analysis report."""
    __tablename__ = "competitor_profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    competitor_name = Column(String, nullable=False)
    competitor_url = Column(String, nullable=False)
    our_niche = Column(String, nullable=True)

    # Latest scraped data
    last_scraped_at = Column(DateTime(timezone=True), nullable=True)
    scraped_content_preview = Column(Text, nullable=True)

    # Analysis report
    content_strategy = Column(Text, nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    content_gaps = Column(JSON, default=list)
    counter_strategies = Column(JSON, default=list)
    top_topics = Column(JSON, default=list)
    posting_frequency = Column(String, nullable=True)
    engagement_level = Column(String, nullable=True)     # high|medium|low
    sentiment_score = Column(Float, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])


class FeedbackAnalysis(Base):
    """A batch of feedback analysed by the Feedback Alchemy Platform."""
    __tablename__ = "feedback_analyses"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String, ForeignKey("webapps.id"), nullable=True)

    source = Column(String, nullable=True)               # manual|social|review_site
    raw_feedback = Column(JSON, default=list)             # list of raw text strings

    # Analysis results
    overall_sentiment = Column(String, nullable=True)    # positive|negative|mixed
    sentiment_score = Column(Float, nullable=True)
    key_themes = Column(JSON, default=list)
    praise_points = Column(JSON, default=list)
    pain_points = Column(JSON, default=list)
    ad_copy_suggestions = Column(JSON, default=list)
    response_templates = Column(JSON, default=list)
    ab_test_ideas = Column(JSON, default=list)

    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
