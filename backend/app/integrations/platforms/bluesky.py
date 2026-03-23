"""
Bluesky platform integration via AT Protocol (atproto library).
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)


class BlueskyPlatform(BasePlatform):
    """Bluesky integration via AT Protocol."""

    def __init__(
        self,
        access_token: str,
        handle: str = "",
        app_password: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.handle = handle
        self.app_password = app_password

    def _get_client(self):
        from atproto import Client
        client = Client()
        client.login(self.handle, self.app_password)
        return client

    def verify_connection(self) -> bool:
        try:
            client = self._get_client()
            profile = client.get_profile(self.handle)
            return profile is not None
        except Exception as exc:
            logger.warning("Bluesky verify_connection failed: %s", exc)
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
        """Create a Bluesky post (skeet)."""
        text = content.get("text", "")[:300]
        try:
            client = self._get_client()
            response = client.send_post(text=text)
            uri = response.uri
            cid = response.cid
            # Build URL from handle and rkey
            rkey = uri.split("/")[-1]
            url = f"https://bsky.app/profile/{self.handle}/post/{rkey}"
            return {"success": True, "post_id": cid, "url": url, "error": None}
        except Exception as exc:
            logger.error("Bluesky post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return basic profile stats."""
        try:
            client = self._get_client()
            profile = client.get_profile(self.handle)
            return {
                "followers": getattr(profile, "followers_count", 0),
                "following": getattr(profile, "follows_count", 0),
                "posts": getattr(profile, "posts_count", 0),
            }
        except Exception as exc:
            logger.warning("Bluesky get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Reply to a Bluesky post."""
        try:
            from atproto import models
            client = self._get_client()
            # comment_id is expected as "uri:cid"
            if ":" in comment_id:
                uri, cid = comment_id.split(":", 1)
            else:
                return {"success": False, "reply_id": None, "error": "comment_id must be 'uri:cid'"}
            root_ref = models.ComAtprotoRepoStrongRef.Main(cid=cid, uri=uri)
            reply_ref = models.AppBskyFeedPost.ReplyRef(parent=root_ref, root=root_ref)
            response = client.send_post(text=text[:300], reply_to=reply_ref)
            return {"success": True, "reply_id": response.cid, "error": None}
        except Exception as exc:
            logger.error("Bluesky reply failed: %s", exc)
            return {"success": False, "reply_id": None, "error": str(exc)}

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
