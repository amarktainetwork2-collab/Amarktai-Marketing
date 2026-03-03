"""
OpenAI Orchestrator Service — the intelligent brain of Amarktai Marketing.

Responsibilities:
  - Generate high-quality social media content when HuggingFace is unavailable
  - Validate and improve content produced by HuggingFace
  - Drive content strategy (best angles, timing, format selection)
  - Power advanced reasoning tasks that need GPT-level understanding

Model strategy (cost-first):
  - gpt-4o-mini (default) – highly capable, very affordable (~$0.15/1M input tokens)
  - gpt-4o             – upgrade for strategy / complex reasoning
  - Falls back gracefully if API key is not configured
"""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

# Default model — cost-efficient, very capable for marketing copy
_DEFAULT_MODEL = "gpt-4o-mini"
_OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

# Platform-specific content hints (mirrors HuggingFaceGenerator hints)
_PLATFORM_HINTS: dict[str, dict[str, str]] = {
    "youtube": {
        "format": "YouTube Shorts video script",
        "caption_hint": "engaging video description with call-to-action",
        "length": "150-300 characters",
        "hashtag_count": "5-8",
    },
    "tiktok": {
        "format": "TikTok short video caption",
        "caption_hint": "hook-first, trend-aware, energetic caption",
        "length": "100-200 characters",
        "hashtag_count": "5-10",
    },
    "instagram": {
        "format": "Instagram Reel / post caption",
        "caption_hint": "visually descriptive, story-driven caption ending with a question",
        "length": "150-300 characters",
        "hashtag_count": "10-15",
    },
    "facebook": {
        "format": "Facebook post",
        "caption_hint": "friendly, conversational post with a link or CTA",
        "length": "200-400 characters",
        "hashtag_count": "3-5",
    },
    "twitter": {
        "format": "Tweet / X post",
        "caption_hint": "punchy, insightful tweet under 280 characters",
        "length": "200-260 characters",
        "hashtag_count": "2-3",
    },
    "linkedin": {
        "format": "LinkedIn professional post",
        "caption_hint": "thought-leadership post with numbered insights or bullet points",
        "length": "400-600 characters",
        "hashtag_count": "3-5",
    },
    "pinterest": {
        "format": "Pinterest pin description",
        "caption_hint": "inspiring, keyword-rich description with a clear CTA",
        "length": "150-300 characters",
        "hashtag_count": "5-10",
    },
    "reddit": {
        "format": "Reddit post title + body",
        "caption_hint": "engaging, value-first post that fits subreddit culture",
        "length": "200-500 characters",
        "hashtag_count": "0",
    },
    "bluesky": {
        "format": "Bluesky post",
        "caption_hint": "conversational, thoughtful post similar to early Twitter style",
        "length": "100-280 characters",
        "hashtag_count": "2-4",
    },
    "threads": {
        "format": "Threads post",
        "caption_hint": "conversational, engaging post that sparks discussion",
        "length": "150-300 characters",
        "hashtag_count": "3-5",
    },
    "telegram": {
        "format": "Telegram channel message",
        "caption_hint": "informative, value-packed message with a clear link or CTA",
        "length": "200-400 characters",
        "hashtag_count": "2-4",
    },
    "snapchat": {
        "format": "Snapchat Story caption",
        "caption_hint": "short, punchy, visual caption with energy and urgency",
        "length": "50-150 characters",
        "hashtag_count": "2-4",
    },
}


