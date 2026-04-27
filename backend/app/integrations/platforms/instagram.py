"""
Instagram integration for posting Reels and images via the Meta Graph API.

Requires a valid user access token with instagram_basic and instagram_content_publish
permissions, plus the numeric Instagram Business Account ID.
"""

import logging
from typing import Any, Optional

import httpx

Instagram integration for posting Reels and images via Meta Graph API.

Uses the container-create → poll → publish flow for all content types.
"""

import asyncio
import logging
import httpx
from typing import Optional
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
    def __init__(self, access_token: str, instagram_account_id: str, refresh_token: Optional[str] = None):
        super().__init__(access_token, refresh_token)
        self.instagram_account_id = instagram_account_id
        self.base_url = "https://graph.facebook.com/v18.0"

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
        media_urls: list = None,
        content_type: str = "REELS",
        **kwargs,
    ) -> PostResult:
        """
        Post to Instagram via the Meta Graph API container create → publish flow.

        Args:
            content: Caption text
            media_urls: List of media URLs (publicly accessible)
            content_type: "REELS", "CAROUSEL", or "IMAGE"

        Returns:
            PostResult with real post ID and URL, or an explicit error
        """
        if not self.access_token:
            return PostResult(success=False, error="Instagram access token is missing. Connect Instagram in Platforms settings.")

        if not self.instagram_account_id:
            return PostResult(success=False, error="Instagram Account ID is not configured. Update your Instagram connection in Platforms settings.")

        if not media_urls or not media_urls[0]:
            return PostResult(success=False, error="No media URL provided for Instagram post.")

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
                    container_params = {
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
                elif content_type == "CAROUSEL" and len(media_urls) > 1:
                    # Carousel requires creating individual containers first
                    children_ids = []
                    for url in media_urls[:10]:
                        child_resp = await client.post(
                            container_url,
                            data={
                                "image_url": url,
                                "is_carousel_item": "true",
                                "access_token": self.access_token,
                            },
                        )
                        if child_resp.is_success:
                            children_ids.append(child_resp.json().get("id"))
                        else:
                            logger.warning("Instagram carousel child creation failed: %s", child_resp.text)

                    if not children_ids:
                        return PostResult(success=False, error="Failed to create carousel media containers.")

                    container_params = {
                        "media_type": "CAROUSEL",
                        "children": ",".join(children_ids),
                        "caption": content,
                        "access_token": self.access_token,
                    }
                else:
                    container_params = {
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
                container_resp = await client.post(container_url, data=container_params)
                if not container_resp.is_success:
                    return PostResult(
                        success=False,
                        error=f"Instagram container creation failed: {container_resp.status_code} {container_resp.text}",
                    )

                container_id = container_resp.json().get("id")
                if not container_id:
                    return PostResult(success=False, error="Instagram did not return a container ID.")

                # Step 2: Poll for container status (REELS need processing time)
                if content_type == "REELS":
                    for attempt in range(30):
                        await asyncio.sleep(2)
                        status_resp = await client.get(
                            f"{self.base_url}/{container_id}",
                            params={"fields": "status_code", "access_token": self.access_token},
                        )
                        if status_resp.is_success:
                            status_code = status_resp.json().get("status_code")
                            if status_code == "FINISHED":
                                break
                            if status_code == "ERROR":
                                return PostResult(success=False, error="Instagram media processing failed.")
                    else:
                        return PostResult(success=False, error="Instagram media processing timed out.")

                # Step 3: Publish the container
                publish_url = f"{self.base_url}/{self.instagram_account_id}/media_publish"
                publish_resp = await client.post(
                    publish_url,
                    data={
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

                if not publish_resp.is_success:
                    return PostResult(
                        success=False,
                        error=f"Instagram publish failed: {publish_resp.status_code} {publish_resp.text}",
                    )

                media_id = publish_resp.json().get("id", "")

                # Step 4: Get the permalink
                permalink = f"https://instagram.com/p/{media_id}"
                try:
                    link_resp = await client.get(
                        f"{self.base_url}/{media_id}",
                        params={"fields": "permalink", "access_token": self.access_token},
                    )
                    if link_resp.is_success:
                        permalink = link_resp.json().get("permalink", permalink)
                except Exception:
                    pass

                return PostResult(
                    success=True,
                    post_id=media_id,
                    url=permalink,
                )

        except httpx.TimeoutException:
            return PostResult(success=False, error="Instagram API request timed out.")
        except Exception as e:
            logger.exception("Instagram posting failed")
            return PostResult(success=False, error=f"Instagram posting error: {str(e)}")

    async def post_reel(self, video_url: str, caption: str, hashtags: list = None) -> PostResult:
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
            from app.core.config import settings
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"{_GRAPH_BASE}/oauth/access_token",
                    params={
                        "grant_type": "fb_exchange_token",
                        "client_id": settings.META_APP_ID,
                        "client_secret": settings.META_APP_SECRET,
                        "fb_exchange_token": self.access_token,
                    },
                )
                data = resp.json()
                if "access_token" in data:
                    self.access_token = data["access_token"]
        """Get analytics for an Instagram post via the Insights API."""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"{self.base_url}/{post_id}/insights",
                    params={
                        "metric": "impressions,reach,engagement",
                        "access_token": self.access_token,
                    },
                )
                if resp.is_success:
                    metrics = {d["name"]: d["values"][0]["value"] for d in resp.json().get("data", []) if d.get("values")}
                    impressions = metrics.get("impressions", 0)
                    engagement = metrics.get("engagement", 0)
                    reach = metrics.get("reach", 0)
                    rate = (engagement / max(reach, 1)) * 100
                    return PlatformAnalytics(
                        views=impressions,
                        likes=0,
                        comments=0,
                        shares=0,
                        clicks=0,
                        engagement_rate=round(rate, 2),
                    )
        except Exception as e:
            logger.warning("Failed to fetch Instagram analytics for %s: %s", post_id, e)

        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        """Refresh Instagram long-lived access token."""
        if not self.access_token:
            return False
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"{self.base_url}/oauth/access_token",
                    params={
                        "grant_type": "ig_refresh_token",
                        "access_token": self.access_token,
                    },
                )
                if resp.is_success:
                    self.access_token = resp.json().get("access_token", self.access_token)
                    return True
        except Exception as e:
            logger.warning("Instagram token refresh failed: %s", e)
        return False
