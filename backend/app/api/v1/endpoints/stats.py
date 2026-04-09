from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.base import get_db
from app.models.user import User
from app.models.content import Content
from app.models.user_api_key import UserIntegration

router = APIRouter()


@router.get("/public")
async def public_stats(db: Session = Depends(get_db)):
    """Return aggregate platform statistics (no auth required)."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_content = db.query(func.count(Content.id)).scalar() or 0
    total_platforms = (
        db.query(func.count(UserIntegration.id))
        .filter(UserIntegration.is_connected.is_(True))
        .scalar()
        or 0
    )

    return {
        "total_users": total_users,
        "total_content_generated": total_content,
        "total_platforms_connected": total_platforms,
    }
