"""
Instagram integration for posting Reels and images via the Meta Graph API.

Requires a valid user access token with instagram_basic and instagram_content_publish
permissions, plus the numeric Instagram Business Account ID.
"""

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_GRAPH_BASE = "https://graph.facebook.com/v18.0"


class InstagramPlatform(BasePlatform):
    """Instagram integration for posting Reels and images via Meta Graph API."""

    def __init__(
        self,
        access_token: str,
        instagram_account_id: str,
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.instagram_account_id = instagram_account_id
        self.base_url = _GRAPH_BASE

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        content_type: str = "REELS",
        **kwargs: Any,
    ) -> PostResult:
        """
        Post to Instagram (Reels or images) via Meta Graph API.

        Requires:
        - A valid long-lived user access token
        - The Instagram Business Account ID
        - For Reels: a publicly accessible video URL
        - For images: a publicly accessible image URL
        """
        if not self.access_token:
            return PostResult(
                success=False,
                error="Instagram access token not configured. Complete OAuth to connect your account.",
            )
        if not self.instagram_account_id:
            return PostResult(
                success=False,
                error="Instagram Business Account ID not configured.",
            )

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                # Step 1: Create media container
                container_url = f"{self.base_url}/{self.instagram_account_id}/media"

                if content_type == "REELS":
                    if not media_urls:
                        return PostResult(
                            success=False,
                            error="Video URL required for Instagram Reels.",
                        )
                    params = {
                        "media_type": "REELS",
                        "video_url": media_urls[0],
                        "caption": content,
                        "share_to_feed": "true",
                        "access_token": self.access_token,
                    }
                else:
                    if not media_urls:
                        return PostResult(
                            success=False,
                            error="Image URL required for Instagram post.",
                        )
                    params = {
                        "image_url": media_urls[0],
                        "caption": content,
                        "access_token": self.access_token,
                    }

                resp = await client.post(container_url, params=params)
                data = resp.json()

                if resp.status_code != 200 or "id" not in data:
                    error_msg = data.get("error", {}).get("message", f"Container creation failed ({resp.status_code})")
                    return PostResult(success=False, error=f"Instagram API: {error_msg}")

                container_id = data["id"]

                # Step 2: Publish the container
                publish_url = f"{self.base_url}/{self.instagram_account_id}/media_publish"
                pub_resp = await client.post(
                    publish_url,
                    params={
                        "creation_id": container_id,
                        "access_token": self.access_token,
                    },
                )
                pub_data = pub_resp.json()

                if pub_resp.status_code != 200 or "id" not in pub_data:
                    error_msg = pub_data.get("error", {}).get("message", f"Publish failed ({pub_resp.status_code})")
                    return PostResult(success=False, error=f"Instagram API: {error_msg}")

                media_id = pub_data["id"]
                return PostResult(
                    success=True,
                    post_id=media_id,
                    url=f"https://www.instagram.com/p/{media_id}/",
                )

        except httpx.TimeoutException:
            return PostResult(success=False, error="Instagram API request timed out")
        except Exception as e:
            logger.error("Instagram post_content failed: %s", e)
            return PostResult(success=False, error=str(e))

    async def post_reel(self, video_url: str, caption: str, hashtags: list | None = None) -> PostResult:
        """Post a Reel specifically."""
        full_caption = caption
        if hashtags:
            full_caption += "\n\n" + " ".join([f"#{tag}" for tag in hashtags])
        return await self.post_content(
            content=full_caption,
            media_urls=[video_url],
            content_type="REELS",
        )

    async def post_carousel(self, image_urls: list, caption: str) -> PostResult:
        """Post a carousel of images."""
        return await self.post_content(
            content=caption,
            media_urls=image_urls,
            content_type="CAROUSEL",
        )

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:
        """Get analytics for an Instagram post via Insights API."""
        if not self.access_token:
            return PlatformAnalytics()
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"{self.base_url}/{post_id}/insights",
                    params={
                        "metric": "impressions,reach,likes,comments,shares",
                        "access_token": self.access_token,
                    },
                )
                if resp.status_code != 200:
                    return PlatformAnalytics()
                data = resp.json().get("data", [])
                metrics: dict[str, int] = {}
                for item in data:
                    metrics[item["name"]] = item.get("values", [{}])[0].get("value", 0)
                total = metrics.get("impressions", 0)
                engagement = metrics.get("likes", 0) + metrics.get("comments", 0) + metrics.get("shares", 0)
                rate = (engagement / total * 100) if total > 0 else 0.0
                return PlatformAnalytics(
                    views=metrics.get("impressions", 0),
                    likes=metrics.get("likes", 0),
                    comments=metrics.get("comments", 0),
                    shares=metrics.get("shares", 0),
                    engagement_rate=round(rate, 2),
                )
        except Exception as e:
            logger.warning("Instagram get_analytics failed: %s", e)
            return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        """Refresh a long-lived Instagram/Meta access token."""
        if not self.access_token:
            return False
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"{_GRAPH_BASE}/oauth/access_token",
                    params={
                        "grant_type": "fb_exchange_token",
                        "client_id": "",  # Must be set from config at call site
                        "client_secret": "",
                        "fb_exchange_token": self.access_token,
                    },
                )
                data = resp.json()
                if "access_token" in data:
                    self.access_token = data["access_token"]
                    return True
        except Exception as e:
            logger.warning("Instagram token refresh failed: %s", e)
        return False
