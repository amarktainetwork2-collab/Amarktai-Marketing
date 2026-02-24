from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.base import get_db
from app.models.platform_connection import PlatformConnection as PlatformModel, PlatformType
from app.models.user import User
from app.schemas.platform import PlatformConnection, PlatformConnectionCreate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PlatformConnection])
async def get_platforms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all connected platforms for the current user."""
    platforms = db.query(PlatformModel).filter(
        PlatformModel.user_id == current_user.id,
        PlatformModel.is_active == True
    ).all()
    return platforms

@router.get("/{platform}", response_model=PlatformConnection)
async def get_platform(
    platform: PlatformType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific platform connection."""
    connection = db.query(PlatformModel).filter(
        PlatformModel.user_id == current_user.id,
        PlatformModel.platform == platform
    ).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Platform not connected")
    return connection

@router.post("/{platform}/connect", response_model=PlatformConnection)
async def connect_platform(
    platform: PlatformType,
    account_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Connect a new platform."""
    existing = db.query(PlatformModel).filter(
        PlatformModel.user_id == current_user.id,
        PlatformModel.platform == platform
    ).first()

    if existing:
        existing.is_active = True
        existing.account_name = account_name
        db.commit()
        db.refresh(existing)
        return existing

    connection = PlatformModel(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        platform=platform,
        account_name=account_name,
        account_id=f"{platform}_{uuid.uuid4().hex[:8]}",
        is_active=True
    )
    db.add(connection)
    db.commit()
    db.refresh(connection)
    return connection

@router.post("/{platform}/disconnect")
async def disconnect_platform(
    platform: PlatformType,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Disconnect a platform."""
    connection = db.query(PlatformModel).filter(
        PlatformModel.user_id == current_user.id,
        PlatformModel.platform == platform
    ).first()

    if not connection:
        raise HTTPException(status_code=404, detail="Platform not connected")

    connection.is_active = False
    db.commit()
    return {"message": f"Disconnected from {platform}"}
