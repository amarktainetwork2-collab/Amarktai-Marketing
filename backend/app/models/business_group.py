"""
BusinessGroup model – represents a social media group or community that has been
discovered, suggested, or joined for a specific webapp/business.

Supported platforms for group posting:
  - Facebook  (Groups API)
  - Reddit    (Subreddits via PRAW)
  - Telegram  (Channels/Groups via Bot API)
  - Discord   (Channels via webhook)
  - LinkedIn  (limited – stored but posting restricted)
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class GroupPlatform(str, enum.Enum):
    FACEBOOK = "facebook"
    REDDIT = "reddit"
    TELEGRAM = "telegram"
    DISCORD = "discord"
    LINKEDIN = "linkedin"


class GroupStatus(str, enum.Enum):
    SUGGESTED = "suggested"   # AI found it; user hasn't joined yet
    JOINED = "joined"         # User has joined; group_id provided; ready to post
    ACTIVE = "active"         # Posting to it; engagement tracked
    PAUSED = "paused"         # User paused posting to this group
    REMOVED = "removed"       # User removed it


class BusinessGroup(Base):
    __tablename__ = "business_groups"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String, ForeignKey("webapps.id"), nullable=False, index=True)

    # Platform & identifiers
    platform = Column(Enum(GroupPlatform), nullable=False)
    group_id = Column(String, nullable=True)           # Platform-specific ID (set after user joins)
    group_name = Column(String, nullable=False)
    group_url = Column(String, nullable=True)          # Link for manual joining
    description = Column(Text, nullable=True)

    # Status
    status = Column(Enum(GroupStatus), default=GroupStatus.SUGGESTED)

    # Audience & performance metrics
    member_count = Column(Integer, default=0)
    posts_sent = Column(Integer, default=0)
    total_views = Column(Integer, default=0)
    total_engagements = Column(Integer, default=0)
    total_leads = Column(Integer, default=0)
    avg_interaction_rate = Column(Float, default=0.0)   # engagements / posts_sent

    # Keywords used to find this group (from webapp scrape)
    keywords_used = Column(String, nullable=True)

    # Compliance note
    compliance_note = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    webapp = relationship("WebApp", foreign_keys=[webapp_id])
