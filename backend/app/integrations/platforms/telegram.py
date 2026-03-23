"""
Telegram platform integration via Bot API.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.integrations.platforms.base import BasePlatform, PostResult, PlatformAnalytics

logger = logging.getLogger(__name__)

_API_BASE = "https://api.telegram.org"


class TelegramPlatform(BasePlatform):
    """Telegram Bot API integration for channel/group posting."""

    def __init__(
        self,
        access_token: str,  # Bot token (123456789:AAxxxxxxx)
        channel_id: str = "",  # @channel or numeric chat_id
        refresh_token: Optional[str] = None,
    ) -> None:
        super().__init__(access_token, refresh_token)
        self.channel_id = channel_id

    def _bot_url(self, method: str) -> str:
        return f"{_API_BASE}/bot{self.access_token}/{method}"

    def verify_connection(self) -> bool:
        try:
            resp = httpx.get(self._bot_url("getMe"), timeout=10)
            return resp.status_code == 200 and resp.json().get("ok", False)
        except Exception as exc:
            logger.warning("Telegram verify_connection failed: %s", exc)
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
        """Send a message to a Telegram channel or group."""
        chat_id = self.channel_id
        if not chat_id:
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": "channel_id is required for Telegram posting",
            }
        text = content.get("text", "")
        media_urls = content.get("media_urls", [])
        try:
            if media_urls:
                # Send photo with caption
                resp = httpx.post(
                    self._bot_url("sendPhoto"),
                    json={"chat_id": chat_id, "photo": media_urls[0], "caption": text[:1024]},
                    timeout=20,
                )
            else:
                resp = httpx.post(
                    self._bot_url("sendMessage"),
                    json={"chat_id": chat_id, "text": text[:4096], "parse_mode": "HTML"},
                    timeout=20,
                )
            data = resp.json()
            if data.get("ok"):
                msg_id = str(data["result"]["message_id"])
                return {"success": True, "post_id": msg_id, "url": None, "error": None}
            return {
                "success": False,
                "post_id": None,
                "url": None,
                "error": data.get("description", "Unknown error"),
            }
        except Exception as exc:
            logger.error("Telegram post failed: %s", exc)
            return {"success": False, "post_id": None, "url": None, "error": str(exc)}

    def get_analytics(self) -> dict:
        """Telegram Bot API does not expose channel analytics directly."""
        try:
            chat_id = self.channel_id
            if not chat_id:
                return {}
            resp = httpx.post(self._bot_url("getChat"), json={"chat_id": chat_id}, timeout=10)
            data = resp.json()
            if data.get("ok"):
                chat = data["result"]
                return {
                    "title": chat.get("title", ""),
                    "type": chat.get("type", ""),
                    "member_count": chat.get("member_count", 0),
                }
            return {}
        except Exception as exc:
            logger.warning("Telegram get_analytics failed: %s", exc)
            return {}

    def reply(self, comment_id: str, text: str) -> dict:
        """Reply to a Telegram message."""
        chat_id = self.channel_id
        if not chat_id:
            return {"success": False, "reply_id": None, "error": "channel_id required"}
        try:
            resp = httpx.post(
                self._bot_url("sendMessage"),
                json={
                    "chat_id": chat_id,
                    "text": text[:4096],
                    "reply_to_message_id": int(comment_id),
                },
                timeout=20,
            )
            data = resp.json()
            if data.get("ok"):
                return {"success": True, "reply_id": str(data["result"]["message_id"]), "error": None}
            return {"success": False, "reply_id": None, "error": data.get("description")}
        except Exception as exc:
            return {"success": False, "reply_id": None, "error": str(exc)}

    async def get_analytics(self, post_id: str) -> PlatformAnalytics:  # type: ignore[override]
        return PlatformAnalytics()

    async def refresh_access_token(self) -> bool:
        return False
