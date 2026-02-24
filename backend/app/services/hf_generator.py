"""
HuggingFace-powered content generation service.

Uses the free HuggingFace Inference API (Serverless) to generate
social media content for all platforms.  Requires a HuggingFace
token with at least the Inference API read permission.
"""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

# Default free model – works on the free/Pro tier without a PRO subscription
_DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"
_HF_INFERENCE_URL = "https://api-inference.huggingface.co/models/{model}"

# Platform-specific guidance injected into the prompt
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
}


def _clean_json(raw: str) -> str:
    """Strip markdown code fences from model output."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


class HuggingFaceGenerator:
    """
    Generates social media content using the HuggingFace Inference API.

    Usage::

        gen = HuggingFaceGenerator(hf_token="hf_...")
        result = await gen.generate_content(webapp_data, "instagram")
        # result = {"title": "...", "caption": "...", "hashtags": [...]}
    """

    def __init__(self, hf_token: str, model: str = _DEFAULT_MODEL):
        self.hf_token = hf_token
        self.model = model
        self._inference_url = _HF_INFERENCE_URL.format(model=model)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def generate_content(
        self,
        webapp_data: dict[str, Any],
        platform: str,
    ) -> dict[str, Any]:
        """
        Generate a complete content package for one platform.

        Returns a dict with keys:
          ``title``, ``caption``, ``hashtags``
        """
        hint = _PLATFORM_HINTS.get(platform, _PLATFORM_HINTS["instagram"])

        prompt = self._build_prompt(webapp_data, platform, hint)
        raw = await self._call_inference(prompt)
        return self._parse_response(raw, platform, webapp_data)

    async def generate_batch(
        self,
        webapp_data: dict[str, Any],
        platforms: list[str],
    ) -> dict[str, dict[str, Any]]:
        """
        Generate content for multiple platforms concurrently.

        Returns ``{platform: content_dict, ...}``.
        """
        import asyncio

        tasks = {p: self.generate_content(webapp_data, p) for p in platforms}
        results: dict[str, dict[str, Any]] = {}
        for platform, coro in tasks.items():
            try:
                results[platform] = await coro
            except Exception as exc:
                results[platform] = self._fallback_content(webapp_data, platform, str(exc))
        return results

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _build_prompt(
        self,
        webapp_data: dict[str, Any],
        platform: str,
        hint: dict[str, str],
    ) -> str:
        name = webapp_data.get("name", "our app")
        description = webapp_data.get("description", "")
        audience = webapp_data.get("target_audience", "general audience")
        features = ", ".join(webapp_data.get("key_features", [])[:4])
        url = webapp_data.get("url", "")

        system = (
            "You are an expert social media copywriter for Amarktai Network. "
            "You create high-converting content that drives leads and engagement. "
            "Always respond with valid JSON only – no markdown, no extra text."
        )

        user = f"""Create a {hint['format']} for this business:

Business: {name}
Description: {description}
Target audience: {audience}
Key features: {features}
Website: {url}

Requirements:
- Caption style: {hint['caption_hint']}
- Caption length: {hint['length']}
- Include {hint['hashtag_count']} relevant hashtags
- The content must drive leads to the website
- Designed and created by Amarktai Network

Respond ONLY with a JSON object with these exact keys:
{{
  "title": "short punchy title (max 100 chars)",
  "caption": "the full post caption",
  "hashtags": ["tag1", "tag2", "tag3"]
}}"""

        # Mistral instruction format
        return f"<s>[INST] <<SYS>>\n{system}\n<</SYS>>\n\n{user} [/INST]"

    async def _call_inference(self, prompt: str) -> str:
        """Call HuggingFace Serverless Inference API."""
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.8,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False,
            },
        }
        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(self._inference_url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        # HF returns list of dicts with "generated_text" key
        if isinstance(data, list) and data:
            return data[0].get("generated_text", "")
        if isinstance(data, dict):
            return data.get("generated_text", str(data))
        return str(data)

    def _parse_response(
        self,
        raw: str,
        platform: str,
        webapp_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Parse JSON from model output, falling back gracefully."""
        try:
            # Find the JSON object in the response
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                obj = json.loads(_clean_json(match.group()))
                title = obj.get("title") or webapp_data.get("name", "New Post")
                caption = obj.get("caption") or ""
                hashtags = obj.get("hashtags") or []
                if isinstance(hashtags, list):
                    hashtags = [h.lstrip("#") for h in hashtags]
                return {"title": title, "caption": caption, "hashtags": hashtags}
        except Exception:
            pass
        return self._fallback_content(webapp_data, platform)

    @staticmethod
    def _fallback_content(
        webapp_data: dict[str, Any],
        platform: str,
        error: str = "",
    ) -> dict[str, Any]:
        """Return minimal viable content when generation fails."""
        name = webapp_data.get("name", "our app")
        url = webapp_data.get("url", "")
        description = webapp_data.get("description", "")
        return {
            "title": f"Discover {name}",
            "caption": (
                f"🚀 {name} – {description[:120]}\n\n"
                f"Check it out: {url}\n\n"
                f"Designed and created by Amarktai Network"
            ),
            "hashtags": ["AI", "Marketing", "Growth", "AmarktaiNetwork"],
            "_generation_error": error,
        }
