"""
API Keys & Integrations Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user_api_key import UserAPIKey, UserIntegration
from app.models.user import User
from app.core.config import settings

router = APIRouter()

# Schemas
class APIKeyCreate(BaseModel):
    key_name: str
    key_value: str

class APIKeyResponse(BaseModel):
    id: str
    key_name: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class IntegrationStatus(BaseModel):
    platform: str
    is_connected: bool
    connected_at: datetime = None
    platform_username: str = None
    auto_post_enabled: bool = False
    auto_reply_enabled: bool = False
    low_risk_auto_reply: bool = False

class IntegrationUpdate(BaseModel):
    auto_post_enabled: bool = None
    auto_reply_enabled: bool = None
    low_risk_auto_reply: bool = None

# API Keys Endpoints
@router.get("/api-keys", response_model=List[APIKeyResponse])
async def get_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all API keys for the current user (values are hidden)."""
    keys = db.query(UserAPIKey).filter(
        UserAPIKey.user_id == current_user.id,
        UserAPIKey.is_active == True
    ).all()
    
    return [
        {
            "id": key.id,
            "key_name": key.key_name,
            "is_active": key.is_active,
            "created_at": key.created_at
        }
        for key in keys
    ]

@router.post("/api-keys", status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new API key for the current user."""
    # Validate key name
    valid_keys = [
        "GROQ_API_KEY",
        "HUGGINGFACE_TOKEN",
        "GOOGLE_GEMINI_API_KEY",
        "LEONARDO_API_KEY",
        "ELEVENLABS_API_KEY",
        "OPENAI_API_KEY",
        "REPLICATE_API_TOKEN",
        "FAL_AI_KEY",
        "SILICONFLOW_API_KEY",
        "COQUI_API_KEY",
        "PLAYHT_API_KEY"
    ]
    
    if api_key.key_name not in valid_keys:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid key name. Must be one of: {', '.join(valid_keys)}"
        )
    
    # Check if key already exists
    existing = db.query(UserAPIKey).filter(
        UserAPIKey.user_id == current_user.id,
        UserAPIKey.key_name == api_key.key_name
    ).first()
    
    if existing:
        # Update existing key
        existing.encrypted_key = UserAPIKey.encrypt_key(api_key.key_value)
        existing.is_active = True
        existing.updated_at = datetime.now()
    else:
        # Create new key
        new_key = UserAPIKey(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            key_name=api_key.key_name,
            encrypted_key=UserAPIKey.encrypt_key(api_key.key_value),
            is_active=True
        )
        db.add(new_key)
    
    db.commit()
    
    return {"message": "API key saved successfully"}

@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete (deactivate) an API key."""
    key = db.query(UserAPIKey).filter(
        UserAPIKey.id == key_id,
        UserAPIKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    key.is_active = False
    db.commit()
    
    return {"message": "API key deleted successfully"}

# Platform Integrations Endpoints
@router.get("/platforms", response_model=List[IntegrationStatus])
async def get_integrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get status of all platform integrations."""
    platforms = [
        "youtube", "tiktok", "instagram", "facebook", "twitter", "linkedin",
        "pinterest", "reddit", "bluesky", "threads", "telegram", "snapchat",
    ]
    
    integrations = db.query(UserIntegration).filter(
        UserIntegration.user_id == current_user.id
    ).all()
    
    integration_map = {i.platform: i for i in integrations}
    
    result = []
    for platform in platforms:
        integration = integration_map.get(platform)
        result.append({
            "platform": platform,
            "is_connected": integration.is_connected if integration else False,
            "connected_at": integration.connected_at if integration else None,
            "platform_username": integration.platform_username if integration else None,
            "auto_post_enabled": integration.auto_post_enabled if integration else False,
            "auto_reply_enabled": integration.auto_reply_enabled if integration else False,
            "low_risk_auto_reply": integration.low_risk_auto_reply if integration else False
        })
    
    return result

@router.get("/platforms/{platform}/connect")
async def connect_platform(
    platform: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get OAuth2 authorization URL for a platform."""
    platform_configs = {
        "youtube": {
            "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "scope": "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly"
        },
        "twitter": {
            "auth_url": "https://twitter.com/i/oauth2/authorize",
            "client_id": settings.TWITTER_CLIENT_ID,
            "scope": "tweet.read tweet.write users.read offline.access"
        },
        "linkedin": {
            "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "scope": "r_liteprofile r_basicprofile w_member_social"
        },
        "instagram": {
            "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
            "client_id": settings.META_APP_ID,
            "scope": "instagram_basic instagram_content_publish"
        },
        "facebook": {
            "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
            "client_id": settings.META_APP_ID,
            "scope": "pages_manage_posts pages_read_engagement"
        },
        "tiktok": {
            "auth_url": "https://www.tiktok.com/auth/authorize",
            "client_id": settings.TIKTOK_CLIENT_KEY,
            "scope": "video.upload video.list"
        },
        "pinterest": {
            "auth_url": "https://www.pinterest.com/oauth/",
            "client_id": settings.PINTEREST_CLIENT_ID,
            "scope": "boards:read pins:read pins:write"
        },
        "reddit": {
            "auth_url": "https://www.reddit.com/api/v1/authorize",
            "client_id": settings.REDDIT_CLIENT_ID,
            "scope": "identity submit read"
        },
        "bluesky": {
            "auth_url": "https://bsky.social/oauth/authorize",
            "client_id": settings.BLUESKY_CLIENT_ID,
            "scope": "atproto"
        },
        "threads": {
            "auth_url": "https://www.threads.net/oauth/authorize",
            "client_id": settings.META_APP_ID,
            "scope": "threads_basic threads_content_publish"
        },
        "telegram": {
            "auth_url": "https://oauth.telegram.org/auth",
            "client_id": settings.TELEGRAM_BOT_TOKEN,
            "scope": "messages"
        },
        "snapchat": {
            "auth_url": "https://accounts.snapchat.com/accounts/oauth2/auth",
            "client_id": settings.SNAPCHAT_CLIENT_ID,
            "scope": "snapchat-marketing-api"
        },
    }
    
    config = platform_configs.get(platform)
    if not config:
        raise HTTPException(status_code=400, detail="Invalid platform")
    
    if not config["client_id"]:
        raise HTTPException(status_code=503, detail=f"{platform} OAuth not configured")
    
    # Build authorization URL
    from urllib.parse import urlencode
    
    params = {
        "client_id": config["client_id"],
        "redirect_uri": f"{settings.FRONTEND_URL}/dashboard/settings/integrations/callback",
        "scope": config["scope"],
        "response_type": "code",
        "state": f"{current_user.id}:{platform}",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    auth_url = f"{config['auth_url']}?{urlencode(params)}"
    
    return {"auth_url": auth_url}

@router.post("/platforms/{platform}/disconnect")
async def disconnect_platform(
    platform: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disconnect a platform integration."""
    integration = db.query(UserIntegration).filter(
        UserIntegration.user_id == current_user.id,
        UserIntegration.platform == platform
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    integration.is_connected = False
    integration.disconnected_at = datetime.now()
    integration.encrypted_access_token = None
    integration.encrypted_refresh_token = None
    
    db.commit()
    
    return {"message": f"{platform} disconnected successfully"}

@router.patch("/platforms/{platform}")
async def update_integration(
    platform: str,
    update: IntegrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update integration settings."""
    integration = db.query(UserIntegration).filter(
        UserIntegration.user_id == current_user.id,
        UserIntegration.platform == platform
    ).first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    if update.auto_post_enabled is not None:
        integration.auto_post_enabled = update.auto_post_enabled
    if update.auto_reply_enabled is not None:
        integration.auto_reply_enabled = update.auto_reply_enabled
    if update.low_risk_auto_reply is not None:
        integration.low_risk_auto_reply = update.low_risk_auto_reply
    
    db.commit()
    
    return {"message": "Integration updated successfully"}

@router.post("/platforms/callback")
async def oauth_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """Handle OAuth2 callback from platforms."""
    # Parse state to get user_id and platform
    try:
        user_id, platform = state.split(":")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    # Exchange code for tokens (platform-specific)
    # This is a simplified version - each platform has different token exchange
    
    # Store tokens
    integration = db.query(UserIntegration).filter(
        UserIntegration.user_id == user_id,
        UserIntegration.platform == platform
    ).first()
    
    if not integration:
        integration = UserIntegration(
            id=str(uuid.uuid4()),
            user_id=user_id,
            platform=platform
        )
        db.add(integration)
    
    integration.is_connected = True
    integration.connected_at = datetime.now()
    # In production, exchange code for actual tokens and encrypt them
    # integration.encrypted_access_token = UserIntegration.encrypt_token(access_token)
    # integration.encrypted_refresh_token = UserIntegration.encrypt_token(refresh_token)
    
    db.commit()
    
    return {"message": "Connected successfully", "platform": platform}

