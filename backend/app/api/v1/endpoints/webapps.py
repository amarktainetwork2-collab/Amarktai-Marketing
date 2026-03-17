from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.base import get_db
from app.models.webapp import WebApp as WebAppModel, MAX_BUSINESSES_PER_USER
from app.models.user import User
from app.schemas.webapp import WebApp, WebAppCreate, WebAppUpdate
from app.api.deps import get_current_user, is_admin_user

router = APIRouter()

@router.get("/", response_model=List[WebApp])
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new web app / business (max 20 per user; unlimited for admin)."""
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
    return db_webapp

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
