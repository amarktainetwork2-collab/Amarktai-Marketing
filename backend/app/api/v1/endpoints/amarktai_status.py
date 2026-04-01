"""
/api/amarktai/status  —  Local debug / integration status endpoint

Returns the current health, integration state, and supported metric keys for
this app instance.  Useful for:
  - VPS deployment verification
  - AmarktAI Network health polling
  - Local debugging during integration setup

This endpoint is intentionally lightweight and public (no auth required) so
that the AmarktAI dashboard poller can reach it without a user token.
It does NOT expose secrets — the integration token is never returned.
"""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.services.integration import get_last_heartbeat_iso

router = APIRouter()

# Module start time for uptime tracking
_START_TIME = time.time()

# Supported metric keys that this app can send to the main dashboard
SUPPORTED_METRIC_KEYS = [
    "total_users",
    "active_webapps",
    "content_generated_today",
    "content_posted_today",
    "leads_captured_today",
    "platforms_connected",
    "uptime_seconds",
    "db_pool_size",
]


@router.get("/status")
async def amarktai_status() -> dict[str, Any]:
    """
    Local status endpoint for AmarktAI Network integration verification.

    Returns app identity, health, integration readiness, capabilities,
    provider readiness, and the supported metric key list.
    The integration token is NEVER included in the response.
    """
    from app.db.session import SessionLocal
    from app.services.amarktai_network_profile import (
        APP_PROFILE,
        CAPABILITY_PACK,
        get_connection_state,
        get_provider_readiness,
        get_capability_gaps,
    )

    db_ok = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception:
        pass

    uptime_seconds = int(time.time() - _START_TIME)
    connection = get_connection_state()
    providers = get_provider_readiness()
    gaps = get_capability_gaps()

    return {
        "app_id": settings.APP_ID,
        "app_slug": settings.APP_SLUG,
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "category": APP_PROFILE["category"],
        "environment": settings.APP_ENVIRONMENT,
        "health": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "uptime_seconds": uptime_seconds,
        "integration": {
            "enabled": settings.AMARKTAI_INTEGRATION_ENABLED,
            "dashboard_url": settings.AMARKTAI_DASHBOARD_URL or None,
            # token is deliberately omitted — never expose server-side secrets
            "last_heartbeat": get_last_heartbeat_iso(),
            "connected_to_brain": connection["connected_to_brain"],
            "ready_to_deploy": connection["ready_to_deploy"],
            "readiness": connection["readiness"],
        },
        "capabilities": CAPABILITY_PACK,
        "provider_readiness": providers,
        "capability_gaps": gaps,
        "safety": {
            "adult_content": False,
            "moderation_enabled": True,
        },
        "supported_metric_keys": SUPPORTED_METRIC_KEYS,
        "deployment": {
            "subdomain": "marketing.amarktai.com",
            "hosting_scope": "subdomain",
            "hosted_here": True,
        },
    }
