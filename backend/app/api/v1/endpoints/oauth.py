"""
OAuth2 flow endpoints for social platform connections.

Supports: YouTube (Google), Facebook/Instagram (Meta), Twitter/X, LinkedIn, TikTok.
Each platform follows the same init → redirect → callback → store-token pattern.

Tokens are encrypted before storage in the platform_connections table.
"""

from __future__ import annotations

import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.platform_connection import PlatformConnection, PlatformType
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

# ── OAuth config per platform ────────────────────────────────────────────────

_PLATFORM_OAUTH: dict[str, dict[str, Any]] = {
    "youtube": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scopes": "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
        "client_id_key": "YOUTUBE_CLIENT_ID",
        "client_secret_key": "YOUTUBE_CLIENT_SECRET",
    },
    "facebook": {
        "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v18.0/oauth/access_token",
        "scopes": "pages_manage_posts,pages_read_engagement,pages_show_list",
        "client_id_key": "META_APP_ID",
        "client_secret_key": "META_APP_SECRET",
    },
    "instagram": {
        "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v18.0/oauth/access_token",
        "scopes": "instagram_basic,instagram_content_publish,pages_show_list",
        "client_id_key": "META_APP_ID",
        "client_secret_key": "META_APP_SECRET",
    },
    "twitter": {
        "auth_url": "https://twitter.com/i/oauth2/authorize",
        "token_url": "https://api.twitter.com/2/oauth2/token",
        "scopes": "tweet.read tweet.write users.read offline.access",
        "client_id_key": "TWITTER_CLIENT_ID",
        "client_secret_key": "TWITTER_CLIENT_SECRET",
    },
    "linkedin": {
        "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
        "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "scopes": "w_member_social r_liteprofile",
        "client_id_key": "LINKEDIN_CLIENT_ID",
        "client_secret_key": "LINKEDIN_CLIENT_SECRET",
    },
    "tiktok": {
        "auth_url": "https://www.tiktok.com/v2/auth/authorize/",
        "token_url": "https://open.tiktokapis.com/v2/oauth/token/",
        "scopes": "user.info.basic,video.publish",
        "client_id_key": "TIKTOK_CLIENT_KEY",
        "client_secret_key": "TIKTOK_CLIENT_SECRET",
    },
}

# Supported platforms for OAuth
SUPPORTED_OAUTH_PLATFORMS = set(_PLATFORM_OAUTH.keys())


def _get_redirect_uri(platform: str) -> str:
    """Build the OAuth callback URL."""
    base = settings.FRONTEND_URL.rstrip("/")
    return f"{base}/api/v1/oauth/{platform}/callback"


def _get_client_credentials(platform: str) -> tuple[str, str]:
    """Return (client_id, client_secret) for a platform, or raise if not configured."""
    cfg = _PLATFORM_OAUTH[platform]
    client_id = getattr(settings, cfg["client_id_key"], "")
    client_secret = getattr(settings, cfg["client_secret_key"], "")
    return client_id, client_secret


# ── GET /oauth/platforms — list supported platforms + config status ───────────

