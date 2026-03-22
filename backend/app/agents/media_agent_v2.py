"""
Enhanced Media Agent for AmarktAI Marketing
Orchestrates image/video/audio generation with multiple provider support and fallback routing
"""

import asyncio
import base64
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
import httpx
import os

class MediaType(Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"

class ProviderPriority(Enum):
    FREE = "free"
    CHEAP = "cheap"
    PREMIUM = "premium"

@dataclass
class MediaAsset:
    id: str
    type: MediaType
    url: Optional[str]
    local_path: Optional[str] = None
    metadata: Dict[str, Any] = None
    status: str = "pending"
    provider: str = "unknown"
    cost: float = 0.0

class MediaAgentV2:
    """
    Enhanced Media Agent with multi-provider support and intelligent fallback routing.
    Supports: Hugging Face, Leonardo, OpenAI, Replicate, fal.ai, and more.
    """
    
    def __init__(self, user_api_keys: Dict[str, str] = None, user_plan: str = "free"):
        self.user_api_keys = user_api_keys or {}
        self.user_plan = user_plan
        
        # Provider configurations with priority
        self.providers = {
            "huggingface": {
                "key": self._get_key("HUGGINGFACE_TOKEN"),
                "base_url": "https://api-inference.huggingface.co/models",
                "priority": ProviderPriority.FREE,
                "cost_per_image": 0.0,
                "models": {
                    "image": "black-forest-labs/FLUX.1-dev",
                    "image_fast": "stabilityai/stable-diffusion-xl-base-1.0",
                    "video": "stabilityai/stable-video-diffusion-img2vid"
                }
            },
            "leonardo": {
                "key": self._get_key("LEONARDO_API_KEY"),
                "base_url": "https://cloud.leonardo.ai/api/rest/v1",
                "priority": ProviderPriority.PREMIUM,
                "cost_per_image": 0.03,
                "models": {
                    "image": "e71a1c2f-4f18-462c-9e24-724f8d609b57",  # Leonardo Kino XL
                    "image_photoreal": "6b645e3a-d64f-48e6-8d58-5f85d5b9f6f0"  # Leonardo PhotoReal
                }
            },
            "openai": {
                "key": self._get_key("OPENAI_API_KEY"),
                "base_url": "https://api.openai.com/v1",
                "priority": ProviderPriority.PREMIUM,
                "cost_per_image": 0.04,  # DALL-E 3
                "models": {
                    "image": "dall-e-3",
                    "image_fast": "dall-e-2"
                }
            },
            "replicate": {
                "key": self._get_key("REPLICATE_API_TOKEN"),
                "base_url": "https://api.replicate.com/v1",
                "priority": ProviderPriority.CHEAP,
                "cost_per_image": 0.01,
                "models": {
                    "image": "black-forest-labs/flux-schnell",
                    "video": "stability-ai/stable-video-diffusion"
                }
            },
            "fal": {
                "key": self._get_key("FAL_AI_KEY"),
                "base_url": "https://fal.run",
                "priority": ProviderPriority.CHEAP,
                "cost_per_image": 0.02,
                "models": {
                    "image": "fal-ai/flux/dev",
                    "video": "fal-ai/stable-video-diffusion"
                }
            },
            "siliconflow": {
                "key": self._get_key("SILICONFLOW_API_KEY"),
                "base_url": "https://api.siliconflow.cn/v1",
                "priority": ProviderPriority.FREE,
                "cost_per_image": 0.0,
                "models": {
                    "image": "stabilityai/stable-diffusion-xl-base-1.0"
                }
            }
        }
        
        # Video providers
        self.video_providers = {
            "runway": {
                "key": self._get_key("RUNWAY_API_KEY"),
                "base_url": "https://api.runwayml.com/v1",
                "priority": ProviderPriority.PREMIUM,
                "cost_per_video": 0.20,
            },
            "heygen": {
                "key": self._get_key("HEYGEN_API_KEY"),
                "base_url": "https://api.heygen.com/v1",
                "priority": ProviderPriority.PREMIUM,
                "cost_per_video": 0.30,
            },
            "replicate_video": {
                "key": self._get_key("REPLICATE_API_TOKEN"),
                "base_url": "https://api.replicate.com/v1",
                "priority": ProviderPriority.CHEAP,
                "cost_per_video": 0.05,
            }
        }
        
        # Audio providers
        self.audio_providers = {
            "elevenlabs": {
                "key": self._get_key("ELEVENLABS_API_KEY"),
                "base_url": "https://api.elevenlabs.io/v1",
                "priority": ProviderPriority.PREMIUM,
                "cost_per_char": 0.0001,
            },
            "coqui": {
                "key": self._get_key("COQUI_API_KEY"),
                "base_url": "https://app.coqui.ai/api/v1",
                "priority": ProviderPriority.FREE,
                "cost_per_char": 0.0,
            },
            "playht": {
                "key": self._get_key("PLAYHT_API_KEY"),
                "base_url": "https://play.ht/api/v1",
                "priority": ProviderPriority.CHEAP,
                "cost_per_char": 0.00005,
            }
        }
    
    def _get_key(self, key_name: str) -> Optional[str]:
        """Get API key from user keys or environment."""
        # Check user-provided keys first
        if key_name in self.user_api_keys and self.user_api_keys[key_name]:
            return self.user_api_keys[key_name]
        # Fall back to environment
        return os.getenv(key_name)
    
    def _get_available_providers(self, media_type: str, priority: ProviderPriority = None) -> List[str]:
        """Get list of available providers sorted by priority."""
        if media_type == "image":
            providers = self.providers
        elif media_type == "video":
            providers = self.video_providers
        elif media_type == "audio":
            providers = self.audio_providers
        else:
            return []
        
        available = []
        for name, config in providers.items():
            if config["key"]:
                if priority is None or config["priority"] == priority:
                    available.append(name)
        
        # Sort by priority: FREE first, then CHEAP, then PREMIUM
        priority_order = {ProviderPriority.FREE: 0, ProviderPriority.CHEAP: 1, ProviderPriority.PREMIUM: 2}
        available.sort(key=lambda x: priority_order.get(providers[x]["priority"], 3))
        
        return available
    
    async def generate_content_media(self,
                                   content_package: Dict[str, Any],
                                   platform: str) -> Dict[str, MediaAsset]:
        """Generate all media assets for a content piece with intelligent routing."""
        print(f"🎨 Generating media for {platform}")
        
        assets = {}
        tasks = []
        
        # Generate image if needed
        if "image_prompts" in content_package.get("content", {}):
            image_prompt = content_package["content"]["image_prompts"]["prompts"]["primary"]
            tasks.append(("image", self.generate_image(image_prompt, platform)))
        
        # Generate video if needed
        if "video_script" in content_package.get("content", {}):
            script = content_package["content"]["video_script"]
            video_prompt = f"Short promotional video: {script.get('title', 'product showcase')}"
            tasks.append(("video", self.generate_video(video_prompt)))
            
            # Generate voiceover
            voiceover_text = self._extract_voiceover_text(script)
            if voiceover_text:
                tasks.append(("audio", self.generate_voiceover(voiceover_text)))
        
        # Execute all generation tasks concurrently
        if tasks:
            results = await asyncio.gather(
                *[task[1] for task in tasks],
                return_exceptions=True
            )
            
            for (asset_type, _), result in zip(tasks, results):
                if isinstance(result, Exception):
                    print(f"❌ Failed to generate {asset_type}: {result}")
                    assets[asset_type] = MediaAsset(
                        id=f"failed_{asset_type}_{datetime.now().timestamp()}",
                        type=MediaType.IMAGE if asset_type == "image" else MediaType.VIDEO if asset_type == "video" else MediaType.AUDIO,
                        url=None,
                        status="failed"
                    )
                else:
                    assets[asset_type] = result
        
        return assets
    
    async def generate_image(self, 
                           prompt: str,
                           platform: str = "instagram",
                           width: int = 1024,
                           height: int = 1024,
                           prefer_free: bool = True) -> MediaAsset:
        """Generate image with intelligent provider routing."""
        asset_id = f"img_{datetime.now().timestamp()}"
        
        # Determine aspect ratio from platform
        aspect_ratios = {
            "instagram": (1024, 1024),
            "tiktok": (1080, 1920),
            "youtube": (1920, 1080),
            "twitter": (1600, 900),
            "linkedin": (1200, 627),
            "facebook": (1200, 630),
        }
        
        platform_key = platform.split("_")[0]
        if platform_key in aspect_ratios:
            width, height = aspect_ratios[platform_key]
        
        # Get available providers
        priority = ProviderPriority.FREE if prefer_free and self.user_plan == "free" else None
        providers = self._get_available_providers("image", priority)
        
        if not providers:
            print("⚠️ No image providers available, using placeholder")
            return MediaAsset(
                id=asset_id,
                type=MediaType.IMAGE,
                url=f"https://images.unsplash.com/photo-1551434678-e076c223a692?w={width}&h={height}&fit=crop",
                status="completed",
                metadata={"prompt": prompt, "platform": platform, "note": "Placeholder - no API keys"},
                provider="placeholder",
                cost=0.0
            )
        
        # Try each provider in order
        for provider_name in providers:
            try:
                if provider_name == "huggingface":
                    result = await self._generate_huggingface_image(prompt, width, height)
                elif provider_name == "leonardo":
                    result = await self._generate_leonardo_image(prompt, width, height)
                elif provider_name == "openai":
                    result = await self._generate_openai_image(prompt, width, height)
                elif provider_name == "replicate":
                    result = await self._generate_replicate_image(prompt, width, height)
                elif provider_name == "fal":
                    result = await self._generate_fal_image(prompt, width, height)
                elif provider_name == "siliconflow":
                    result = await self._generate_siliconflow_image(prompt, width, height)
                else:
                    continue
                
                if result:
                    result.id = asset_id
                    return result
                    
            except Exception as e:
                print(f"⚠️ {provider_name} failed: {e}, trying next provider...")
                continue
        
        # All providers failed, return placeholder
        return MediaAsset(
            id=asset_id,
            type=MediaType.IMAGE,
            url=f"https://images.unsplash.com/photo-1551434678-e076c223a692?w={width}&h={height}&fit=crop",
            status="completed",
            metadata={"prompt": prompt, "platform": platform, "note": "Placeholder - all providers failed"},
            provider="placeholder",
            cost=0.0
        )
    
    async def _generate_huggingface_image(self, prompt: str, width: int, height: int) -> Optional[MediaAsset]:
        """Generate image using Hugging Face Inference API."""
        key = self.providers["huggingface"]["key"]
        if not key:
            return None
        
        model = self.providers["huggingface"]["models"]["image"]
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.providers['huggingface']['base_url']}/{model}",
                headers={"Authorization": f"Bearer {key}"},
                json={"inputs": prompt},
                timeout=60.0
            )
            
            if response.status_code == 200:
                # Hugging Face returns raw image bytes
                image_b64 = base64.b64encode(response.content).decode()
                return MediaAsset(
                    id="",
                    type=MediaType.IMAGE,
                    url=f"data:image/jpeg;base64,{image_b64}",
                    status="completed",
                    metadata={"prompt": prompt, "model": model},
                    provider="huggingface",
                    cost=0.0
                )
            else:
                raise Exception(f"Hugging Face error: {response.status_code}")
    
    async def _generate_leonardo_image(self, prompt: str, width: int, height: int) -> Optional[MediaAsset]:
        """Generate image using Leonardo.AI."""
        key = self.providers["leonardo"]["key"]
        if not key:
            return None
        
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "prompt": prompt,
                "width": width,
                "height": height,
                "modelId": self.providers["leonardo"]["models"]["image"],
                "num_images": 1,
                "guidance_scale": 7,
                "scheduler": "EULER_DISCRETE",
                "presetStyle": "DYNAMIC"
            }
            
            response = await client.post(
                f"{self.providers['leonardo']['base_url']}/generations",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            
            data = response.json()
            generation_id = data["sdGenerationJob"]["generationId"]
            
            # Poll for completion
            image_url = await self._poll_leonardo_generation(client, headers, generation_id)
            
            return MediaAsset(
                id="",
                type=MediaType.IMAGE,
                url=image_url,
                status="completed",
                metadata={"prompt": prompt, "generation_id": generation_id},
                provider="leonardo",
                cost=self.providers["leonardo"]["cost_per_image"]
            )
    
    async def _generate_openai_image(self, prompt: str, width: int, height: int) -> Optional[MediaAsset]:
        """Generate image using OpenAI DALL-E."""
        key = self.providers["openai"]["key"]
        if not key:
            return None
        
        # Determine size based on dimensions
        if width > height:
            size = "1792x1024"
        elif height > width:
            size = "1024x1792"
        else:
            size = "1024x1024"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.providers['openai']['base_url']}/images/generations",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": "dall-e-3",
                    "prompt": prompt,
                    "size": size,
                    "n": 1
                },
                timeout=60.0
            )
            response.raise_for_status()
            
            data = response.json()
            image_url = data["data"][0]["url"]
            
            return MediaAsset(
                id="",
                type=MediaType.IMAGE,
                url=image_url,
                status="completed",
                metadata={"prompt": prompt, "size": size},
                provider="openai",
                cost=self.providers["openai"]["cost_per_image"]
            )
    
    async def _generate_replicate_image(self, prompt: str, width: int, height: int) -> Optional[MediaAsset]:
        """Generate image using Replicate."""
        key = self.providers["replicate"]["key"]
        if not key:
            return None
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.providers['replicate']['base_url']}/predictions",
                headers={"Authorization": f"Token {key}"},
                json={
                    "version": self.providers["replicate"]["models"]["image"],
                    "input": {"prompt": prompt, "width": width, "height": height}
                },
                timeout=30.0
            )
            response.raise_for_status()
            
            data = response.json()
            prediction_id = data["id"]
            
            # Poll for completion
            image_url = await self._poll_replicate_prediction(client, key, prediction_id)
            
            return MediaAsset(
                id="",
                type=MediaType.IMAGE,
                url=image_url,
                status="completed",
                metadata={"prompt": prompt, "prediction_id": prediction_id},
                provider="replicate",
                cost=self.providers["replicate"]["cost_per_image"]
            )
    
    async def _generate_fal_image(self, prompt: str, width: int, height: int) -> Optional[MediaAsset]:
        """Generate image using fal.ai."""
        key = self.providers["fal"]["key"]
        if not key:
            return None
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.providers['fal']['base_url']}/fal-ai/flux/dev",
                headers={"Authorization": f"Key {key}"},
                json={"prompt": prompt, "width": width, "height": height},
                timeout=60.0
            )
            response.raise_for_status()
            
            data = response.json()
            image_url = data["images"][0]["url"]
            
            return MediaAsset(
                id="",
                type=MediaType.IMAGE,
                url=image_url,
                status="completed",
                metadata={"prompt": prompt},
                provider="fal",
                cost=self.providers["fal"]["cost_per_image"]
            )
    
    async def _generate_siliconflow_image(self, prompt: str, width: int, height: int) -> Optional[MediaAsset]:
        """Generate image using SiliconFlow."""
        key = self.providers["siliconflow"]["key"]
        if not key:
            return None
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.providers['siliconflow']['base_url']}/images/generations",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": self.providers["siliconflow"]["models"]["image"],
                    "prompt": prompt,
                    "width": width,
                    "height": height
                },
                timeout=60.0
            )
            response.raise_for_status()
            
            data = response.json()
            image_url = data["data"][0]["url"]
            
            return MediaAsset(
                id="",
                type=MediaType.IMAGE,
                url=image_url,
                status="completed",
                metadata={"prompt": prompt},
                provider="siliconflow",
                cost=0.0
            )
    
    async def generate_video(self,
                           prompt: str,
                           image_url: Optional[str] = None,
                           duration: int = 4) -> MediaAsset:
        """Generate video with intelligent provider routing."""
        asset_id = f"vid_{datetime.now().timestamp()}"
        
        # Get available video providers
        providers = self._get_available_providers("video")
        
        if not providers:
            print("⚠️ No video providers available, using placeholder")
            return MediaAsset(
                id=asset_id,
                type=MediaType.VIDEO,
                url="https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-coffee-shop-484-large.mp4",
                status="completed",
                metadata={"prompt": prompt, "note": "Placeholder - no API keys"},
                provider="placeholder",
                cost=0.0
            )
        
        # Try each provider
        for provider_name in providers:
            try:
                if provider_name == "runway":
                    result = await self._generate_runway_video(prompt, image_url, duration)
                elif provider_name == "heygen":
                    result = await self._generate_heygen_video(prompt, image_url, duration)
                elif provider_name == "replicate_video":
                    result = await self._generate_replicate_video(prompt, image_url, duration)
                else:
                    continue
                
                if result:
                    result.id = asset_id
                    return result
                    
            except Exception as e:
                print(f"⚠️ {provider_name} video failed: {e}, trying next provider...")
                continue
        
        # All providers failed
        return MediaAsset(
            id=asset_id,
            type=MediaType.VIDEO,
            url="https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-coffee-shop-484-large.mp4",
            status="completed",
            metadata={"prompt": prompt, "note": "Placeholder - all providers failed"},
            provider="placeholder",
            cost=0.0
        )
    
    async def _generate_runway_video(self, prompt: str, image_url: Optional[str], duration: int) -> Optional[MediaAsset]:
        """Generate video using Runway ML."""
        key = self.video_providers["runway"]["key"]
        if not key:
            return None
        
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "prompt": prompt,
                "duration": duration,
                "motion_bucket_id": 127
            }
            
            if image_url:
                payload["image_url"] = image_url
            
            response = await client.post(
                f"{self.video_providers['runway']['base_url']}/generate",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            
            data = response.json()
            task_id = data["id"]
            
            # Poll for completion
            video_url = await self._poll_runway_generation(client, headers, task_id)
            
            return MediaAsset(
                id="",
                type=MediaType.VIDEO,
                url=video_url,
                status="completed",
                metadata={"prompt": prompt, "task_id": task_id},
                provider="runway",
                cost=self.video_providers["runway"]["cost_per_video"]
            )
    
    async def generate_voiceover(self,
                               text: str,
                               voice_id: str = "21m00Tcm4TlvDq8ikWAM",
                               model_id: str = "eleven_multilingual_v2") -> MediaAsset:
        """Generate voiceover with intelligent provider routing."""
        asset_id = f"audio_{datetime.now().timestamp()}"
        
        # Get available audio providers
        providers = self._get_available_providers("audio")
        
        if not providers:
            print("⚠️ No audio providers available, skipping voiceover")
            return MediaAsset(
                id=asset_id,
                type=MediaType.AUDIO,
                url=None,
                status="completed",
                metadata={"text": text[:100], "note": "No API keys available"},
                provider="none",
                cost=0.0
            )
        
        # Try each provider
        for provider_name in providers:
            try:
                if provider_name == "elevenlabs":
                    result = await self._generate_elevenlabs_audio(text, voice_id, model_id)
                elif provider_name == "coqui":
                    result = await self._generate_coqui_audio(text)
                elif provider_name == "playht":
                    result = await self._generate_playht_audio(text)
                else:
                    continue
                
                if result:
                    result.id = asset_id
                    return result
                    
            except Exception as e:
                print(f"⚠️ {provider_name} audio failed: {e}, trying next provider...")
                continue
        
        # All providers failed
        return MediaAsset(
            id=asset_id,
            type=MediaType.AUDIO,
            url=None,
            status="completed",
            metadata={"text": text[:100], "note": "All providers failed"},
            provider="none",
            cost=0.0
        )
    
    async def _generate_elevenlabs_audio(self, text: str, voice_id: str, model_id: str) -> Optional[MediaAsset]:
        """Generate audio using ElevenLabs."""
        key = self.audio_providers["elevenlabs"]["key"]
        if not key:
            return None
        
        async with httpx.AsyncClient() as client:
            headers = {
                "xi-api-key": key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "text": text[:5000],
                "model_id": model_id,
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
            
            response = await client.post(
                f"{self.audio_providers['elevenlabs']['base_url']}/text-to-speech/{voice_id}",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            
            audio_content = response.content
            audio_base64 = base64.b64encode(audio_content).decode()
            
            cost = len(text) * self.audio_providers["elevenlabs"]["cost_per_char"]
            
            return MediaAsset(
                id="",
                type=MediaType.AUDIO,
                url=f"data:audio/mpeg;base64,{audio_base64}",
                status="completed",
                metadata={"text": text[:100], "voice_id": voice_id},
                provider="elevenlabs",
                cost=cost
            )
    
    async def _generate_coqui_audio(self, text: str) -> Optional[MediaAsset]:
        """Generate audio using Coqui TTS (free alternative)."""
        key = self.audio_providers["coqui"]["key"]
        if not key:
            return None
        
        # Coqui TTS implementation would go here
        # For now, return None to fall back to next provider
        return None
    
    async def _generate_playht_audio(self, text: str) -> Optional[MediaAsset]:
        """Generate audio using Play.ht."""
        key = self.audio_providers["playht"]["key"]
        if not key:
            return None
        
        # Play.ht implementation would go here
        return None
    
    # Polling helpers
    async def _poll_leonardo_generation(self, client: httpx.AsyncClient, headers: Dict, generation_id: str, max_attempts: int = 60) -> str:
        for attempt in range(max_attempts):
            response = await client.get(
                f"{self.providers['leonardo']['base_url']}/generations/{generation_id}",
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            
            if data["generations_by_pk"]["status"] == "COMPLETE":
                return data["generations_by_pk"]["generated_images"][0]["url"]
            
            await asyncio.sleep(2)
        
        raise TimeoutError("Image generation timed out")
    
    async def _poll_replicate_prediction(self, client: httpx.AsyncClient, key: str, prediction_id: str, max_attempts: int = 60) -> str:
        for attempt in range(max_attempts):
            response = await client.get(
                f"{self.providers['replicate']['base_url']}/predictions/{prediction_id}",
                headers={"Authorization": f"Token {key}"},
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "succeeded":
                return data["output"][0]
            elif data["status"] == "failed":
                raise Exception(f"Prediction failed: {data.get('error', 'Unknown error')}")
            
            await asyncio.sleep(2)
        
        raise TimeoutError("Prediction timed out")
    
    async def _poll_runway_generation(self, client: httpx.AsyncClient, headers: Dict, task_id: str, max_attempts: int = 120) -> str:
        for attempt in range(max_attempts):
            response = await client.get(
                f"{self.video_providers['runway']['base_url']}/tasks/{task_id}",
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "SUCCEEDED":
                return data["output"][0]
            elif data["status"] == "FAILED":
                raise Exception(f"Video generation failed: {data.get('error', 'Unknown error')}")
            
            await asyncio.sleep(3)
        
        raise TimeoutError("Video generation timed out")
    
    def _extract_voiceover_text(self, script: Dict[str, Any]) -> str:
        """Extract voiceover text from video script."""
        scenes = script.get("scenes", [])
        voiceover_lines = []
        
        for scene in scenes:
            audio = scene.get("audio", "")
            if audio and len(audio) > 5:
                voiceover_lines.append(audio)
        
        return " ".join(voiceover_lines) if voiceover_lines else script.get("hook", "")
    
    def estimate_cost(self, content_package: Dict[str, Any]) -> Dict[str, float]:
        """Estimate the cost of generating media for a content package."""
        cost = {"image": 0.0, "video": 0.0, "audio": 0.0, "total": 0.0}
        
        content = content_package.get("content", {})
        
        if "image_prompts" in content:
            # Get cheapest available image provider
            providers = self._get_available_providers("image")
            if providers:
                cheapest = min(
                    providers,
                    key=lambda p: self.providers.get(p, {}).get("cost_per_image", float('inf'))
                )
                cost["image"] = self.providers.get(cheapest, {}).get("cost_per_image", 0.0)
        
        if "video_script" in content:
            providers = self._get_available_providers("video")
            if providers:
                cheapest = min(
                    providers,
                    key=lambda p: self.video_providers.get(p, {}).get("cost_per_video", float('inf'))
                )
                cost["video"] = self.video_providers.get(cheapest, {}).get("cost_per_video", 0.0)
            
            # Estimate audio cost
            script = content["video_script"]
            text = self._extract_voiceover_text(script)
            audio_providers = self._get_available_providers("audio")
            if audio_providers and text:
                cheapest = audio_providers[0]  # Free providers first
                cost_per_char = self.audio_providers.get(cheapest, {}).get("cost_per_char", 0.0)
                cost["audio"] = len(text) * cost_per_char
        
        cost["total"] = cost["image"] + cost["video"] + cost["audio"]
        return cost