def _clean_json(raw: str) -> str:
    """Strip markdown code fences from model output."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


class OpenAIOrchestrator:
    """
    OpenAI-powered intelligent orchestrator for Amarktai Marketing.

    Acts as the brain that:
    1. Generates high-quality content (text, captions, hashtags)
    2. Validates and improves HuggingFace-generated content
    3. Selects the best content strategy / angles
    4. Analyses competitor content and audience insights
    """

    def __init__(self, api_key: str, model: str = _DEFAULT_MODEL):
        self.api_key = api_key
        self.model = model

    # ------------------------------------------------------------------
    # Content generation
    # ------------------------------------------------------------------

    async def generate_content(
        self,
        webapp_data: dict[str, Any],
        platform: str,
    ) -> dict[str, Any]:
        """
        Generate platform-optimised social media content using OpenAI.
        Returns {"title": ..., "caption": ..., "hashtags": [...]}
        """
        hint = _PLATFORM_HINTS.get(platform, _PLATFORM_HINTS["instagram"])
        name = webapp_data.get("name", "our app")
        description = webapp_data.get("description", "")
        audience = webapp_data.get("target_audience", "general audience")
        features = ", ".join(webapp_data.get("key_features", [])[:4])
        url = webapp_data.get("url", "")

        system = (
            "You are an expert social media copywriter for Amarktai Network. "
            "You create high-converting content that drives leads and engagement. "
            "Always respond with ONLY valid JSON — no markdown, no extra text."
        )
        user = (
            f"Create a {hint['format']} for this business:\n\n"
            f"Business: {name}\n"
            f"Description: {description}\n"
            f"Target audience: {audience}\n"
            f"Key features: {features}\n"
            f"Website: {url}\n\n"
            f"Requirements:\n"
            f"- Caption style: {hint['caption_hint']}\n"
            f"- Caption length: {hint['length']}\n"
            f"- Include {hint['hashtag_count']} relevant hashtags\n"
            f"- Drive leads to the website\n\n"
            f"Respond ONLY with a JSON object:\n"
            '{"title": "short punchy title (max 100 chars)", '
            '"caption": "the full post caption", '
            '"hashtags": ["tag1", "tag2", "tag3"]}'
        )

        raw = await self._chat(system, user)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                obj = json.loads(_clean_json(match.group()))
                hashtags = obj.get("hashtags") or []
                if isinstance(hashtags, list):
                    hashtags = [h.lstrip("#") for h in hashtags]
                return {
                    "title": obj.get("title") or f"Discover {name}",
                    "caption": obj.get("caption") or "",
                    "hashtags": hashtags,
                }
        except Exception:
            pass
        return self._fallback_content(webapp_data, platform)

    async def generate_batch(
        self,
        webapp_data: dict[str, Any],
        platforms: list[str],
    ) -> dict[str, dict[str, Any]]:
        """Generate content for multiple platforms (sequentially to avoid rate limits)."""
        results: dict[str, dict[str, Any]] = {}
        for platform in platforms:
            try:
                results[platform] = await self.generate_content(webapp_data, platform)
            except Exception as exc:
                results[platform] = self._fallback_content(webapp_data, platform, str(exc))
        return results

    # ------------------------------------------------------------------
    # Content validation / improvement
    # ------------------------------------------------------------------

    async def validate_and_improve(
        self,
        content: dict[str, Any],
        webapp_data: dict[str, Any],
        platform: str,
    ) -> dict[str, Any]:
        """
        Review HuggingFace-generated content and improve quality.
        Returns improved content dict (same schema as generate_content).
        """
        hint = _PLATFORM_HINTS.get(platform, _PLATFORM_HINTS["instagram"])
        system = (
            "You are a senior social media strategist for Amarktai Network. "
            "Review and improve the given draft content. "
            "Respond ONLY with valid JSON."
        )
        user = (
            f"Review and improve this {platform} post for '{webapp_data.get('name', 'the product')}':\n\n"
            f"Draft title: {content.get('title', '')}\n"
            f"Draft caption: {content.get('caption', '')}\n"
            f"Draft hashtags: {content.get('hashtags', [])}\n\n"
            f"Improve it to be more: {hint['caption_hint']}\n"
            f"Target length: {hint['length']}\n\n"
            "Return improved version as JSON:\n"
            '{"title": "...", "caption": "...", "hashtags": ["tag1", "tag2"]}'
        )
        raw = await self._chat(system, user, max_tokens=600)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                obj = json.loads(_clean_json(match.group()))
                hashtags = obj.get("hashtags") or content.get("hashtags", [])
                if isinstance(hashtags, list):
                    hashtags = [h.lstrip("#") for h in hashtags]
                return {
                    "title": obj.get("title") or content.get("title"),
                    "caption": obj.get("caption") or content.get("caption"),
                    "hashtags": hashtags,
                }
        except Exception:
            pass
        return content  # Return original if improvement fails

    # ------------------------------------------------------------------
    # Content strategy
    # ------------------------------------------------------------------

    async def get_content_strategy(
        self,
        webapp_data: dict[str, Any],
        platforms: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Generate a comprehensive content strategy using OpenAI's reasoning.
        """
        name = webapp_data.get("name", "the product")
        description = webapp_data.get("description", "")
        audience = webapp_data.get("target_audience", "general audience")
        category = webapp_data.get("category", "SaaS")
        platform_list = ", ".join(platforms or ["instagram", "twitter", "linkedin"])

        system = (
            "You are a world-class social media strategist for Amarktai Network. "
            "Create data-driven content strategies. Respond ONLY with valid JSON."
        )
        user = (
            f"Create a content strategy for:\n\n"
            f"Product: {name}\n"
            f"Category: {category}\n"
            f"Description: {description}\n"
            f"Target audience: {audience}\n"
            f"Platforms: {platform_list}\n\n"
            "JSON format:\n"
            "{\n"
            '  "best_content_angles": ["angle1", "angle2", "angle3"],\n'
            '  "platform_priorities": {"instagram": 1, "twitter": 2},\n'
            '  "recommended_posting_frequency": "X per day",\n'
            '  "trending_topics": ["topic1", "topic2"],\n'
            '  "target_emotions": ["emotion1", "emotion2"],\n'
            '  "cta_strategy": "...",\n'
            '  "content_mix": {"educational": 40, "promotional": 30, "entertaining": 30}\n'
            "}"
        )
        raw = await self._chat(system, user, max_tokens=600)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(_clean_json(match.group()))
        except Exception:
            pass
        return {
            "best_content_angles": ["tutorial", "before_after", "social_proof"],
            "platform_priorities": {p: i + 1 for i, p in enumerate(platforms or [])},
            "recommended_posting_frequency": "3 per day",
            "trending_topics": [f"{category} automation", "AI tools"],
            "target_emotions": ["curiosity", "aspiration"],
            "cta_strategy": "Free trial with urgency",
            "content_mix": {"educational": 40, "promotional": 30, "entertaining": 30},
        }

    # ------------------------------------------------------------------
    # Image prompt generation for HuggingFace SDXL
    # ------------------------------------------------------------------

    async def generate_image_prompt(
        self,
        webapp_data: dict[str, Any],
        platform: str,
    ) -> str:
        """
        Generate an optimised image prompt for HuggingFace SDXL.
        """
        name = webapp_data.get("name", "the product")
        category = webapp_data.get("category", "SaaS")

        system = "You are a professional AI image prompt engineer. Be concise and specific."
        user = (
            f"Create a detailed Stable Diffusion XL prompt for a {platform} marketing image "
            f"for '{name}' ({category}). Requirements: professional, modern, high quality, "
            f"no text/watermarks. Return ONLY the prompt text, nothing else."
        )
        prompt = await self._chat(system, user, max_tokens=150)
        if prompt and len(prompt) > 10:
            return prompt.strip()
        return (
            f"Modern professional {category} product showcase, sleek UI dashboard, "
            "clean minimalist design, purple blue gradient, high quality render, "
            "corporate photography, no text, no watermarks"
        )

    # ------------------------------------------------------------------
    # Comment reply generation
    # ------------------------------------------------------------------

    async def generate_comment_reply(
        self,
        comment_text: str,
        platform: str,
        webapp_name: str,
        sentiment: str = "neutral",
    ) -> dict[str, Any]:
        """Generate a contextual reply to a social media comment using OpenAI."""
        tone_hint = {
            "positive": "grateful and encouraging",
            "negative": "empathetic and solution-focused",
            "neutral": "friendly and informative",
        }.get(sentiment, "friendly")

        system = (
            f"You are the community manager for {webapp_name}. "
            "Write genuine, helpful replies. Respond ONLY with valid JSON."
        )
        user = (
            f"Reply to this {platform} comment about {webapp_name}:\n\n"
            f"Comment: {comment_text[:300]}\n"
            f"Sentiment: {sentiment}\n"
            f"Tone required: {tone_hint}\n\n"
            "JSON:\n"
            '{"reply": "Your reply text (max 250 chars)", '
            '"confidence": 0.90, '
            f'"tone": "{tone_hint}", '
            '"lead_potential": true}'
        )
        raw = await self._chat(system, user, max_tokens=250)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(_clean_json(match.group()))
        except Exception:
            pass
        return {
            "reply": f"Thanks for reaching out! 😊 Feel free to explore {webapp_name} for more.",
            "confidence": 0.7,
            "tone": tone_hint,
            "lead_potential": False,
        }

    # ------------------------------------------------------------------
    # Video script generation for YouTube/TikTok
    # ------------------------------------------------------------------

    async def generate_video_script(
        self,
        webapp_data: dict[str, Any],
        platform: str,
    ) -> dict[str, Any]:
        """Generate a platform-optimised video script."""
        name = webapp_data.get("name", "the product")
        description = webapp_data.get("description", "")
        durations = {"youtube": "45-60 seconds", "tiktok": "15-30 seconds", "snapchat": "10-15 seconds"}
        duration = durations.get(platform, "30-45 seconds")

        system = (
            "You are a viral video scriptwriter for Amarktai Network. "
            "Write short, punchy video scripts that drive engagement. "
            "Respond ONLY with valid JSON."
        )
        user = (
            f"Write a {duration} {platform} video script for '{name}':\n"
            f"Description: {description}\n\n"
            "JSON format:\n"
            "{\n"
            '  "title": "Video title with #Shorts",\n'
            '  "hook": "Opening line (0-3s)",\n'
            '  "scenes": [\n'
            '    {"time": "0-3s", "visual": "...", "audio": "...", "text": "..."}\n'
            "  ],\n"
            '  "cta": "Call to action",\n'
            '  "description": "Full video description for upload",\n'
            '  "hashtags": ["Shorts", "tag2", "tag3"]\n'
            "}"
        )
        raw = await self._chat(system, user, max_tokens=700)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(_clean_json(match.group()))
        except Exception:
            pass
        # Template fallback
        return {
            "title": f"How {name} Works #Shorts",
            "hook": f"This is {name} and it changes everything...",
            "scenes": [
                {"time": "0-3s", "visual": "Product logo / hook", "audio": f"Meet {name}", "text": "🚀"},
                {"time": "3-20s", "visual": "Key feature demo", "audio": f"{name} helps you work smarter", "text": "Game changer!"},
                {"time": "20-30s", "visual": "CTA screen", "audio": "Try it free today!", "text": "Link in bio 👆"},
            ],
            "cta": f"Try {name} free",
            "description": f"{description}\n\n#Shorts",
            "hashtags": ["Shorts", "AI", "Productivity"],
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    async def _chat(
        self,
        system: str,
        user: str,
        max_tokens: int = 512,
        model: str | None = None,
    ) -> str:
        """Call OpenAI Chat Completions API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model or self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.8,
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(_OPENAI_CHAT_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    @staticmethod
    def _fallback_content(
        webapp_data: dict[str, Any],
        platform: str,
        error: str = "",
    ) -> dict[str, Any]:
        name = webapp_data.get("name", "our app")
        url = webapp_data.get("url", "")
        description = webapp_data.get("description", "")
        return {
            "title": f"Discover {name}",
            "caption": (
                f"🚀 {name} – {description[:120]}\n\n"
                f"Check it out: {url}\n\n"
                "Designed and created by Amarktai Network"
            ),
            "hashtags": ["AI", "Marketing", "Growth", "AmarktaiNetwork"],
            "_generation_error": error,
        }
