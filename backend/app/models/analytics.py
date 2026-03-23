from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content_id = Column(String(36), ForeignKey("content.id"), nullable=True)
    platform = Column(String(64), nullable=False)
    date = Column(Date, nullable=False)
    
    # Metrics
    posts = Column(Integer, default=0)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    ctr = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="analytics")
