"""
Lead model – captures leads generated from social media content.

Stores pre-qualifying form answers, UTM tracking data, and lead score
so the system can learn which posts drive the highest-quality traffic.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text, Boolean, Float, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    # Contact information
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(32), nullable=True)
    company = Column(String(255), nullable=True)

    # Source tracking
    source_platform = Column(String(64), nullable=True)       # youtube, instagram, etc.
    source_content_id = Column(String(36), ForeignKey("content.id"), nullable=True)
    source_webapp_id = Column(String(36), ForeignKey("webapps.id"), nullable=True)

    # UTM parameters
    utm_source = Column(String(128), nullable=True)
    utm_medium = Column(String(128), nullable=True)
    utm_campaign = Column(String(255), nullable=True)
    utm_content = Column(String(255), nullable=True)
    utm_term = Column(String(255), nullable=True)

    # Pre-qualifying form answers (flexible JSON)
    qualifiers = Column(JSON, default=dict)
    # e.g. {"experience": "beginner", "budget": "1000-5000", "timeline": "1-3 months"}

    # Lead scoring
    lead_score = Column(Integer, default=0)               # 0-100, higher = more qualified
    is_qualified = Column(Boolean, default=False)
    qualification_notes = Column(Text, nullable=True)

    # Status
    status = Column(String(32), default="new")            # new|contacted|qualified|converted|lost
    notes = Column(Text, nullable=True)

    # Conversion tracking
    converted_at = Column(DateTime(timezone=True), nullable=True)
    conversion_value = Column(String(20), nullable=True)  # e.g. "49.00"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
