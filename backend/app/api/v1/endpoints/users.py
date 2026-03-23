from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.base import get_db
from app.models.user import User as UserModel
from app.schemas.user import User, UserUpdate
from app.api.deps import get_current_user

router = APIRouter()

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


# ── Personal API keys ─────────────────────────────────────────────────────────

class ApiKeyEntry(BaseModel):
    key_name: str
    key_value: str

class ApiKeysBatchRequest(BaseModel):
    keys: list[ApiKeyEntry]

# Allowed key names users can set from the settings page
_ALLOWED_KEYS = {
    "QWEN_API_KEY",
    "HUGGINGFACE_TOKEN",
    "OPENAI_API_KEY",
    "FIRECRAWL_API_KEY",
}

@router.post("/api-keys", status_code=204)
async def upsert_api_keys(
    body: ApiKeysBatchRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> None:
    """
    Save / update personal API keys for the current user.

    Only a safe allow-list of key names is accepted.
    Each key is encrypted before storage using the app ENCRYPTION_KEY.
    """
    import uuid as _uuid
    from app.models.user_api_key import UserAPIKey

    for entry in body.keys:
        if entry.key_name not in _ALLOWED_KEYS:
            raise HTTPException(
                status_code=400,
                detail=f"Key '{entry.key_name}' is not allowed via this endpoint.",
            )
        if not entry.key_value.strip():
            continue  # Skip blanks silently

        existing = db.query(UserAPIKey).filter(
            UserAPIKey.user_id == current_user.id,
            UserAPIKey.key_name == entry.key_name,
        ).first()

        if existing:
            existing.encrypted_key = UserAPIKey.encrypt_key(entry.key_value.strip())  # type: ignore[assignment]
            existing.is_active = True  # type: ignore[assignment]
        else:
            new_key = UserAPIKey(
                id=str(_uuid.uuid4()),
                user_id=current_user.id,
                key_name=entry.key_name,
                encrypted_key=UserAPIKey.encrypt_key(entry.key_value.strip()),
                is_active=True,
            )
            db.add(new_key)

    db.commit()

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

@router.patch("/me/location", status_code=204)
async def update_location(
    body: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Store the user's approximate geolocation (captured via browser Geolocation API).
    Used by AI for lead targeting and optimal posting-time calculations.
    Coordinates are stored on the user record; no third-party service is called.
    Returns 204 whether or not the DB column exists so the frontend call is always safe.
    """
    import logging
    logger = logging.getLogger(__name__)

    if hasattr(current_user, 'geo_lat'):
        current_user.geo_lat = body.latitude  # type: ignore[assignment]
        current_user.geo_lon = body.longitude  # type: ignore[assignment]
        db.commit()
        logger.debug("Stored location for user %s: %.4f, %.4f", current_user.id, body.latitude, body.longitude)
    else:
        logger.debug(
            "Location PATCH called for user %s but geo_lat/geo_lon columns not present — "
            "run alembic migration to enable persistent location storage.",
            current_user.id,
        )

