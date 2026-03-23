"""
Facebook platform integration via Graph API.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_GRAPH_BASE = "https://graph.facebook.com/v18.0"


class FacebookPlatform(BasePlatform):
    """Facebook Graph API integration for page posting."""

    def __init__(
        self,
        access_token: str,
        page_id: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.page_id = page_id

    def verify_connection(self) -> bool:
        try:
            resp = httpx.get(
                f"{_GRAPH_BASE}/me",
                params={"access_token": self.access_token},
                timeout=10,
            )
            return resp.status_code == 200
        except Exception as exc:
            logger.warning("Facebook verify_connection failed: %s", exc)
            return False

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        **kwargs: Any,
    ) -> PostResult:
        result = self.post({"message": content, "media_urls": media_urls or []})
        return PostResult(
            success=result["success"],
            post_id=result.get("post_id"),
            error=result.get("error"),
            url=result.get("url"),
        )

    def post(self, content: dict) -> dict:
        """Post to a Facebook page. Returns {success, post_id, url, error}."""
        page_id = self.page_id or "me"
        try:
            resp = httpx.post(
                f"{_GRAPH_BASE}/{page_id}/feed",
                params={"access_token": self.access_token},
                json={"message": content.get("message", "")},
                timeout=20,
            )
            data = resp.json()
            if resp.status_code == 200 and "id" in data:
                post_id = data["id"]
                return {
                    "success": True,
                    "post_id": post_id,
                    "url": f"https://www.facebook.com/{post_id.replace('_', '/posts/')}",
                    "error": None,
                }
            return {"success": False, "post_id": None, "url": None, "error": data.get("error", {}).get("message", "Unknown error")}
        except Exception as exc:
            logger.error("Facebook post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return page insights."""
        try:
            page_id = self.page_id or "me"
            resp = httpx.get(
                f"{_GRAPH_BASE}/{page_id}",
                params={
                    "access_token": self.access_token,
                    "fields": "fan_count,followers_count",
                },
                timeout=10,
            )
            data = resp.json()
            return {
                "fans": data.get("fan_count", 0),
                "followers": data.get("followers_count", 0),
            }
        except Exception as exc:
            logger.warning("Facebook get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Reply to a comment."""
        try:
            resp = httpx.post(
                f"{_GRAPH_BASE}/{comment_id}/comments",
                params={"access_token": self.access_token},
                json={"message": text},
                timeout=20,
            )
            data = resp.json()
            if resp.status_code == 200:
                return {"success": True, "reply_id": data.get("id"), "error": None}
            return {"success": False, "reply_id": None, "error": data.get("error", {}).get("message")}
        except Exception as exc:
            return {"success": False, "reply_id": None, "error": str(exc)}

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
