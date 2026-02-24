from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models.user import User as UserModel
from app.schemas.user import User, UserUpdate
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=User)
async def get_me(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Get current user."""
    return current_user

@router.put("/me", response_model=User)
async def update_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Update current user profile."""
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user
