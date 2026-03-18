"""
Content Remix Engine – API Endpoints

Remixes source content (URL or raw text) into platform-optimised
social snippets using HuggingFace Mistral.

Designed and created by Amarktai Network
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.tools import ContentRemix
from app.models.user import User
from app.models.user_api_key import UserAPIKey

router = APIRouter()

# ─── Schemas ─────────────────────────────────────────────────────────────────

class RemixRequest(BaseModel):
    source_type: str = "url"          # url | text
    source_url: str | None = None
    source_text: str | None = None
    target_platforms: list[str] = ["instagram", "tiktok", "twitter", "linkedin", "facebook", "youtube"]
    webapp_id: str | None = None


class RemixResponse(BaseModel):
    id: str
    status: str
    snippets: list[dict]
    trending_hashtags: list[str]
    source_title: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _get_hf_token(db: Session, user: User) -> str | None:
    row = db.query(UserAPIKey).filter(
        UserAPIKey.user_id == user.id,
        UserAPIKey.key_name == "HUGGINGFACE_TOKEN",
        UserAPIKey.is_active == True,
    ).first()
    if row:
        return row.get_decrypted_key()
    return settings.HUGGINGFACE_TOKEN or None


# ─── Background task ─────────────────────────────────────────────────────────

async def _run_remix(remix_id: str, hf_token: str):
    """Background task that performs the actual remix generation."""
    from app.db.session import SessionLocal
    from app.services.hf_generator import HuggingFaceGenerator
    from app.services.scraper import scrape_page

    db = SessionLocal()
    try:
        remix = db.query(ContentRemix).filter(ContentRemix.id == remix_id).first()
        if not remix:
            return

        remix.status = "processing"
        db.commit()

        generator = HuggingFaceGenerator(hf_token)

        # Get source text
        source_text = remix.source_text or ""
        if remix.source_type == "url" and remix.source_url:
            page = await scrape_page(remix.source_url)
            if page.error:
                remix.status = "failed"
                remix.error_message = f"Scrape failed: {page.error}"
                db.commit()
                return
            source_text = page.full_text
            remix.source_title = page.title
            remix.source_text = source_text

        # Extract trending hashtags from source text
        keywords = await generator.extract_keywords(source_text, count=15)
        remix.trending_hashtags = keywords

        # Remix into each platform
        snippets = []
        for platform in (remix.target_platforms or []):
            try:
                snippet = await generator.remix_to_platform(
                    source_text=source_text,
                    platform=platform,
                    trending_hashtags=keywords,
                )
                snippet["platform"] = platform
                snippets.append(snippet)
            except Exception as exc:
                snippets.append({
                    "platform": platform,
                    "title": "Remix unavailable",
                    "caption": source_text[:200],
                    "hashtags": keywords[:5],
                    "key_points": [],
                    "error": str(exc),
                })

        remix.snippets = snippets
        remix.status = "done"
        db.commit()
    except Exception as exc:
        db = SessionLocal()
        remix = db.query(ContentRemix).filter(ContentRemix.id == remix_id).first()
        if remix:
            remix.status = "failed"
            remix.error_message = str(exc)
            db.commit()
    finally:
        db.close()


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/", status_code=202)
async def create_remix(
    body: RemixRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Submit a remix job.  Processing happens asynchronously in the background.
    Poll GET /remix/{id} for status.
    """
    hf_token = _get_hf_token(db, current_user)
    if not hf_token:
        raise HTTPException(
            status_code=503,
            detail="AI content generation is not configured. Add your AI token in Integrations or contact your admin.",
        )

    if body.source_type == "url" and not body.source_url:
        raise HTTPException(status_code=400, detail="source_url is required when source_type='url'")
    if body.source_type == "text" and not body.source_text:
        raise HTTPException(status_code=400, detail="source_text is required when source_type='text'")

    remix = ContentRemix(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        webapp_id=body.webapp_id,
        source_type=body.source_type,
        source_url=body.source_url,
        source_text=body.source_text,
        target_platforms=body.target_platforms,
        status="pending",
    )
    db.add(remix)
    db.commit()
    db.refresh(remix)

    background_tasks.add_task(_run_remix, remix.id, hf_token)

    return {"id": remix.id, "status": "pending", "message": "Remix job queued"}


@router.get("/")
async def list_remixes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    """List all remix jobs for the current user."""
    remixes = (
        db.query(ContentRemix)
        .filter(ContentRemix.user_id == current_user.id)
        .order_by(ContentRemix.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "source_type": r.source_type,
            "source_url": r.source_url,
            "source_title": r.source_title,
            "target_platforms": r.target_platforms,
            "snippet_count": len(r.snippets or []),
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in remixes
    ]


@router.get("/{remix_id}")
async def get_remix(
    remix_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Get a specific remix job with full snippets."""
    remix = db.query(ContentRemix).filter(
        ContentRemix.id == remix_id,
        ContentRemix.user_id == current_user.id,
    ).first()
    if not remix:
        raise HTTPException(status_code=404, detail="Remix not found")

    return {
        "id": remix.id,
        "source_type": remix.source_type,
        "source_url": remix.source_url,
        "source_title": remix.source_title,
        "target_platforms": remix.target_platforms,
        "snippets": remix.snippets or [],
        "trending_hashtags": remix.trending_hashtags or [],
        "status": remix.status,
        "error_message": remix.error_message,
        "created_at": remix.created_at.isoformat() if remix.created_at else None,
    }


@router.delete("/{remix_id}", status_code=204)
async def delete_remix(
    remix_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a remix job."""
    remix = db.query(ContentRemix).filter(
        ContentRemix.id == remix_id,
        ContentRemix.user_id == current_user.id,
    ).first()
    if not remix:
        raise HTTPException(status_code=404, detail="Remix not found")
    db.delete(remix)
    db.commit()