@router.get("/platforms")
async def list_oauth_platforms(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Return which platforms support OAuth and whether credentials are configured."""
    result: dict[str, dict] = {}
    for platform in _PLATFORM_OAUTH:
        client_id, client_secret = _get_client_credentials(platform)
        result[platform] = {
            "supported": True,
            "configured": bool(client_id and client_secret),
        }
    return {"platforms": result}


# ── GET /oauth/{platform}/init — start OAuth flow ────────────────────────────

@router.get("/{platform}/init")
async def oauth_init(
    platform: str,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """
    Start the OAuth2 authorization flow for a platform.
    Returns the authorization URL to redirect the user to.
    """
    if platform not in _PLATFORM_OAUTH:
        raise HTTPException(status_code=400, detail=f"OAuth not supported for '{platform}'")

    client_id, client_secret = _get_client_credentials(platform)
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=400,
            detail=f"OAuth credentials not configured for {platform}. Set {_PLATFORM_OAUTH[platform]['client_id_key']} and {_PLATFORM_OAUTH[platform]['client_secret_key']} in env.",
        )

    cfg = _PLATFORM_OAUTH[platform]
    # Generate PKCE code_verifier for platforms that require it (Twitter/X)
    code_verifier = secrets.token_urlsafe(64)
    state = f"{current_user.id}:{secrets.token_urlsafe(16)}:{code_verifier}" if platform == "twitter" else f"{current_user.id}:{secrets.token_urlsafe(16)}"
    redirect_uri = _get_redirect_uri(platform)

    params: dict[str, str] = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "state": state,
        "scope": cfg["scopes"],
    }

    # Platform-specific additions
    if platform == "twitter":
        import hashlib, base64
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).rstrip(b"=").decode()
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"

    if platform == "youtube":
        params["access_type"] = "offline"
        params["prompt"] = "consent"

    auth_url = f"{cfg['auth_url']}?{urlencode(params)}"
    return {"auth_url": auth_url, "state": state}


# ── GET /oauth/{platform}/callback — handle OAuth callback ───────────────────

@router.get("/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str = Query(...),
    state: str = Query(""),
    db: Session = Depends(get_db),
):
    """
    Handle the OAuth2 callback. Exchange the authorization code for tokens
    and store them as a PlatformConnection.
    """
    if platform not in _PLATFORM_OAUTH:
        raise HTTPException(status_code=400, detail=f"OAuth not supported for '{platform}'")

    # Extract user_id (and code_verifier for Twitter PKCE) from state
    state_parts = state.split(":") if state else []
    user_id = state_parts[0] if state_parts else ""
    code_verifier = state_parts[2] if len(state_parts) > 2 else ""
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    client_id, client_secret = _get_client_credentials(platform)
    cfg = _PLATFORM_OAUTH[platform]
    redirect_uri = _get_redirect_uri(platform)

    # Exchange code for tokens
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            token_data: dict[str, str] = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": client_id,
                "client_secret": client_secret,
            }

            if platform == "twitter" and code_verifier:
                token_data["code_verifier"] = code_verifier

            resp = await client.post(cfg["token_url"], data=token_data)
            data = resp.json()

            if resp.status_code != 200 or "access_token" not in data:
                error_msg = data.get("error_description", data.get("error", f"Token exchange failed ({resp.status_code})"))
                raise HTTPException(status_code=400, detail=f"OAuth token exchange failed: {error_msg}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error("OAuth callback token exchange failed for %s: %s", platform, e)
        raise HTTPException(status_code=500, detail="Token exchange failed")

    access_token = data["access_token"]
    refresh_token = data.get("refresh_token", "")
    expires_in = data.get("expires_in", 3600)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=int(expires_in))

    # Fetch account info for display
    account_name, account_id = await _fetch_account_info(platform, access_token)

    # Encrypt tokens before storage
    from app.models.user_api_key import UserAPIKey
    enc_access = UserAPIKey.encrypt_key(access_token) if access_token else ""
    enc_refresh = UserAPIKey.encrypt_key(refresh_token) if refresh_token else ""

    # Upsert platform connection
    platform_type = PlatformType(platform)
    existing = db.query(PlatformConnection).filter(
        PlatformConnection.user_id == user_id,
        PlatformConnection.platform == platform_type,
    ).first()

    if existing:
        existing.access_token = enc_access
        existing.refresh_token = enc_refresh
        existing.account_name = account_name
        existing.account_id = account_id
        existing.is_active = True
        existing.connected_at = datetime.now(timezone.utc)
        existing.expires_at = expires_at
    else:
        conn = PlatformConnection(
            id=str(uuid.uuid4()),
            user_id=user_id,
            platform=platform_type,
            account_name=account_name,
            account_id=account_id,
            access_token=enc_access,
            refresh_token=enc_refresh,
            is_active=True,
            expires_at=expires_at,
        )
        db.add(conn)

    db.commit()
    logger.info("OAuth connection stored for user %s on %s (%s)", user_id, platform, account_name)

    # Redirect to frontend integrations page
    # NOTE: platform was validated against _PLATFORM_OAUTH allowlist at function entry (line 180)
    return RedirectResponse(url=settings.FRONTEND_URL + "/dashboard/integrations?oauth=success")  # noqa: E501


async def _fetch_account_info(platform: str, access_token: str) -> tuple[str, str]:
    """Fetch the connected account name and ID after OAuth."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            if platform == "youtube":
                resp = await client.get(
                    "https://www.googleapis.com/youtube/v3/channels",
                    params={"part": "snippet", "mine": "true"},
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                items = resp.json().get("items", [])
                if items:
                    return items[0]["snippet"]["title"], items[0]["id"]

            elif platform in ("facebook", "instagram"):
                resp = await client.get(
                    "https://graph.facebook.com/v18.0/me",
                    params={"access_token": access_token, "fields": "id,name"},
                )
                data = resp.json()
                return data.get("name", "Unknown"), data.get("id", "")

            elif platform == "twitter":
                resp = await client.get(
                    "https://api.twitter.com/2/users/me",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                data = resp.json().get("data", {})
                return data.get("username", "Unknown"), data.get("id", "")

            elif platform == "linkedin":
                resp = await client.get(
                    "https://api.linkedin.com/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                data = resp.json()
                return data.get("name", "Unknown"), data.get("sub", "")

            elif platform == "tiktok":
                resp = await client.get(
                    "https://open.tiktokapis.com/v2/user/info/",
                    headers={"Authorization": f"Bearer {access_token}"},
                    params={"fields": "open_id,display_name"},
                )
                data = resp.json().get("data", {}).get("user", {})
                return data.get("display_name", "Unknown"), data.get("open_id", "")

    except Exception as e:
        logger.warning("Failed to fetch account info for %s: %s", platform, e)

    return "Connected Account", ""
