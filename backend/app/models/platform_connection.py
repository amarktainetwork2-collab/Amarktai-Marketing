from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Numeric, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class PlatformType(str, enum.Enum):
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    PINTEREST = "pinterest"
    REDDIT = "reddit"
    BLUESKY = "bluesky"
    THREADS = "threads"
    TELEGRAM = "telegram"
    SNAPCHAT = "snapchat"

class PlatformConnection(Base):
    __tablename__ = "platform_connections"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    platform = Column(Enum(PlatformType), nullable=False)
    account_name = Column(String(255), nullable=False)
    account_id = Column(String(255), nullable=False)
    access_token = Column(String(2048), nullable=True)  # Encrypted
    refresh_token = Column(String(2048), nullable=True)  # Encrypted
    is_active = Column(Boolean, default=True)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Per-platform paid advertising budget
    monthly_ad_budget = Column(Numeric(10, 2), nullable=True, default=0)   # Monthly spend cap
    daily_ad_budget = Column(Numeric(10, 2), nullable=True, default=0)     # Daily spend cap
    ad_budget_currency = Column(String(8), default="USD")                  # ISO 4217 currency code
    ad_account_id = Column(String(255), nullable=True)   # Platform-specific ad account ID
    auto_post_enabled = Column(Boolean, default=False)
    auto_reply_enabled = Column(Boolean, default=False)
    posting_schedule = Column(JSON, nullable=True)  # Custom posting schedule config

    # Relationships
    user = relationship("User", back_populates="platform_connections")
