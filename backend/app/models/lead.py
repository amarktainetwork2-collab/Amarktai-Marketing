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

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    # Contact information
    name = Column(String, nullable=True)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)

    # Source tracking
    source_platform = Column(String, nullable=True)       # youtube, instagram, etc.
    source_content_id = Column(String, ForeignKey("content.id"), nullable=True)
    source_webapp_id = Column(String, ForeignKey("webapps.id"), nullable=True)

    # UTM parameters
    utm_source = Column(String, nullable=True)
    utm_medium = Column(String, nullable=True)
    utm_campaign = Column(String, nullable=True)
    utm_content = Column(String, nullable=True)
    utm_term = Column(String, nullable=True)

    # Pre-qualifying form answers (flexible JSON)
    qualifiers = Column(JSON, default=dict)
    # e.g. {"experience": "beginner", "budget": "1000-5000", "timeline": "1-3 months"}

    # Lead scoring
    lead_score = Column(Integer, default=0)               # 0-100, higher = more qualified
    is_qualified = Column(Boolean, default=False)
    qualification_notes = Column(Text, nullable=True)

    # Status
    status = Column(String, default="new")                # new|contacted|qualified|converted|lost
    notes = Column(Text, nullable=True)

    # Conversion tracking
    converted_at = Column(DateTime(timezone=True), nullable=True)
    conversion_value = Column(String, nullable=True)       # e.g. "49.00"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
