from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(16), nullable=False, default="info")  # info, warning, success, error
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
