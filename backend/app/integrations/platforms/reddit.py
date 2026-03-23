"""
Reddit platform integration via PRAW (Python Reddit API Wrapper).
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)


class RedditPlatform(BasePlatform):
    """Reddit integration via PRAW OAuth."""

    def __init__(
        self,
        access_token: str,
        refresh_token_value: str = "",
        client_id: str = "",
        client_secret: str = "",
        user_agent: str = "AmarktAIBot/1.0",
        username: str = "",
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self._refresh_token_value = refresh_token_value or refresh_token or ""
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_agent = user_agent
        self.username = username

    def _get_reddit(self):
        import praw
        return praw.Reddit(
            client_id=self.client_id,
            client_secret=self.client_secret,
            user_agent=self.user_agent,
            username=self.username,
            refresh_token=self._refresh_token_value,
        )

    def verify_connection(self) -> bool:
        try:
            reddit = self._get_reddit()
            _ = reddit.user.me()
            return True
        except Exception as exc:
            logger.warning("Reddit verify_connection failed: %s", exc)
            return False

    async def post_content(
        self,
        content: str,
        media_urls: list | None = None,
        subreddit: str = "test",
        title: str = "",
        **kwargs: Any,
    ) -> PostResult:
        result = self.post({"subreddit": subreddit, "title": title or content[:100], "text": content})
        return PostResult(
            success=result["success"],
            post_id=result.get("post_id"),
            error=result.get("error"),
            url=result.get("url"),
        )

    def post(self, content: dict) -> dict:
        """Submit a text post to a subreddit."""
        subreddit_name = content.get("subreddit", "test")
        title = content.get("title", "")
        text = content.get("text", "")
        if not title:
            return {"success": False, "post_id": None, "url": None, "error": "title is required"}
        try:
            reddit = self._get_reddit()
            sub = reddit.subreddit(subreddit_name)
            submission = sub.submit(title=title, selftext=text)
            return {
                "success": True,
                "post_id": submission.id,
                "url": f"https://www.reddit.com{submission.permalink}",
                "error": None,
            }
        except Exception as exc:
            logger.error("Reddit post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Return karma stats for the authenticated user."""
        try:
            reddit = self._get_reddit()
            me = reddit.user.me()
            return {
                "link_karma": me.link_karma,
                "comment_karma": me.comment_karma,
            }
        except Exception as exc:
            logger.warning("Reddit get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Reply to a Reddit comment."""
        try:
            reddit = self._get_reddit()
            comment = reddit.comment(id=comment_id)
            reply = comment.reply(body=text)
            return {"success": True, "reply_id": reply.id, "error": None}
        except Exception as exc:
            logger.error("Reddit reply failed: %s", exc)
            return {"success": False, "reply_id": None, "error": str(exc)}

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
