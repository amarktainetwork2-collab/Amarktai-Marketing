"""
Threads platform integration via Meta Threads API (Instagram Business Graph).

Threads uses the same app credentials as Instagram.  Posts require:
  - A long-lived access token with `threads_basic` and `threads_content_publish` scopes.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_API_BASE = "https://graph.threads.net/v1.0"


class ThreadsPlatform(BasePlatform):
    """Meta Threads API integration."""

    def __init__(
        self,
        access_token: str,
        user_id: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.user_id = user_id

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.access_token}"}

    def verify_connection(self) -> bool:
        try:
            resp = httpx.get(
                f"{_API_BASE}/me",
                headers=self._headers(),
                params={"fields": "id,username"},
                timeout=10,
            )
            return resp.status_code == 200
        except Exception as exc:
            logger.warning("Threads verify_connection failed: %s", exc)
            return False

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        **kwargs: Any,
    ) -> PostResult:
        result = self.post({"text": content, "media_urls": media_urls or []})
        return PostResult(
            success=result["success"],
            post_id=result.get("post_id"),
            error=result.get("error"),
            url=result.get("url"),
        )

    def post(self, content: dict) -> dict:
        """Create and publish a Threads post."""
        user_id = self.user_id or "me"
        text = content.get("text", "")[:500]
        media_urls = content.get("media_urls", [])

        try:
            # Step 1: Create container
            container_payload: dict[str, Any] = {
                "media_type": "TEXT",
                "text": text,
                "access_token": self.access_token,
            }
            if media_urls:
                container_payload["media_type"] = "IMAGE"
                container_payload["image_url"] = media_urls[0]

            container_resp = httpx.post(
                f"{_API_BASE}/{user_id}/threads",
                data=container_payload,
                timeout=20,
            )
            container_data = container_resp.json()
            if container_resp.status_code not in (200, 201):
                return {
                    "success": False,
                    "post_id": None,
                    "url": None,
                    "error": str(container_data.get("error", {}).get("message", "Container creation failed")),
                }
            container_id = container_data["id"]

            # Step 2: Publish
            publish_resp = httpx.post(
                f"{_API_BASE}/{user_id}/threads_publish",
                data={"creation_id": container_id, "access_token": self.access_token},
                timeout=20,
            )
            publish_data = publish_resp.json()
            if publish_resp.status_code in (200, 201) and "id" in publish_data:
                post_id = publish_data["id"]
                return {"success": True, "post_id": post_id, "url": None, "error": None}
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": str(publish_data.get("error", {}).get("message", "Publish failed")),
            }
        except Exception as exc:
            logger.error("Threads post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return Threads insights."""
        user_id = self.user_id or "me"
        try:
            resp = httpx.get(
                f"{_API_BASE}/{user_id}/threads_insights",
                headers=self._headers(),
                params={"metric": "views,likes,replies,reposts,quotes"},
                timeout=10,
            )
            return resp.json() if resp.status_code == 200 else {}
        except Exception as exc:
            logger.warning("Threads get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Reply to a Threads post."""
        result = self.post({"text": text, "reply_to_id": comment_id})
        return result

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
