"""
Engagement Models - Comments, DMs, and Replies
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, Boolean, Integer, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class EngagementType(str, enum.Enum):
    COMMENT = "comment"
    DM = "dm"
    MENTION = "mention"
    REVIEW = "review"

class EngagementStatus(str, enum.Enum):
    PENDING = "pending"  # New, needs AI reply generation
    GENERATING = "generating"  # AI is generating reply
    READY = "ready"  # Reply ready for approval
    APPROVED = "approved"  # Approved, ready to send
    SENT = "sent"  # Reply sent
    REJECTED = "rejected"  # Rejected by user
    AUTO_SENT = "auto_sent"  # Sent automatically (low-risk)

class EngagementPriority(str, enum.Enum):
    HIGH = "high"  # Negative sentiment, complaint, viral post
    MEDIUM = "medium"  # Question, feedback
    LOW = "low"  # Thank you, emoji, generic positive

class EngagementReply(Base):
    """Stores incoming comments/DMs and AI-generated replies."""
    __tablename__ = "engagement_replies"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    platform = Column(String(64), nullable=False)  # youtube, tiktok, instagram, etc.
    
    # Original engagement data
    engagement_type = Column(Enum(EngagementType), nullable=False)
    platform_comment_id = Column(String(255), nullable=True)  # ID from the platform
    platform_post_id = Column(String(255), nullable=True)  # Post/video ID this comment is on
    
    # Comment/DM content
    author_name = Column(String(255), nullable=False)
    author_platform_id = Column(String(255), nullable=True)
    author_avatar_url = Column(String(512), nullable=True)
    original_text = Column(Text, nullable=False)
    original_language = Column(String(10), default="en")
    
    # Sentiment analysis
    sentiment = Column(String(32), nullable=True)  # positive, negative, neutral
    sentiment_score = Column(String(16), nullable=True)  # -1.0 to 1.0
    
    # AI-generated reply
    ai_reply_text = Column(Text, nullable=True)
    ai_reply_confidence = Column(String(8), nullable=True)  # 0-100
    ai_reply_tone = Column(String(64), nullable=True)  # friendly, professional, apologetic, etc.
    
    # Status tracking
    status = Column(Enum(EngagementStatus), default=EngagementStatus.PENDING)
    priority = Column(Enum(EngagementPriority), default=EngagementPriority.MEDIUM)
    
    # Risk assessment for auto-reply
    auto_reply_safe = Column(Boolean, default=False)  # Can be auto-replied without approval
    risk_factors = Column(JSON, default=list)  # Why it's not safe for auto-reply
    
    # Timestamps
    received_at = Column(DateTime(timezone=True), nullable=False)
    generated_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    
    # User actions
    approved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    edited_by_user = Column(Boolean, default=False)
    user_edited_text = Column(Text, nullable=True)
    
    # Metrics
    reply_likes = Column(Integer, default=0)  # Likes on our reply
    reply_replies = Column(Integer, default=0)  # Replies to our reply
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="engagement_replies")


class ABTest(Base):
    """A/B Testing for content variants."""
    __tablename__ = "ab_tests"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    content_id = Column(String(36), ForeignKey("content.id"), nullable=True)
    webapp_id = Column(String(36), ForeignKey("webapps.id"), nullable=False)
    
    # Test configuration
    test_name = Column(String(255), nullable=False)
    platform = Column(String(64), nullable=False)
    test_hypothesis = Column(Text, nullable=True)  # What we're testing
    
    # Variants (stored as JSON)
    variants = Column(JSON, nullable=False)  # Array of variant objects
    
    # Status
    status = Column(String(32), default="running")  # running, completed, paused
    
    # Results
    winning_variant_id = Column(String(36), nullable=True)
    confidence_level = Column(String(8), nullable=True)  # Statistical confidence 0-100
    improvement_percent = Column(String(16), nullable=True)  # How much better the winner performed
    
    # Metrics per variant (stored as JSON)
    variant_metrics = Column(JSON, default=dict)
    
    # Test duration
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="ab_tests")
    content = relationship("Content", back_populates="ab_tests")


class ViralScore(Base):
    """Tracks viral potential scores for content."""
    __tablename__ = "viral_scores"
    
    id = Column(String(36), primary_key=True, index=True)
    content_id = Column(String(36), ForeignKey("content.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Overall score
    overall_score = Column(Integer, nullable=False)  # 0-100
    
    # Component scores
    hook_strength = Column(Integer, nullable=True)  # 0-100
    emotional_impact = Column(Integer, nullable=True)
    shareability = Column(Integer, nullable=True)
    timing_score = Column(Integer, nullable=True)
    uniqueness = Column(Integer, nullable=True)
    trend_alignment = Column(Integer, nullable=True)
    
    # Prediction
    viral_probability = Column(Integer, nullable=True)  # 0-100
    estimated_reach = Column(Integer, nullable=True)
    estimated_engagement = Column(String(16), nullable=True)  # Percentage
    
    # Factors
    positive_factors = Column(JSON, default=list)
    negative_factors = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    
    # Actual performance (for learning)
    actual_reach = Column(Integer, nullable=True)
    actual_engagement = Column(String(16), nullable=True)
    prediction_accuracy = Column(String(16), nullable=True)  # How accurate was our prediction
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    content = relationship("Content", back_populates="viral_score_rel")
    user = relationship("User", back_populates="viral_scores")


class CostTracking(Base):
    """Tracks API usage costs per user."""
    __tablename__ = "cost_tracking"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Usage breakdown
    llm_tokens_used = Column(Integer, default=0)
    llm_tokens_cost = Column(String(20), default="0.00")  # USD
    
    images_generated = Column(Integer, default=0)
    images_cost = Column(String(20), default="0.00")
    
    videos_generated = Column(Integer, default=0)
    videos_cost = Column(String(20), default="0.00")
    
    audio_generated = Column(Integer, default=0)
    audio_cost = Column(String(20), default="0.00")
    
    # Total
    total_cost = Column(String(20), default="0.00")
    
    # Billing period
    billing_period_start = Column(DateTime(timezone=True), nullable=False)
    billing_period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Alerts
    alert_50_sent = Column(Boolean, default=False)
    alert_80_sent = Column(Boolean, default=False)
    alert_100_sent = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cost_tracking")
