"""
Twitter/X platform integration via Tweepy.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)


class TwitterPlatform(BasePlatform):
    """Twitter/X integration via Tweepy v2 API."""

    def __init__(
        self,
        access_token: str,
        access_token_secret: str = "",
        api_key: str = "",
        api_secret: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.access_token_secret = access_token_secret
        self.api_key = api_key
        self.api_secret = api_secret

    def verify_connection(self) -> bool:
        """Verify Twitter credentials are valid."""
        try:
            import tweepy
            client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
            )
            me = client.get_me()
            return me.data is not None
        except Exception as exc:
            logger.warning("Twitter verify_connection failed: %s", exc)
            return False

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        **kwargs: Any,
    ) -> PostResult:
        return self.post({"text": content, "media_urls": media_urls or []})

    def post(self, content: dict) -> dict:
        """Post a tweet. Returns {success, post_id, url, error}."""
        try:
            import tweepy
            client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
            )
            text = content.get("text", "")[:280]
            response = client.create_tweet(text=text)
            tweet_id = response.data["id"]
            return {
                "success": True,
                "post_id": tweet_id,
                "url": f"https://twitter.com/i/web/status/{tweet_id}",
                "error": None,
            }
        except Exception as exc:
            logger.error("Twitter post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return basic account metrics."""
        try:
            import tweepy
            client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
            )
            me = client.get_me(user_fields=["public_metrics"])
            metrics = me.data.public_metrics if me.data else {}
            return {
                "followers": metrics.get("followers_count", 0),
                "following": metrics.get("following_count", 0),
                "tweet_count": metrics.get("tweet_count", 0),
            }
        except Exception as exc:
            logger.warning("Twitter get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Reply to a tweet."""
        try:
            import tweepy
            client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
            )
            response = client.create_tweet(text=text[:280], in_reply_to_tweet_id=comment_id)
            reply_id = response.data["id"]
            return {"success": True, "reply_id": reply_id, "error": None}
        except Exception as exc:
            logger.error("Twitter reply failed: %s", exc)
            return {"success": False, "reply_id": None, "error": str(exc)}

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        data = self.get_analytics()
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
