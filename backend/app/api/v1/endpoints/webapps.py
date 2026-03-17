from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.db.base import get_db
from app.models.webapp import WebApp as WebAppModel, MAX_BUSINESSES_PER_USER
from app.models.user import User
from app.schemas.webapp import WebApp, WebAppCreate, WebAppUpdate
from app.api.deps import get_current_user, is_admin_user

router = APIRouter()


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

async def _run_scrape(webapp_id: str) -> None:
    """Background task: scrape the webapp URL and store the results."""
    from app.db.base import SessionLocal
    from app.services.scraper import scrape_page

    db = SessionLocal()
    try:
        webapp = db.query(WebAppModel).filter(WebAppModel.id == webapp_id).first()
        if not webapp:
            return
        scraped = await scrape_page(str(webapp.url), timeout=20)
        webapp.scraped_data = {
            "scraped_at": datetime.utcnow().isoformat(),
            "title": scraped.title,
            "meta_description": scraped.meta_description,
            "headings": scraped.headings[:10],
            "paragraphs": scraped.paragraphs[:5],
            "social_links": scraped.social_links[:20],
            "full_text": scraped.full_text[:2000],
            "error": scraped.error,
            "status": "error" if scraped.error else "ok",
        }
        db.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(
            "Background scrape failed for webapp %s: %s", webapp_id, exc
        )
    finally:
        db.close()


# ---------------------------------------------------------------------------
# CRUD endpoints
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[WebApp])
async def get_webapps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all web apps for the current user."""
    webapps = db.query(WebAppModel).filter(WebAppModel.user_id == current_user.id).all()
    return webapps

@router.get("/{webapp_id}", response_model=WebApp)
async def get_webapp(
    webapp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific web app by ID."""
    webapp = db.query(WebAppModel).filter(
        WebAppModel.id == webapp_id,
        WebAppModel.user_id == current_user.id,
    ).first()
    if not webapp:
        raise HTTPException(status_code=404, detail="Web app not found")
    return webapp

@router.post("/", response_model=WebApp, status_code=status.HTTP_201_CREATED)
async def create_webapp(
    webapp: WebAppCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new web app / business (max 20 per user; unlimited for admin).

    Immediately queues a background scrape of the webapp URL so the AI has
    rich context before the first content generation run.
    """
    # Admin users bypass all limits
    if not is_admin_user(current_user):
        existing_count = db.query(WebAppModel).filter(
            WebAppModel.user_id == current_user.id,
        ).count()
        if existing_count >= MAX_BUSINESSES_PER_USER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum of {MAX_BUSINESSES_PER_USER} businesses per user reached.",
            )
    db_webapp = WebAppModel(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        **webapp.model_dump()
    )
    db.add(db_webapp)
    db.commit()
    db.refresh(db_webapp)

    # Auto-scrape in the background so creation is instant for the user
    background_tasks.add_task(_run_scrape, db_webapp.id)

    return db_webapp

@router.post("/{webapp_id}/scrape")
async def scrape_webapp(
    webapp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Scrape the webapp URL synchronously and store results.

    Returns the scraped_data dict so the frontend can display insights
    immediately without waiting for a nightly job.
    """
    from app.services.scraper import scrape_page

    webapp = db.query(WebAppModel).filter(
        WebAppModel.id == webapp_id,
        WebAppModel.user_id == current_user.id,
    ).first()
    if not webapp:
        raise HTTPException(status_code=404, detail="Web app not found")

    scraped = await scrape_page(str(webapp.url), timeout=20)
    scraped_data: dict[str, Any] = {
        "scraped_at": datetime.utcnow().isoformat(),
        "title": scraped.title,
        "meta_description": scraped.meta_description,
        "headings": scraped.headings[:10],
        "paragraphs": scraped.paragraphs[:5],
        "social_links": scraped.social_links[:20],
        "full_text": scraped.full_text[:2000],
        "error": scraped.error,
        "status": "error" if scraped.error else "ok",
    }
    webapp.scraped_data = scraped_data
    db.commit()

    return {
        "message": "Scraped successfully" if not scraped.error else f"Scrape error: {scraped.error}",
        "scraped_data": scraped_data,
    }


@router.put("/{webapp_id}", response_model=WebApp)
async def update_webapp(
    webapp_id: str,
    webapp_update: WebAppUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a web app."""
    db_webapp = db.query(WebAppModel).filter(
        WebAppModel.id == webapp_id,
        WebAppModel.user_id == current_user.id,
    ).first()
    if not db_webapp:
        raise HTTPException(status_code=404, detail="Web app not found")

    update_data = webapp_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_webapp, field, value)

    db.commit()
    db.refresh(db_webapp)
    return db_webapp

@router.delete("/{webapp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_webapp(
    webapp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a web app."""
    db_webapp = db.query(WebAppModel).filter(
        WebAppModel.id == webapp_id,
        WebAppModel.user_id == current_user.id,
    ).first()
    if not db_webapp:
        raise HTTPException(status_code=404, detail="Web app not found")

    db.delete(db_webapp)
    db.commit()
    return None
