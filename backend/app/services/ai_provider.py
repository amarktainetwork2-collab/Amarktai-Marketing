"""
Amarktai Marketing — Unified AI Provider Abstraction
=====================================================

Priority order for text generation (lowest cost first):
  1. Qwen/Qwen2.5-72B-Instruct via HuggingFace Serverless (QWEN_API_KEY)
  2. HuggingFace Inference API – Mistral-7B (HUGGINGFACE_TOKEN)
  3. OpenAI (OPENAI_API_KEY) — optional internal fallback only
  4. Template-based fallback — always available

All external provider names are intentionally abstracted here.
Callers receive a neutral provider tag ("ai", "template") and never see
raw provider identifiers in user-facing responses.

Usage
-----
    from app.services.ai_provider import AIProvider

    provider = AIProvider.from_env_or_db(hf_token, qwen_key, openai_key)
    result = await provider.generate_content(webapp_data, platform)
    # result["_provider_tag"] is "ai" or "template" — never a vendor name
"""

from __future__ import annotations

from typing import Any

from app.core.config import settings


class AIProvider:
    """
    Thin façade that selects the best available AI backend and delegates
    to the concrete generator.  Callers never need to know which backend
    is active.
    """

    def __init__(
        self,
        hf_token: str = "",
        qwen_key: str = "",
        openai_key: str = "",
    ) -> None:
        self._hf_token = hf_token or ""
        self._qwen_key = qwen_key or ""
        self._openai_key = openai_key or ""

    # ------------------------------------------------------------------
    # Factory helpers
    # ------------------------------------------------------------------

    @classmethod
    def from_settings(cls) -> "AIProvider":
        """Build from global settings (system-level keys only)."""
        return cls(
            hf_token=settings.HUGGINGFACE_TOKEN,
            qwen_key=settings.QWEN_API_KEY,
            openai_key=settings.OPENAI_API_KEY,
        )

    @classmethod
    def from_keys(
        cls,
        hf_token: str = "",
        qwen_key: str = "",
        openai_key: str = "",
    ) -> "AIProvider":
        """Build with explicit key overrides (e.g. from per-user DB keys)."""
        return cls(
            hf_token=hf_token or settings.HUGGINGFACE_TOKEN,
            qwen_key=qwen_key or settings.QWEN_API_KEY,
            openai_key=openai_key or settings.OPENAI_API_KEY,
        )

    # ------------------------------------------------------------------
    # Provider selection (internal, not exposed to callers)
    # ------------------------------------------------------------------

    def _has_ai_key(self) -> bool:
        return bool(self._qwen_key or self._hf_token)

    def _get_hf_generator(self):
        from app.services.hf_generator import HuggingFaceGenerator
        return HuggingFaceGenerator(
            hf_token=self._hf_token,
            qwen_key=self._qwen_key,
        )

    def _get_openai_orchestrator(self):
        from app.services.openai_service import OpenAIOrchestrator
        return OpenAIOrchestrator(api_key=self._openai_key)

    # ------------------------------------------------------------------
    # Public API — content generation
    # ------------------------------------------------------------------

    async def generate_content(
        self,
        webapp_data: dict[str, Any],
        platform: str,
    ) -> dict[str, Any]:
        """
        Generate platform-optimised social media content.

        Returns the standard content dict::

            {
                "title": str,
                "caption": str,
                "hashtags": list[str],
                "_provider_tag": "ai" | "template",
            }

        ``_provider_tag`` indicates whether real AI generation was used.
        It is safe to include in internal logging but MUST NOT be surfaced
        in user-facing API responses.
        """
        result: dict[str, Any] = {}
        used_ai = False

        if self._has_ai_key():
            try:
                gen = self._get_hf_generator()
                result = await gen.generate_content(webapp_data, platform)
                used_ai = True
            except Exception:
                pass

        # Optional OpenAI polish pass (internal fallback only)
        if used_ai and self._openai_key and not result.get("_generation_error"):
            try:
                oai = self._get_openai_orchestrator()
                result = await oai.validate_and_improve(result, webapp_data, platform)
            except Exception:
                pass  # Silently continue with unimproved result

        if not result or result.get("_generation_error") or not used_ai:
            from app.services.hf_generator import HuggingFaceGenerator
            result = HuggingFaceGenerator._fallback_content(webapp_data, platform)
            used_ai = False

        # Attach internal tag — must be stripped before sending to frontend
        result["_provider_tag"] = "ai" if used_ai else "template"
        return result

    async def generate_batch(
        self,
        webapp_data: dict[str, Any],
        platforms: list[str],
    ) -> dict[str, dict[str, Any]]:
        """Generate content for multiple platforms."""
        results: dict[str, dict[str, Any]] = {}
        for platform in platforms:
            results[platform] = await self.generate_content(webapp_data, platform)
        return results

    async def generate_text(self, prompt: str, max_tokens: int = 512) -> str:
        """
        Generate free-form text using the best available provider.
        Returns the generated text string, or an empty string on failure.
        """
        if self._has_ai_key():
            try:
                gen = self._get_hf_generator()
                # generate_content returns structured content; extract caption as plain text
                result = await gen.generate_content(
                    {"name": "Amarktai", "description": prompt, "url": "", "target_audience": ""},
                    "generic",
                )
                return result.get("caption", "")
            except Exception:
                pass

        if self._openai_key:
            try:
                import httpx
                headers = {
                    "Authorization": f"Bearer {self._openai_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": max_tokens,
                }
                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        json=payload,
                        headers=headers,
                    )
                    resp.raise_for_status()
                    return resp.json()["choices"][0]["message"]["content"]
            except Exception:
                pass

        return ""

    async def summarize(self, text: str) -> str:
        """Summarise text using the best available provider."""
        if self._has_ai_key():
            try:
                gen = self._get_hf_generator()
                return await gen.summarize(text)
            except Exception:
                pass
        return text[:500]

    async def analyze_sentiment(self, text: str) -> dict[str, Any]:
        """Analyse sentiment of text."""
        if self._has_ai_key():
            try:
                gen = self._get_hf_generator()
                return await gen.analyze_sentiment(text)
            except Exception:
                pass
        return {"label": "NEUTRAL", "score": 0.5}

    async def classify_topics(self, text: str, labels: list[str]) -> dict[str, Any]:
        """Zero-shot topic classification."""
        if self._has_ai_key():
            try:
                gen = self._get_hf_generator()
                return await gen.classify_topics(text, labels)
            except Exception:
                pass
        return {"labels": labels, "scores": [1.0 / len(labels)] * len(labels)}

    async def extract_keywords(self, text: str) -> list[str]:
        """Extract keywords from text."""
        if self._has_ai_key():
            try:
                gen = self._get_hf_generator()
                return await gen.extract_keywords(text)
            except Exception:
                pass
        # Naive fallback: return first few words
        words = [w.strip(".,!?") for w in text.split() if len(w) > 4]
        return list(dict.fromkeys(words))[:10]
