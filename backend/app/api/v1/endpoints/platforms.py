from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.db.base import get_db
from app.models.platform_connection import PlatformConnection as PlatformModel, PlatformType
from app.models.user import User
from app.schemas.platform import PlatformConnection, PlatformConnectionCreate
from app.api.deps import get_current_user

router = APIRouter()


class PlatformBudgetUpdate(BaseModel):
    monthly_ad_budget: Optional[float] = None
    daily_ad_budget: Optional[float] = None
    ad_budget_currency: Optional[str] = None
    ad_account_id: Optional[str] = None
    auto_post_enabled: Optional[bool] = None
    auto_reply_enabled: Optional[bool] = None
    posting_schedule: Optional[dict] = None


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

@router.patch("/{platform}/budget")
async def update_platform_budget(
    platform: PlatformType,
    body: PlatformBudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update per-platform ad budget, auto-post/reply flags, and posting schedule."""
    connection = db.query(PlatformModel).filter(
        PlatformModel.user_id == current_user.id,
        PlatformModel.platform == platform,
    ).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Platform not connected")

    if body.monthly_ad_budget is not None:
        connection.monthly_ad_budget = body.monthly_ad_budget
    if body.daily_ad_budget is not None:
        connection.daily_ad_budget = body.daily_ad_budget
    if body.ad_budget_currency is not None:
        connection.ad_budget_currency = body.ad_budget_currency
    if body.ad_account_id is not None:
        connection.ad_account_id = body.ad_account_id
    if body.auto_post_enabled is not None:
        connection.auto_post_enabled = body.auto_post_enabled
    if body.auto_reply_enabled is not None:
        connection.auto_reply_enabled = body.auto_reply_enabled
    if body.posting_schedule is not None:
        connection.posting_schedule = body.posting_schedule

    db.commit()
    db.refresh(connection)
    return {
        "platform": platform,
        "monthly_ad_budget": float(connection.monthly_ad_budget or 0),
        "daily_ad_budget": float(connection.daily_ad_budget or 0),
        "ad_budget_currency": connection.ad_budget_currency,
        "ad_account_id": connection.ad_account_id,
        "auto_post_enabled": connection.auto_post_enabled,
        "auto_reply_enabled": connection.auto_reply_enabled,
        "posting_schedule": connection.posting_schedule,
    }

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
