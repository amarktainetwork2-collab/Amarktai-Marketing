"""
LinkedIn platform integration via LinkedIn API v2.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_API_BASE = "https://api.linkedin.com/v2"


class LinkedInPlatform(BasePlatform):
    """LinkedIn integration for UGC posts."""

    def __init__(
        self,
        access_token: str,
        person_urn: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.person_urn = person_urn  # urn:li:person:{id}

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }

    def verify_connection(self) -> bool:
        try:
            resp = httpx.get(f"{_API_BASE}/me", headers=self._headers(), timeout=10)
            return resp.status_code == 200
        except Exception as exc:
            logger.warning("LinkedIn verify_connection failed: %s", exc)
            return False

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        **kwargs: Any,
    ) -> PostResult:
        result = self.post({"text": content})
        return PostResult(
            success=result["success"],
            post_id=result.get("post_id"),
            error=result.get("error"),
            url=result.get("url"),
        )

    def post(self, content: dict) -> dict:
        """Create a LinkedIn UGC post."""
        author = self.person_urn or "urn:li:person:me"
        payload = {
            "author": author,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": content.get("text", "")},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        try:
            resp = httpx.post(
                f"{_API_BASE}/ugcPosts",
                headers=self._headers(),
                json=payload,
                timeout=20,
            )
            data = resp.json()
            if resp.status_code in (200, 201):
                post_id = data.get("id", "")
                return {
                    "success": True,
                    "post_id": post_id,
                    "url": f"https://www.linkedin.com/feed/update/{post_id}",
                    "error": None,
                }
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": data.get("message", "Unknown error"),
            }
        except Exception as exc:
            logger.error("LinkedIn post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return profile follower stats."""
        try:
            resp = httpx.get(
                f"{_API_BASE}/networkSizes/urn:li:person:me",
                headers=self._headers(),
                params={"edgeType": "CompanyFollowedByMember"},
                timeout=10,
            )
            return resp.json() if resp.status_code == 200 else {}
        except Exception as exc:
            logger.warning("LinkedIn get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Reply to a LinkedIn comment."""
        payload = {
            "actor": self.person_urn or "urn:li:person:me",
            "message": {"text": text},
            "parentComment": comment_id,
        }
        try:
            resp = httpx.post(
                f"{_API_BASE}/socialActions/{comment_id}/comments",
                headers=self._headers(),
                json=payload,
                timeout=20,
            )
            if resp.status_code in (200, 201):
                return {"success": True, "reply_id": resp.json().get("id"), "error": None}
            return {"success": False, "reply_id": None, "error": resp.text}
        except Exception as exc:
            return {"success": False, "reply_id": None, "error": str(exc)}

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
