from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, JSON, Integer, Float, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class ContentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    POSTED = "posted"
    FAILED = "failed"
    SCHEDULED = "scheduled"

class ContentType(str, enum.Enum):
    VIDEO = "video"
    IMAGE = "image"
    CAROUSEL = "carousel"
    TEXT = "text"
    STORY = "story"
    REEL = "reel"
    SHORT = "short"

class Content(Base):
    __tablename__ = "content"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    webapp_id = Column(String(36), ForeignKey("webapps.id"), nullable=False)
    platform = Column(String(64), nullable=False)
    type = Column(Enum(ContentType), nullable=False)
    status = Column(Enum(ContentStatus), default=ContentStatus.PENDING)
    title = Column(String(512), nullable=False)
    caption = Column(Text, nullable=False)
    hashtags = Column(JSON, default=[])
    media_urls = Column(JSON, default=[])
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    posted_at = Column(DateTime(timezone=True), nullable=True)
    platform_post_id = Column(String(256), nullable=True)
    
    # Content metadata
    content_angle = Column(String(128), nullable=True)  # e.g., "tutorial", "transformation", "pov"
    target_audience = Column(String(512), nullable=True)
    language = Column(String(10), default="en")
    
    # Viral prediction
    viral_score = Column(Integer, nullable=True)  # 0-100
    confidence_score = Column(Integer, nullable=True)  # AI confidence in content
    
    # Performance metrics
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    ctr = Column(Float, default=0.0)
    
    # A/B testing
    is_variant = Column(Boolean, default=False)
    ab_test_id = Column(String(36), ForeignKey("ab_tests.id"), nullable=True)
    variant_id = Column(String(36), nullable=True)  # Unique ID within the test
    
    # Media generation tracking
    image_generation_cost = Column(String(20), default="0.00")
    video_generation_cost = Column(String(20), default="0.00")
    audio_generation_cost = Column(String(20), default="0.00")
    llm_tokens_used = Column(Integer, default=0)
    
    # Repurposing
    parent_content_id = Column(String(36), ForeignKey("content.id"), nullable=True)  # If repurposed from another content
    is_repurposed = Column(Boolean, default=False)
    repurposed_for_platforms = Column(JSON, default=list)  # List of platforms this was repurposed for
    
    # Feedback loop data
    performance_feedback = Column(JSON, default=dict)  # Store what worked/didn't work
    generation_metadata = Column(JSON, default=dict)  # Store how this was generated
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="content")
    webapp = relationship("WebApp", back_populates="content")
    ab_tests = relationship(
        "ABTest",
        primaryjoin="ABTest.content_id == Content.id",
        foreign_keys="[ABTest.content_id]",
        back_populates="content"
    )
    viral_score_rel = relationship("ViralScore", back_populates="content", uselist=False)
