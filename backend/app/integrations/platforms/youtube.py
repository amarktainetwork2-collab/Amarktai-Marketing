"""
YouTube integration for posting Shorts via YouTube Data API v3.

Requires a valid OAuth2 access token with youtube.upload scope.
"""

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_YT_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos"
_YT_DATA_URL = "https://www.googleapis.com/youtube/v3"


class YouTubePlatform(BasePlatform):
    """YouTube integration for posting Shorts via Data API v3."""

    def __init__(self, access_token: str, refresh_token: Optional[str] = None) -> None:
        super().__init__(access_token, refresh_token)
        self.base_url = _YT_DATA_URL

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        title: str | None = None,
        **kwargs: Any,
    ) -> PostResult:
        """
        Post a YouTube Short.

        YouTube Shorts upload requires:
        1. A valid OAuth2 access token with youtube.upload scope
        2. A video file (downloaded from media_url) uploaded via resumable upload
        3. Video metadata with #Shorts in title/description

        NOTE: Full resumable upload is complex (multi-step). This implementation
        uses the simple upload path which works for small files (<= 5 MB).
        For larger files, a resumable upload session should be used.
        """
        if not self.access_token:
            return PostResult(
                success=False,
                error="YouTube access token not configured. Complete OAuth to connect your account.",
            )

        if not media_urls:
            return PostResult(
                success=False,
                error="Video URL required for YouTube Shorts upload.",
            )

        try:
            # Download the video content first
            async with httpx.AsyncClient(timeout=60) as client:
                video_resp = await client.get(media_urls[0])
                if video_resp.status_code != 200:
                    return PostResult(
                        success=False,
                        error=f"Failed to download video from {media_urls[0]} ({video_resp.status_code})",
                    )
                video_bytes = video_resp.content

            video_title = (title or content[:70]) + " #Shorts"
            description = content + "\n\n#Shorts"
            tags = ["Shorts"] + kwargs.get("hashtags", [])

            metadata = {
                "snippet": {
                    "title": video_title[:100],
                    "description": description[:5000],
                    "tags": tags[:30],
                    "categoryId": "22",  # People & Blogs
                },
                "status": {
                    "privacyStatus": "public",
                    "selfDeclaredMadeForKids": False,
                },
            }

            # YouTube simple upload (metadata + media in one request)
            import json
            boundary = "amarktai_upload_boundary"
            body = (
                f"--{boundary}\r\n"
                f'Content-Type: application/json; charset=UTF-8\r\n\r\n'
                f'{json.dumps(metadata)}\r\n'
                f"--{boundary}\r\n"
                f'Content-Type: video/mp4\r\n'
                f'Content-Transfer-Encoding: binary\r\n\r\n'
            ).encode() + video_bytes + f"\r\n--{boundary}--\r\n".encode()

            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(
                    f"{_YT_UPLOAD_URL}?uploadType=multipart&part=snippet,status",
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": f"multipart/related; boundary={boundary}",
                    },
                    content=body,
                )
                data = resp.json()

                if resp.status_code in (200, 201) and "id" in data:
                    video_id = data["id"]
                    return PostResult(
                        success=True,
                        post_id=video_id,
                        url=f"https://youtube.com/shorts/{video_id}",
                    )

                error_msg = data.get("error", {}).get("message", f"Upload failed ({resp.status_code})")
                return PostResult(success=False, error=f"YouTube API: {error_msg}")

        except httpx.TimeoutException:
            return PostResult(success=False, error="YouTube API request timed out")
        except Exception as e:
            logger.error("YouTube post_content failed: %s", e)
            return PostResult(success=False, error=str(e))

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:
        """Get analytics for a YouTube video."""
        if not self.access_token:
            return PlatformAnalytics()
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"{_YT_DATA_URL}/videos",
                    params={
                        "part": "statistics",
                        "id": post_id,
                    },
                    headers={"Authorization": f"Bearer {self.access_token}"},
                )
                if resp.status_code != 200:
                    return PlatformAnalytics()
                items = resp.json().get("items", [])
                if not items:
                    return PlatformAnalytics()
                stats = items[0].get("statistics", {})
                views = int(stats.get("viewCount", 0))
                likes = int(stats.get("likeCount", 0))
                comments = int(stats.get("commentCount", 0))
                total = views if views > 0 else 1
                rate = ((likes + comments) / total * 100)
                return PlatformAnalytics(
                    views=views,
                    likes=likes,
                    comments=comments,
                    shares=0,
                    engagement_rate=round(rate, 2),
                )
        except Exception as e:
            logger.warning("YouTube get_analytics failed: %s", e)
            return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        """Refresh YouTube/Google OAuth2 access token."""
        if not self.refresh_token:
            return False
        try:
            from app.core.config import settings
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": settings.YOUTUBE_CLIENT_ID,
                        "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                        "refresh_token": self.refresh_token,
                        "grant_type": "refresh_token",
                    },
                )
                data = resp.json()
                if "access_token" in data:
                    self.access_token = data["access_token"]
                    return True
        except Exception as e:
            logger.warning("YouTube token refresh failed: %s", e)
        return False
