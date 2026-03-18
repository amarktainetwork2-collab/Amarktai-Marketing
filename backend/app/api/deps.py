"""
Authentication dependency for FastAPI endpoints.

Requires Clerk JWT verification (production).
Set CLERK_SECRET_KEY in .env to enable authentication.
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
from app.models.user import User

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

_CLERK_ENABLED = bool(settings.CLERK_SECRET_KEY and settings.CLERK_SECRET_KEY != "sk_test_...")


def is_admin_user(user: User) -> bool:
    """Return True if the user has admin privileges (unlimited access, no cost).

    Admin status is determined by:
      1. The user's email matching ADMIN_EMAIL (set via env var), OR
      2. The user's Clerk ID appearing in ADMIN_USER_IDS (comma-separated env var).
    """
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

    Requires a valid Clerk JWT Bearer token.  Raises HTTP 401 if the token is
    missing or invalid, and HTTP 404 if the user has not been created via the
    Clerk webhook yet.
    """
    if not _CLERK_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not available. Please contact support.",
        )

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

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Ensure the Clerk webhook is configured.",
        )

    return user


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that ensures the current user is an admin.
    Admin status is determined by:
      1. The ADMIN_USER_IDS env var (comma-separated Clerk user IDs), OR
      2. The user's email matching ADMIN_EMAIL (platform owner).
    Admin users bypass all cost/quota restrictions.
    """
    if not is_admin_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
