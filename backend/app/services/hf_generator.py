"""
HuggingFace-powered content generation service.

Uses the free HuggingFace Inference API (Serverless) to generate
social media content for all platforms.  Requires a HuggingFace
token with at least the Inference API read permission.

Also provides helpers used by the three power tools:
  - summarize()         → BART summarisation
  - analyze_sentiment() → DistilBERT sentiment
  - classify_topics()   → BART zero-shot classification
  - extract_keywords()  → Mistral keyword extraction
"""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

# Default free model – works on the free/Pro tier without a PRO subscription
_DEFAULT_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"
_HF_INFERENCE_URL = "https://api-inference.huggingface.co/models/{model}"

# Specialist model handles (all free on HF Serverless)
_SUMMARIZE_MODEL = "facebook/bart-large-cnn"
_SENTIMENT_MODEL = "distilbert-base-uncased-finetuned-sst-2-english"
_ZERO_SHOT_MODEL = "facebook/bart-large-mnli"

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
    "pinterest": {
        "format": "Pinterest pin description",
        "caption_hint": "inspiring, keyword-rich description that tells a visual story with a clear CTA",
        "length": "150-300 characters",
        "hashtag_count": "5-10",
    },
    "reddit": {
        "format": "Reddit post title + body",
        "caption_hint": "engaging, value-first post that fits subreddit culture without being salesy",
        "length": "200-500 characters",
        "hashtag_count": "0",
    },
    "bluesky": {
        "format": "Bluesky skeet / post",
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
        "caption_hint": "informative, value-packed message with a clear link or CTA for the channel audience",
        "length": "200-400 characters",
        "hashtag_count": "2-4",
    },
    "snapchat": {
        "format": "Snapchat Story caption",
        "caption_hint": "short, punchy, visual caption with energy and urgency — Snap-native style",
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


class HuggingFaceGenerator:
    """
    Generates social media content using the HuggingFace Inference API.

    Also provides general NLP utilities (summarise, sentiment, classify).
    """

    def __init__(self, hf_token: str, model: str = _DEFAULT_MODEL):
        self.hf_token = hf_token
        self.model = model
        self._inference_url = _HF_INFERENCE_URL.format(model=model)

    # ------------------------------------------------------------------
    # Content generation
    # ------------------------------------------------------------------

    async def generate_content(
        self,
        webapp_data: dict[str, Any],
        platform: str,
    ) -> dict[str, Any]:
        """Generate a complete content package for one platform."""
        hint = _PLATFORM_HINTS.get(platform, _PLATFORM_HINTS["instagram"])
        prompt = self._build_prompt(webapp_data, platform, hint)
        raw = await self._call_text_generation(self._inference_url, prompt)
        return self._parse_response(raw, platform, webapp_data)

    async def generate_batch(
        self,
        webapp_data: dict[str, Any],
        platforms: list[str],
    ) -> dict[str, dict[str, Any]]:
        """Generate content for multiple platforms concurrently."""
        import asyncio

        results: dict[str, dict[str, Any]] = {}
        for platform in platforms:
            try:
                results[platform] = await self.generate_content(webapp_data, platform)
            except Exception as exc:
                results[platform] = self._fallback_content(webapp_data, platform, str(exc))
        return results

    # ------------------------------------------------------------------
    # Remix  (Content Remix Engine)
    # ------------------------------------------------------------------

    async def remix_to_platform(
        self,
        source_text: str,
        platform: str,
        trending_hashtags: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Remix arbitrary source content (blog post, article, etc.) into a
        platform-optimised social snippet.
        """
        hint = _PLATFORM_HINTS.get(platform, _PLATFORM_HINTS["instagram"])
        hashtag_hint = (
            f"Incorporate some of these trending hashtags where natural: {', '.join(trending_hashtags[:8])}"
            if trending_hashtags
            else "Add relevant trending hashtags."
        )

        system = (
            "You are a viral social media copywriter for Amarktai Network. "
            "Transform the provided content into platform-native posts. "
            "Respond ONLY with valid JSON."
        )
        user = f"""Remix this content into a {hint['format']}:

SOURCE CONTENT:
{source_text[:2000]}

Requirements:
- Style: {hint['caption_hint']}
- Caption length: {hint['length']}
- {hashtag_hint}
- Make it native to {platform} style

JSON format:
{{
  "title": "short hook title",
  "caption": "full post caption",
  "hashtags": ["tag1", "tag2"],
  "key_points": ["point1", "point2", "point3"]
}}"""

        prompt = f"<s>[INST] <<SYS>>\n{system}\n<</SYS>>\n\n{user} [/INST]"
        raw = await self._call_text_generation(self._inference_url, prompt)
        result = self._parse_response(raw, platform, {"name": "Content", "url": "", "description": source_text[:100], "target_audience": "general", "key_features": []})
        result["key_points"] = []
        # Try to extract key_points from raw JSON
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                obj = json.loads(_clean_json(match.group()))
                result["key_points"] = obj.get("key_points", [])
        except Exception:
            pass
        return result

    # ------------------------------------------------------------------
    # Summarisation  (used by Competitor Analyzer + Remix)
    # ------------------------------------------------------------------

    async def summarize(self, text: str, max_length: int = 150) -> str:
        """Summarise text using BART."""
        if len(text) < 100:
            return text
        url = _HF_INFERENCE_URL.format(model=_SUMMARIZE_MODEL)
        payload = {
            "inputs": text[:1024],
            "parameters": {"max_length": max_length, "min_length": 30, "do_sample": False},
        }
        try:
            data = await self._post_hf(url, payload)
            if isinstance(data, list) and data:
                return data[0].get("summary_text", text[:200])
        except Exception:
            pass
        return text[:200]

    # ------------------------------------------------------------------
    # Sentiment analysis  (used by Feedback Alchemy)
    # ------------------------------------------------------------------

    async def analyze_sentiment(self, text: str) -> dict[str, Any]:
        """
        Classify text sentiment.
        Returns {"label": "POSITIVE"|"NEGATIVE"|"NEUTRAL", "score": float}
        """
        url = _HF_INFERENCE_URL.format(model=_SENTIMENT_MODEL)
        payload = {"inputs": text[:512]}
        try:
            data = await self._post_hf(url, payload)
            if isinstance(data, list) and data:
                top = sorted(data[0], key=lambda x: x.get("score", 0), reverse=True)[0]
                return {"label": top["label"], "score": round(top["score"], 3)}
        except Exception:
            pass
        return {"label": "NEUTRAL", "score": 0.5}

    # ------------------------------------------------------------------
    # Zero-shot classification  (competitor gap analysis)
    # ------------------------------------------------------------------

    async def classify_topics(
        self, text: str, candidate_labels: list[str]
    ) -> dict[str, float]:
        """
        Zero-shot classification.
        Returns {label: score} dict sorted by descending score.
        """
        url = _HF_INFERENCE_URL.format(model=_ZERO_SHOT_MODEL)
        payload = {
            "inputs": text[:512],
            "parameters": {"candidate_labels": candidate_labels},
        }
        try:
            data = await self._post_hf(url, payload)
            if isinstance(data, dict):
                return dict(zip(data.get("labels", []), data.get("scores", [])))
        except Exception:
            pass
        return {lbl: 1 / len(candidate_labels) for lbl in candidate_labels}

    # ------------------------------------------------------------------
    # Keyword / hashtag extraction  (Remix + Competitor)
    # ------------------------------------------------------------------

    async def extract_keywords(self, text: str, count: int = 10) -> list[str]:
        """Extract the most relevant keywords from text using Mistral."""
        system = "You are a keyword extraction assistant. Output ONLY a JSON array of keywords."
        user = f"Extract the {count} most important marketing keywords from:\n\n{text[:800]}\n\nJSON array only:"
        prompt = f"<s>[INST] <<SYS>>\n{system}\n<</SYS>>\n\n{user} [/INST]"
        raw = await self._call_text_generation(self._inference_url, prompt, max_tokens=200)
        try:
            match = re.search(r"\[.*?\]", raw, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        # Fallback: split on commas
        words = re.findall(r"\b[A-Za-z][A-Za-z0-9]{2,}\b", raw)
        return list(dict.fromkeys(words))[:count]

    # ------------------------------------------------------------------
    # Competitor / Feedback analysis generators
    # ------------------------------------------------------------------

    async def generate_competitor_insights(
        self,
        competitor_name: str,
        scraped_content: str,
        our_niche: str,
    ) -> dict[str, Any]:
        """Analyse competitor content and generate strategic insights."""
        system = "You are a strategic marketing analyst. Respond ONLY with JSON."
        user = f"""Analyse this competitor's content and provide strategic insights.

Competitor: {competitor_name}
Our niche: {our_niche}

Competitor content sample:
{scraped_content[:1500]}

Provide a JSON object:
{{
  "content_strategy": "brief description of their approach",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "content_gaps": ["gap1", "gap2", "gap3"],
  "recommended_counter_strategies": ["strategy1", "strategy2"],
  "top_topics": ["topic1", "topic2", "topic3"],
  "estimated_posting_frequency": "X posts/day",
  "audience_engagement_level": "high|medium|low"
}}"""
        prompt = f"<s>[INST] <<SYS>>\n{system}\n<</SYS>>\n\n{user} [/INST]"
        raw = await self._call_text_generation(self._inference_url, prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(_clean_json(match.group()))
        except Exception:
            pass
        return {
            "content_strategy": "Analysis unavailable",
            "strengths": [],
            "weaknesses": [],
            "content_gaps": [],
            "recommended_counter_strategies": [],
            "top_topics": [],
            "estimated_posting_frequency": "unknown",
            "audience_engagement_level": "medium",
        }

    async def generate_feedback_insights(
        self,
        feedback_texts: list[str],
        business_context: str,
    ) -> dict[str, Any]:
        """Transform raw feedback into marketing recommendations."""
        combined = "\n---\n".join(feedback_texts[:20])
        system = "You are a marketing strategist. Respond ONLY with JSON."
        user = f"""Analyse these customer reviews and generate marketing recommendations.

Business: {business_context}

Reviews:
{combined[:2000]}

Provide a JSON object:
{{
  "overall_sentiment": "positive|negative|mixed",
  "sentiment_score": 0.75,
  "key_themes": ["theme1", "theme2", "theme3"],
  "praise_points": ["feature1", "feature2"],
  "pain_points": ["issue1", "issue2"],
  "ad_copy_suggestions": ["copy1", "copy2", "copy3"],
  "response_templates": [
    {{"scenario": "positive review", "template": "Thank you..."}},
    {{"scenario": "negative review", "template": "We're sorry..."}}
  ],
  "ab_test_ideas": [
    {{"variant_a": "headline A", "variant_b": "headline B", "hypothesis": "..."}}
  ]
}}"""
        prompt = f"<s>[INST] <<SYS>>\n{system}\n<</SYS>>\n\n{user} [/INST]"
        raw = await self._call_text_generation(self._inference_url, prompt)
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(_clean_json(match.group()))
        except Exception:
            pass
        return {
            "overall_sentiment": "mixed",
            "sentiment_score": 0.5,
            "key_themes": [],
            "praise_points": [],
            "pain_points": [],
            "ad_copy_suggestions": [],
            "response_templates": [],
            "ab_test_ideas": [],
        }

    # ------------------------------------------------------------------
    # Internal helpers
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

        return f"<s>[INST] <<SYS>>\n{system}\n<</SYS>>\n\n{user} [/INST]"

    async def _call_text_generation(
        self, url: str, prompt: str, max_tokens: int = 512
    ) -> str:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": 0.8,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False,
            },
        }
        data = await self._post_hf(url, payload)
        if isinstance(data, list) and data:
            return data[0].get("generated_text", "")
        if isinstance(data, dict):
            return data.get("generated_text", str(data))
        return str(data)

    async def _post_hf(self, url: str, payload: dict) -> Any:
        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()

    def _parse_response(
        self,
        raw: str,
        platform: str,
        webapp_data: dict[str, Any],
    ) -> dict[str, Any]:
        try:
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

