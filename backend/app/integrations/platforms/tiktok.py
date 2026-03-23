"""
TikTok platform integration via TikTok Content Posting API.

Note: Full auto-post requires an approved TikTok developer application.
Video upload uses the chunked upload flow.  Direct posting of images/text
may be limited depending on your app's approval scope.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_API_BASE = "https://open.tiktokapis.com/v2"


class TikTokPlatform(BasePlatform):
    """TikTok integration via Content Posting API (token-based)."""

    def __init__(
        self,
        access_token: str,
        open_id: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.open_id = open_id

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json; charset=UTF-8",
        }

    def verify_connection(self) -> bool:
        try:
            resp = httpx.post(
                f"{_API_BASE}/user/info/",
                headers=self._headers(),
                json={"fields": ["open_id", "display_name"]},
                timeout=10,
            )
            return resp.status_code == 200
        except Exception as exc:
            logger.warning("TikTok verify_connection failed: %s", exc)
            return False

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        **kwargs: Any,
    ) -> PostResult:
        result = self.post({"caption": content, "video_url": (media_urls or [""])[0]})
        return PostResult(
            success=result["success"],
            post_id=result.get("post_id"),
            error=result.get("error"),
            url=result.get("url"),
        )

    def post(self, content: dict) -> dict:
        """
        Initiate a video post via Direct Post API.
        Requires an approved TikTok developer application with
        video.publish scope.
        """
        video_url = content.get("video_url", "")
        caption = content.get("caption", "")
        if not video_url:
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": "TikTok requires a video_url for posting",
            }
        try:
            payload = {
                "post_info": {
                    "title": caption[:2200],
                    "privacy_level": "PUBLIC_TO_EVERYONE",
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False,
                },
                "source_info": {
                    "source": "PULL_FROM_URL",
                    "video_url": video_url,
                },
            }
            resp = httpx.post(
                f"{_API_BASE}/post/publish/video/init/",
                headers=self._headers(),
                json=payload,
                timeout=30,
            )
            data = resp.json()
            if resp.status_code == 200 and data.get("data", {}).get("publish_id"):
                pub_id = data["data"]["publish_id"]
                return {"success": True, "post_id": pub_id, "url": None, "error": None}
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": str(data.get("error", {}).get("message", "Unknown error")),
            }
        except Exception as exc:
            logger.error("TikTok post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return basic account metrics."""
        try:
            resp = httpx.post(
                f"{_API_BASE}/user/info/",
                headers=self._headers(),
                json={"fields": ["follower_count", "following_count", "likes_count", "video_count"]},
                timeout=10,
            )
            data = resp.json()
            user_data = data.get("data", {}).get("user", {})
            return {
                "followers": user_data.get("follower_count", 0),
                "following": user_data.get("following_count", 0),
                "likes": user_data.get("likes_count", 0),
                "video_count": user_data.get("video_count", 0),
            }
        except Exception as exc:
            logger.warning("TikTok get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """TikTok does not support automated comment replies via the public API."""
        return {
            "success": False,
            "reply_id": None,
            "error": "TikTok API does not support automated comment replies",
        }

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        """Refresh TikTok access token using refresh_token."""
        if not self.refresh_token:
            return False
        try:
            from app.core.config import settings
            resp = httpx.post(
                "https://open.tiktokapis.com/v2/oauth/token/",
                data={
                    "client_key": settings.TIKTOK_CLIENT_KEY,
                    "client_secret": settings.TIKTOK_CLIENT_SECRET,
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15,
            )
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token", self.access_token)
                return True
            return False
        except Exception as exc:
            logger.warning("TikTok refresh_access_token failed: %s", exc)
            return False
