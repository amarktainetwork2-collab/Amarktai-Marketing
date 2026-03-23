"""
Pinterest platform integration via Pinterest API v5.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_API_BASE = "https://api.pinterest.com/v5"


class PinterestPlatform(BasePlatform):
    """Pinterest API v5 integration for pin creation."""

    def __init__(
        self,
        access_token: str,
        board_id: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.board_id = board_id

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    def verify_connection(self) -> bool:
        try:
            resp = httpx.get(f"{_API_BASE}/user_account", headers=self._headers(), timeout=10)
            return resp.status_code == 200
        except Exception as exc:
            logger.warning("Pinterest verify_connection failed: %s", exc)
            return False

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        **kwargs: Any,
    ) -> PostResult:
        image_url = (media_urls or [""])[0]
        result = self.post({"description": content, "image_url": image_url})
        return PostResult(
            success=result["success"],
            post_id=result.get("post_id"),
            error=result.get("error"),
            url=result.get("url"),
        )

    def post(self, content: dict) -> dict:
        """Create a Pinterest pin."""
        if not self.board_id:
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": "board_id is required for Pinterest posting",
            }
        image_url = content.get("image_url", "")
        if not image_url:
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": "Pinterest requires an image_url",
            }
        payload = {
            "board_id": self.board_id,
            "description": content.get("description", ""),
            "title": content.get("title", ""),
            "media_source": {"source_type": "image_url", "url": image_url},
            "link": content.get("link", ""),
        }
        try:
            resp = httpx.post(f"{_API_BASE}/pins", headers=self._headers(), json=payload, timeout=20)
            data = resp.json()
            if resp.status_code in (200, 201):
                pin_id = data.get("id", "")
                return {
                    "success": True,
                    "post_id": pin_id,
                    "url": f"https://www.pinterest.com/pin/{pin_id}/",
                    "error": None,
                }
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": str(data.get("message", "Unknown error")),
            }
        except Exception as exc:
            logger.error("Pinterest post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return account analytics summary."""
        try:
            resp = httpx.get(f"{_API_BASE}/user_account/analytics", headers=self._headers(), timeout=10)
            return resp.json() if resp.status_code == 200 else {}
        except Exception as exc:
            logger.warning("Pinterest get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Pinterest does not support comment replies via the public API."""
        return {
            "success": False,
            "reply_id": None,
            "error": "Pinterest API does not support comment replies",
        }

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
