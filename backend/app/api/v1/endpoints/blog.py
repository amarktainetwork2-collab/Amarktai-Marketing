"""
SEO Blog Post Generator Endpoints

Generates long-form SEO blog posts from webapp data using the AmarktAI AI engine.
Each post can be used to drive organic search traffic to the user's site.
"""

from __future__ import annotations

import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.blog_post import BlogPost
from app.models.user import User

router = APIRouter()


# ─── Schemas ────────────────────────────────────────────────────────────────

class BlogPostCreate(BaseModel):
    webapp_id: str
    custom_topic: Optional[str] = None
    custom_keywords: Optional[List[str]] = None


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    meta_description: Optional[str] = None
    status: Optional[str] = None
    is_published: Optional[bool] = None
    published_url: Optional[str] = None


class BlogPostResponse(BaseModel):
    id: str
    webapp_id: Optional[str]
    title: str
    slug: Optional[str]
    meta_description: Optional[str]
    sections: list
    target_keywords: list
    cta_text: Optional[str]
    cta_url: Optional[str]
    reading_time_mins: Optional[str]
    custom_topic: Optional[str]
    status: str
    is_published: bool
    published_url: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/generate", response_model=BlogPostResponse, status_code=201)
async def generate_blog_post(
    payload: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a long-form SEO blog post for the specified webapp using HuggingFace.
    The post is saved as a draft and can be published/exported.
    """
    from app.models.webapp import WebApp
    from app.services.hf_generator import HuggingFaceGenerator
    from app.models.user_api_key import UserAPIKey
    from app.core.config import settings

    webapp = db.query(WebApp).filter(
        WebApp.id == payload.webapp_id,
        WebApp.user_id == current_user.id,
    ).first()
    if not webapp:
        raise HTTPException(status_code=404, detail="Web app not found")

    # Resolve HF token
    hf_token = None
    key_row = db.query(UserAPIKey).filter_by(
        user_id=current_user.id, key_name="HUGGINGFACE_TOKEN", is_active=True
    ).first()
    if key_row:
        hf_token = key_row.get_decrypted_key()
    if not hf_token:
        hf_token = settings.HUGGINGFACE_TOKEN
    if not hf_token:
        raise HTTPException(
            status_code=503,
            detail="AI content generation is not configured. Add your AI token in Integrations or contact your admin.",
        )

    webapp_data = {
        "name": webapp.name,
        "url": str(webapp.url),
        "description": webapp.description,
        "category": webapp.category,
        "target_audience": webapp.target_audience,
        "key_features": webapp.key_features or [],
    }

    generator = HuggingFaceGenerator(hf_token)
    post_data = await generator.generate_blog_post(
        webapp_data=webapp_data,
        topic=payload.custom_topic,
        keywords=payload.custom_keywords,
    )

    post = BlogPost(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        webapp_id=webapp.id,
        title=post_data.get("title", f"Blog: {webapp.name}"),
        slug=post_data.get("slug", ""),
        meta_description=post_data.get("meta_description", ""),
        sections=post_data.get("sections", []),
        target_keywords=post_data.get("target_keywords", []),
        cta_text=post_data.get("cta_text", ""),
        cta_url=post_data.get("cta_url", str(webapp.url)),
        reading_time_mins=str(post_data.get("reading_time_mins", 5)),
        custom_topic=payload.custom_topic,
        custom_keywords=payload.custom_keywords or [],
        status="draft",
        is_published=False,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/", response_model=List[BlogPostResponse])
async def list_blog_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all blog posts for the current user."""
    return (
        db.query(BlogPost)
        .filter(BlogPost.user_id == current_user.id)
        .order_by(BlogPost.created_at.desc())
        .all()
    )


@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(BlogPost).filter(
        BlogPost.id == post_id, BlogPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@router.patch("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: str,
    update: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(BlogPost).filter(
        BlogPost.id == post_id, BlogPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204)
async def delete_blog_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(BlogPost).filter(
        BlogPost.id == post_id, BlogPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(post)
    db.commit()


@router.post("/{post_id}/remix-to-social")
async def remix_blog_to_social(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Take an existing blog post and remix it into social media content
    for all connected platforms (creates PENDING content items).
    """
    from app.models.content import Content as ContentModel, ContentStatus
    from app.services.hf_generator import HuggingFaceGenerator
    from app.models.user_api_key import UserAPIKey, UserIntegration
    from app.core.config import settings

    post = db.query(BlogPost).filter(
        BlogPost.id == post_id, BlogPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    hf_token = None
    key_row = db.query(UserAPIKey).filter_by(
        user_id=current_user.id, key_name="HUGGINGFACE_TOKEN", is_active=True
    ).first()
    if key_row:
        hf_token = key_row.get_decrypted_key()
    if not hf_token:
        hf_token = settings.HUGGINGFACE_TOKEN
    if not hf_token:
        raise HTTPException(status_code=503, detail="AI content generation is not configured")

    connected = db.query(UserIntegration).filter(
        UserIntegration.user_id == current_user.id, UserIntegration.is_connected == True
    ).all()
    platforms = [i.platform for i in connected] or ["twitter", "linkedin", "instagram", "facebook"]

    # Build full blog text for remixing
    sections_text = "\n\n".join(
        f"{s.get('heading', '')}\n{s.get('content', '')}"
        for s in (post.sections or [])
    )
    source_text = f"{post.title}\n\n{post.meta_description}\n\n{sections_text}"

    generator = HuggingFaceGenerator(hf_token)
    created = []
    for platform in platforms[:6]:
        try:
            remix = await generator.remix_to_platform(
                source_text=source_text[:2000],
                platform=platform,
                trending_hashtags=post.target_keywords or [],
            )
            db_content = ContentModel(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                webapp_id=post.webapp_id,
                platform=platform,
                type="image",
                status=ContentStatus.PENDING,
                title=remix.get("title", post.title),
                caption=remix.get("caption", ""),
                hashtags=remix.get("hashtags", post.target_keywords or []),
                media_urls=[],
                generation_metadata={"source": "blog_remix", "blog_post_id": post.id},
            )
            db.add(db_content)
            created.append(platform)
        except Exception as exc:
            print(f"⚠️  Blog remix failed for {platform}: {exc}")

    db.commit()
    return {
        "message": f"Created {len(created)} social posts from blog",
        "platforms": created,
        "blog_post_id": post.id,
    }
