"""
BlogPost model — stores AI-generated SEO blog posts produced by the
Blog Post Generator.  Posts can be published to the website or used as
source content for remixing.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    webapp_id = Column(String, ForeignKey("webapps.id"), nullable=True)

    # Content
    title = Column(String, nullable=False)
    slug = Column(String, nullable=True, index=True)
    meta_description = Column(String, nullable=True)
    sections = Column(JSON, default=list)           # [{heading, content}]
    target_keywords = Column(JSON, default=list)
    cta_text = Column(String, nullable=True)
    cta_url = Column(String, nullable=True)
    reading_time_mins = Column(String, nullable=True)

    # Input
    custom_topic = Column(String, nullable=True)
    custom_keywords = Column(JSON, default=list)

    # Status
    status = Column(String, default="draft")        # draft|published|archived
    is_published = Column(Boolean, default=False)
    published_url = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
