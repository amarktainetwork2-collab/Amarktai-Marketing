"""ContactMessage model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.base import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    email = Column(String(254), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
