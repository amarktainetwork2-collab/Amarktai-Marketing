from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.base import get_db
from app.models.content import Content as ContentModel, ContentStatus
from app.models.user import User
from app.schemas.content import Content, ContentCreate, ContentUpdate, ContentPerformance
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Content])
async def get_content(
    status: ContentStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all content for the current user."""
    query = db.query(ContentModel).filter(ContentModel.user_id == current_user.id)
    if status:
        query = query.filter(ContentModel.status == status)
    return query.order_by(ContentModel.created_at.desc()).all()

@router.get("/pending", response_model=List[Content])
async def get_pending_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get pending content for approval."""
    return db.query(ContentModel).filter(
        ContentModel.user_id == current_user.id,
        ContentModel.status == ContentStatus.PENDING
    ).order_by(ContentModel.created_at.desc()).all()

@router.post("/generate")
async def generate_content(    webapp_id: str,
    platform: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate AI content for a platform using Hugging Face."""
    from app.models.webapp import WebApp
    from app.services.hf_generator import HuggingFaceGenerator
    from app.models.user_api_key import UserAPIKey

    webapp = db.query(WebApp).filter(
        WebApp.id == webapp_id,
        WebApp.user_id == current_user.id
    ).first()
    if not webapp:
        raise HTTPException(status_code=404, detail="Web app not found")

    # Get HuggingFace token (user key takes priority)
    hf_token = None
    user_key = db.query(UserAPIKey).filter(
        UserAPIKey.user_id == current_user.id,
        UserAPIKey.key_name == "HUGGINGFACE_TOKEN",
        UserAPIKey.is_active == True,
    ).first()
    if user_key:
        hf_token = user_key.get_decrypted_key()

    from app.core.config import settings
    if not hf_token:
        hf_token = settings.HUGGINGFACE_TOKEN
    if not hf_token:
        raise HTTPException(status_code=503, detail="No HuggingFace API key configured. Add HUGGINGFACE_TOKEN in Integrations.")

    generator = HuggingFaceGenerator(hf_token)
    webapp_data = {
        "name": webapp.name,
        "url": str(webapp.url),
        "description": webapp.description,
        "category": webapp.category,
        "target_audience": webapp.target_audience,
        "key_features": webapp.key_features or [],
    }
    result = await generator.generate_content(webapp_data, platform)

    content_type = "video" if platform in ["youtube", "tiktok"] else "image"
    db_content = ContentModel(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        webapp_id=webapp_id,
        platform=platform,
        type=content_type,
        status=ContentStatus.PENDING,
        title=result.get("title", "Generated Content"),
        caption=result.get("caption", ""),
        hashtags=result.get("hashtags", []),
        media_urls=[],
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

@router.get("/{content_id}", response_model=Content)
async def get_content_item(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific content item."""
    content = db.query(ContentModel).filter(
        ContentModel.id == content_id,
        ContentModel.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.post("/{content_id}/approve", response_model=Content)
async def approve_content(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve content for posting."""
    content = db.query(ContentModel).filter(
        ContentModel.id == content_id,
        ContentModel.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    content.status = ContentStatus.APPROVED
    db.commit()
    db.refresh(content)
    return content

@router.post("/{content_id}/reject", response_model=Content)
async def reject_content(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject content."""
    content = db.query(ContentModel).filter(
        ContentModel.id == content_id,
        ContentModel.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    content.status = ContentStatus.REJECTED
    db.commit()
    db.refresh(content)
    return content

@router.post("/approve-all")
async def approve_all_content(
    content_ids: List[str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve multiple content items."""
    db.query(ContentModel).filter(
        ContentModel.id.in_(content_ids),
        ContentModel.user_id == current_user.id
    ).update({"status": ContentStatus.APPROVED}, synchronize_session=False)
    db.commit()
    return {"message": f"Approved {len(content_ids)} items"}

@router.put("/{content_id}", response_model=Content)
async def update_content(
    content_id: str,
    content_update: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update content (e.g., edit caption)."""
    content = db.query(ContentModel).filter(
        ContentModel.id == content_id,
        ContentModel.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    update_data = content_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)
    return content


@router.post("/generate-all")
async def generate_all_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Batch generate content for ALL active platforms and ALL active webapps
    for the current user using HuggingFace.  Posts go into PENDING approval queue.
    """
    from app.models.webapp import WebApp
    from app.services.hf_generator import HuggingFaceGenerator
    from app.services.scraper import scrape_page
    from app.models.user_api_key import UserAPIKey, UserIntegration
    from app.core.config import settings

    hf_token = None
    user_key = db.query(UserAPIKey).filter(
        UserAPIKey.user_id == current_user.id,
        UserAPIKey.key_name == "HUGGINGFACE_TOKEN",
        UserAPIKey.is_active == True,
    ).first()
    if user_key:
        hf_token = user_key.get_decrypted_key()
    if not hf_token:
        hf_token = settings.HUGGINGFACE_TOKEN
    if not hf_token:
        raise HTTPException(
            status_code=503,
            detail="No HuggingFace API key configured. Add HUGGINGFACE_TOKEN in Integrations.",
        )

    webapps = db.query(WebApp).filter(
        WebApp.user_id == current_user.id, WebApp.is_active == True
    ).all()
    if not webapps:
        raise HTTPException(status_code=400, detail="No active web apps found.")

    connected = db.query(UserIntegration).filter(
        UserIntegration.user_id == current_user.id, UserIntegration.is_connected == True
    ).all()
    platforms = [i.platform for i in connected] or [
        "instagram", "twitter", "linkedin", "facebook"
    ]

    generator = HuggingFaceGenerator(hf_token)
    created: list[ContentModel] = []

    for webapp in webapps[:2]:  # cap at 2 webapps per manual trigger
        # Enrich with live site content
        live_description = webapp.description or ""
        try:
            scraped = await scrape_page(str(webapp.url), timeout=15)
            if scraped and not scraped.error and scraped.full_text:
                live_description = scraped.full_text[:1200]
        except Exception:
            pass

        webapp_data = {
            "name": webapp.name,
            "url": str(webapp.url),
            "description": live_description or webapp.description,
            "category": webapp.category,
            "target_audience": webapp.target_audience,
            "key_features": webapp.key_features or [],
        }

        results = await generator.generate_batch(webapp_data, platforms)
        for platform, content_dict in results.items():
            if content_dict.get("_generation_error") and not content_dict.get("caption"):
                continue
            content_type = "video" if platform in ("youtube", "tiktok") else "image"
            db_content = ContentModel(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                webapp_id=webapp.id,
                platform=platform,
                type=content_type,
                status=ContentStatus.PENDING,
                title=content_dict.get("title", "Generated Post"),
                caption=content_dict.get("caption", ""),
                hashtags=content_dict.get("hashtags", []),
                media_urls=[],
                generation_metadata={"source": "manual_batch"},
            )
            db.add(db_content)
            created.append(db_content)

    db.commit()
    return {
        "message": f"Generated {len(created)} content items across {len(platforms)} platforms",
        "count": len(created),
        "platforms": platforms,
    }
