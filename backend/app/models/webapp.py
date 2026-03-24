from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

# Maximum number of businesses/webapps a single user may register
MAX_BUSINESSES_PER_USER = 20


class WebApp(Base):
    __tablename__ = "webapps"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    url = Column(String(512), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(128), nullable=False)
    target_audience = Column(String(512), nullable=False)
    key_features = Column(JSON, default=list)
    logo = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    # Brand configuration supplied by the user
    brand_voice = Column(Text, nullable=True)
    # Cached scrape results – refreshed nightly and before content generation
    scraped_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="webapps")
    content = relationship("Content", back_populates="webapp", cascade="all, delete-orphan")
    groups = relationship("BusinessGroup", back_populates="webapp", cascade="all, delete-orphan")
