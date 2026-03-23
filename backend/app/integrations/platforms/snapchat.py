"""
Snapchat platform integration via Snapchat Marketing API.

Note: Full auto-post (Story creation) requires an approved Snapchat
developer application with the `snapchat-marketing-api` scope.
The token-based flow documented here works for approved apps only.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_API_BASE = "https://adsapi.snapchat.com/v1"
_AUTH_BASE = "https://accounts.snapchat.com/accounts/oauth2"


class SnapchatPlatform(BasePlatform):
    """
    Snapchat Marketing API integration.

    Limitations:
    - Organic story posting is not available via public API without an
      approved app with specific permissions.
    - Ad-based posting (Snap Ads) is supported via the Marketing API with
      an approved ad account.
    - This implementation exposes the connection/analytics path and documents
      the posting limitation honestly.
    """

    def __init__(
        self,
        access_token: str,
        ad_account_id: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.ad_account_id = ad_account_id

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.access_token}"}

    def verify_connection(self) -> bool:
        try:
            resp = httpx.get(
                f"{_API_BASE}/me",
                headers=self._headers(),
                timeout=10,
            )
            return resp.status_code == 200
        except Exception as exc:
            logger.warning("Snapchat verify_connection failed: %s", exc)
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
        """
        Organic story posting via the public API requires a Snapchat-approved
        application.  This method returns an informative error until the app is
        approved.  Ad creation via the Marketing API is available if
        ad_account_id is set — implement that path per your approval scope.
        """
        return {
            "success": False,
            "post_id": None,
            "url": None,
            "error": (
                "Snapchat organic story posting requires an approved app with "
                "the `snapchat-marketing-api` scope.  Please apply for access "
                "at https://developers.snap.com/."
            ),
        }

    def get_analytics(self) -> dict:
        """Return campaign/ad account stats if ad_account_id is configured."""
        if not self.ad_account_id:
            return {}
        try:
            resp = httpx.get(
                f"{_API_BASE}/adaccounts/{self.ad_account_id}/stats",
                headers=self._headers(),
                timeout=10,
            )
            return resp.json() if resp.status_code == 200 else {}
        except Exception as exc:
            logger.warning("Snapchat get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Snapchat does not support comment replies via the public API."""
        return {
            "success": False,
            "reply_id": None,
            "error": "Snapchat API does not support comment replies",
        }

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        """Refresh Snapchat access token using the stored refresh_token."""
        if not self.refresh_token:
            return False
        try:
            from app.core.config import settings
            resp = httpx.post(
                f"{_AUTH_BASE}/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                    "client_id": settings.SNAPCHAT_CLIENT_ID,
                    "client_secret": settings.SNAPCHAT_CLIENT_SECRET,
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
            logger.warning("Snapchat refresh_access_token failed: %s", exc)
            return False
