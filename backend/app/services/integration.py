"""
AmarktAI Network Integration Service
=====================================
Outbound integration methods that connect this app (AmarktAI Marketing) to the
main AmarktAI Network dashboard/control plane.

Security model
--------------
- AMARKTAI_INTEGRATION_TOKEN is read from server-side config only.
- It is NEVER exposed to the frontend.
- All outbound requests use Bearer token auth.
- Payloads are validated before sending.
- Logs are sanitised — tokens are never logged.

Endpoints on the main dashboard (expected contract)
----------------------------------------------------
  POST /integrations/heartbeat
  POST /integrations/metrics
  POST /integrations/events
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── module-level state ───────────────────────────────────────────────────────

_last_heartbeat_ts: float | None = None


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_headers() -> dict[str, str]:
    """Build auth headers — token is read server-side, never returned to callers."""
    return {
        "Authorization": f"Bearer {settings.AMARKTAI_INTEGRATION_TOKEN}",
        "Content-Type": "application/json",
        "X-App-ID": settings.APP_ID,
        "X-App-Slug": settings.APP_SLUG,
    }


def _dashboard_url(path: str) -> str:
    base = settings.AMARKTAI_DASHBOARD_URL.rstrip("/")
    return f"{base}/integrations/{path.lstrip('/')}"


def _is_enabled() -> bool:
    return bool(
        settings.AMARKTAI_INTEGRATION_ENABLED
        and settings.AMARKTAI_DASHBOARD_URL
        and settings.AMARKTAI_INTEGRATION_TOKEN
    )


# ─── Public integration methods ───────────────────────────────────────────────

async def send_heartbeat(db_ok: bool = True) -> bool:
    """
    POST /integrations/heartbeat

    Signals to the main AmarktAI dashboard that this app is alive.
    Returns True on success, False on failure (never raises).
    """
    global _last_heartbeat_ts

    if not _is_enabled():
        return False

    payload = {
        "app_id": settings.APP_ID,
        "app_slug": settings.APP_SLUG,
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENVIRONMENT,
        "status": "healthy" if db_ok else "degraded",
        "timestamp": _utc_now(),
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                _dashboard_url("heartbeat"),
                json=payload,
                headers=_build_headers(),
            )
            resp.raise_for_status()
            _last_heartbeat_ts = time.time()
            logger.debug("Heartbeat sent to AmarktAI dashboard (%s)", resp.status_code)
            return True
    except httpx.HTTPStatusError as exc:
        logger.warning(
            "Heartbeat rejected by AmarktAI dashboard (HTTP %s)", exc.response.status_code
        )
    except Exception as exc:
        logger.warning("Heartbeat failed: %s", type(exc).__name__)

    return False


async def send_metrics(metrics: dict[str, Any]) -> bool:
    """
    POST /integrations/metrics

    Sends a structured metrics snapshot to the AmarktAI dashboard.

    Supported metric keys
    ---------------------
    - total_users
    - active_webapps
    - content_generated_today
    - content_posted_today
    - leads_captured_today
    - platforms_connected
    - uptime_seconds
    - db_pool_size

    Any extra keys are forwarded as-is.
    """
    if not _is_enabled():
        return False

    if not isinstance(metrics, dict):
        logger.warning("send_metrics: payload must be a dict, got %s", type(metrics).__name__)
        return False

    payload = {
        "app_id": settings.APP_ID,
        "environment": settings.APP_ENVIRONMENT,
        "timestamp": _utc_now(),
        "metrics": metrics,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                _dashboard_url("metrics"),
                json=payload,
                headers=_build_headers(),
            )
            resp.raise_for_status()
            logger.debug("Metrics sent (%d keys)", len(metrics))
            return True
    except httpx.HTTPStatusError as exc:
        logger.warning("Metrics rejected (HTTP %s)", exc.response.status_code)
    except Exception as exc:
        logger.warning("Metrics failed: %s", type(exc).__name__)

    return False


async def send_event(
    event_type: str,
    data: dict[str, Any] | None = None,
    severity: str = "info",
) -> bool:
    """
    POST /integrations/events

    Sends a discrete event to the AmarktAI dashboard for logging or alerting.

    Parameters
    ----------
    event_type : str
        Dot-namespaced event identifier, e.g. "content.generated", "user.signup",
        "error.generation_failed", "platform.connected".
    data : dict | None
        Arbitrary event payload.  MUST NOT contain secrets or PII beyond what is
        necessary for debugging.
    severity : str
        "info" | "warning" | "error" | "critical"
    """
    if not _is_enabled():
        return False

    allowed_severities = {"info", "warning", "error", "critical"}
    if severity not in allowed_severities:
        severity = "info"

    payload = {
        "app_id": settings.APP_ID,
        "environment": settings.APP_ENVIRONMENT,
        "event_type": str(event_type)[:128],
        "severity": severity,
        "data": data or {},
        "timestamp": _utc_now(),
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                _dashboard_url("events"),
                json=payload,
                headers=_build_headers(),
            )
            resp.raise_for_status()
            logger.debug("Event '%s' sent", event_type)
            return True
    except httpx.HTTPStatusError as exc:
        logger.warning("Event rejected (HTTP %s)", exc.response.status_code)
    except Exception as exc:
        logger.warning("Event send failed: %s", type(exc).__name__)

    return False


def get_last_heartbeat_iso() -> str | None:
    """Return the ISO timestamp of the last successful heartbeat, or None."""
    if _last_heartbeat_ts is None:
        return None
    return datetime.fromtimestamp(_last_heartbeat_ts, tz=timezone.utc).isoformat()
