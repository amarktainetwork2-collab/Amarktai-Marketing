from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, ARRAY, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

# Maximum number of businesses/webapps a single user may register
MAX_BUSINESSES_PER_USER = 20


class WebApp(Base):
    __tablename__ = "webapps"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    target_audience = Column(String, nullable=False)
    key_features = Column(ARRAY(String), default=[])
    logo = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    # Cached scrape results – refreshed nightly and before content generation
    scraped_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="webapps")
    content = relationship("Content", back_populates="webapp", cascade="all, delete-orphan")
    groups = relationship("BusinessGroup", back_populates="webapp", cascade="all, delete-orphan")
