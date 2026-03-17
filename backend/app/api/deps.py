"""
Authentication dependency for FastAPI endpoints.

Supports two modes:
1. Clerk JWT verification (production) – set CLERK_SECRET_KEY in .env
2. Demo mode (development) – passes a fixed demo user when no Clerk key is set
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import get_db
from app.models.user import User, PlanType

_bearer = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# JWKS helpers
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _clerk_jwks_uri() -> str:
    """Return Clerk's JWKS endpoint derived from the secret key."""
    # Clerk instance URL is embedded in the secret key: sk_test_<instance>.
    # The JWKS URL is https://<instance>.clerk.accounts.dev/.well-known/jwks.json
    key = settings.CLERK_SECRET_KEY
    if not key:
        return ""
    try:
        # sk_test_AbCdEf… → extract instance identifier
        parts = key.split("_")
        if len(parts) >= 3:
            instance = parts[2]
            return f"https://{instance}.clerk.accounts.dev/.well-known/jwks.json"
    except Exception:
        pass
    return ""


def _get_clerk_public_keys() -> list[dict]:
    """Fetch and return Clerk's JSON Web Key Set."""
    uri = _clerk_jwks_uri()
    if not uri:
        return []
    try:
        resp = httpx.get(uri, timeout=5)
        resp.raise_for_status()
        return resp.json().get("keys", [])
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Token extraction and verification
# ---------------------------------------------------------------------------

def _verify_clerk_token(token: str) -> Optional[str]:
    """
    Verify a Clerk JWT and return the subject (user ID) if valid.
    Returns None if verification fails.
    """
    keys = _get_clerk_public_keys()
    if not keys:
        return None

    try:
        # Try each key until one works
        for key in keys:
            try:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=["RS256"],
                    options={"verify_aud": False},
                )
                return payload.get("sub")
            except JWTError:
                continue
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# Dependency
# ---------------------------------------------------------------------------

DEMO_USER_ID = "demo-user-1"
_CLERK_ENABLED = bool(settings.CLERK_SECRET_KEY and settings.CLERK_SECRET_KEY != "sk_test_...")


def is_admin_user(user: User) -> bool:
    """Return True if the user has admin privileges (unlimited access, no cost).

    The default fallback (amarktainetwork@gmail.com) is intentional: this is the
    platform owner's email, as specified in the system requirements.  Set the
    ADMIN_EMAIL environment variable to override this for a different deployment.
    """
    # ADMIN_EMAIL defaults to the platform owner; override via env in production
    admin_email = (settings.ADMIN_EMAIL or "amarktainetwork@gmail.com").lower()
    if user.email and user.email.lower() == admin_email:
        return True
    admin_ids_raw = os.getenv("ADMIN_USER_IDS", "")
    admin_ids = {uid.strip() for uid in admin_ids_raw.split(",") if uid.strip()}
    return user.id in admin_ids


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that returns the authenticated User model.

    - In production (CLERK_SECRET_KEY configured): validates the Bearer JWT.
    - In demo/dev mode: accepts any request and upserts a demo user.
    """

    if _CLERK_ENABLED:
        if credentials is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = _verify_clerk_token(credentials.credentials)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        # Demo / development mode – use a fixed user
        user_id = DEMO_USER_ID

    # Fetch or create user record
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        if _CLERK_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Ensure the Clerk webhook is configured.",
            )
        # Auto-create demo user
        user = User(
            id=DEMO_USER_ID,
            email="demo@amarktai.com",
            name="Demo User",
            plan=PlanType.PRO,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that ensures the current user is an admin.
    Admin status is determined by:
      1. The ADMIN_USER_IDS env var (comma-separated Clerk user IDs), OR
      2. The user's email matching ADMIN_EMAIL (platform owner — defaults to amarktainetwork@gmail.com).
    In demo mode (no Clerk key) the demo user is always admin.
    Admin users bypass all cost/quota restrictions.
    """
    admin_ids_raw = os.getenv("ADMIN_USER_IDS", "")
    admin_ids = [uid.strip() for uid in admin_ids_raw.split(",") if uid.strip()]

    if not _CLERK_ENABLED:
        # In demo mode, the demo user is always admin
        return current_user

    # Allow by Clerk user ID or by email (platform owner always has access)
    admin_email = settings.ADMIN_EMAIL or "amarktainetwork@gmail.com"
    is_admin = (
        current_user.id in admin_ids
        or (current_user.email and current_user.email.lower() == admin_email.lower())
    )

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
