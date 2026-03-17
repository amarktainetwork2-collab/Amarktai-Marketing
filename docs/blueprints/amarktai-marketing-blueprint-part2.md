---

# 4. API Keys & Services Configuration

## 4.1 Required API Keys & Services

### Authentication
| Service | Purpose | Cost | Link |
|---------|---------|------|------|
| **Clerk** | User authentication | Free tier: 10K MAU | [clerk.com](https://clerk.com) |
| Alternative: Supabase Auth | Built-in auth | Free tier: 50K users/month | [supabase.com](https://supabase.com) |

### Database & Storage
| Service | Purpose | Cost | Link |
|---------|---------|------|------|
| **Supabase** | PostgreSQL + Storage | Free tier: 500MB DB, 1GB storage | [supabase.com](https://supabase.com) |
| Alternative: Neon | Serverless Postgres | Free tier: 500MB | [neon.tech](https://neon.tech) |
| Upstash Redis | Caching & queues | Free tier: 10K commands/day | [upstash.com](https://upstash.com) |

### LLM Providers (Prioritized by Cost)
| Service | Purpose | Cost | Link |
|---------|---------|------|------|
| **Grok API** | Primary LLM | $5-25/month for API access | [x.ai](https://x.ai) |
| **Anthropic Claude 3.5** | Fallback LLM | $3/million input tokens | [anthropic.com](https://anthropic.com) |
| **OpenAI GPT-4o** | Premium tier | $5/million input tokens | [openai.com](https://openai.com) |
| **Groq** | Ultra-fast inference | Free tier: 1M tokens/day | [groq.com](https://groq.com) |

### Media Generation - Images
| Service | Purpose | Free Tier | Paid Cost | Link |
|---------|---------|-----------|-----------|------|
| **Leonardo.AI** | Image generation | 150 tokens/day | $10/month | [leonardo.ai](https://leonardo.ai) |
| **Ideogram** | Text-in-image | 25 prompts/day | $7/month | [ideogram.ai](https://ideogram.ai) |
| **Replicate (SDXL)** | Stable Diffusion | $5 free credit | Pay per generation | [replicate.com](https://replicate.com) |
| **Pollinations.AI** | Free image gen | Unlimited | Free | [pollinations.ai](https://pollinations.ai) |

### Media Generation - Videos
| Service | Purpose | Free Tier | Paid Cost | Link |
|---------|---------|-----------|-----------|------|
| **Runway ML** | AI video generation | 125 credits (3-4 videos) | $15/month | [runwayml.com](https://runwayml.com) |
| **Pika Labs** | Text-to-video | 30 video credits | $8/month | [pika.art](https://pika.art) |
| **Kling AI** | Video generation | 66 credits/day | $23/month | [klingai.com](https://klingai.com) |
| **Luma Dream Machine** | Video generation | 30 generations/month | $23/month | [lumalabs.ai](https://lumalabs.ai) |

### Media Generation - Voiceover
| Service | Purpose | Free Tier | Paid Cost | Link |
|---------|---------|-----------|-----------|------|
| **ElevenLabs** | Text-to-speech | 10K chars/month | $5/month | [elevenlabs.io](https://elevenlabs.io) |
| **PlayHT** | Voice generation | 5K chars/month | $9/month | [play.ht](https://play.ht) |
| **Cartesia Sonic** | High-quality TTS | Trial credits | Pay per use | [cartesia.ai](https://cartesia.ai) |

### Video Assembly
| Service | Purpose | Free Tier | Paid Cost | Link |
|---------|---------|-----------|-----------|------|
| **Shotstack** | Video editing API | 100 renders/month | $9/month | [shotstack.io](https://shotstack.io) |
| **Creatomate** | Video automation | 50 renders/month | $19/month | [creatomate.com](https://creatomate.com) |
| **Bannerbear** | Image/video templates | 10 API calls | $29/month | [bannerbear.com](https://bannerbear.com) |

### Social Media Platform APIs

#### YouTube
| API | Purpose | Cost | Link |
|-----|---------|------|------|
| **YouTube Data API v3** | Upload Shorts, analytics | Free: 10K units/day | [developers.google.com/youtube](https://developers.google.com/youtube) |

#### TikTok
| API | Purpose | Cost | Link |
|-----|---------|------|------|
| **TikTok for Developers** | Content upload | Free tier available | [developers.tiktok.com](https://developers.tiktok.com) |
| **TikTok Research API** | Analytics | Requires approval | [developers.tiktok.com](https://developers.tiktok.com) |

#### Instagram & Facebook
| API | Purpose | Cost | Link |
|-----|---------|------|------|
| **Meta Graph API** | Posts, Reels, Stories | Free | [developers.facebook.com](https://developers.facebook.com) |
| **Instagram Basic Display** | Basic content access | Free | [developers.facebook.com](https://developers.facebook.com) |

#### X (Twitter)
| API | Purpose | Cost | Link |
|-----|---------|------|------|
| **X API v2 (Free)** | 1,500 tweets/month read | Free | [developer.twitter.com](https://developer.twitter.com) |
| **X API v2 (Basic)** | 3,000 tweets/month write | $100/month | [developer.twitter.com](https://developer.twitter.com) |
| **X API v2 (Pro)** | Full access | $5,000/month | [developer.twitter.com](https://developer.twitter.com) |

#### LinkedIn
| API | Purpose | Cost | Link |
|-----|---------|------|------|
| **LinkedIn API** | Posts, articles | Free tier | [developer.linkedin.com](https://developer.linkedin.com) |
| **LinkedIn Marketing API** | Company pages | Free tier | [developer.linkedin.com](https://developer.linkedin.com) |

### Email & Notifications
| Service | Purpose | Cost | Link |
|---------|---------|------|------|
| **Resend** | Transactional email | 3,000 emails/month free | [resend.com](https://resend.com) |
| **SendGrid** | Email delivery | 100 emails/day free | [sendgrid.com](https://sendgrid.com) |
| **Novu** | Multi-channel notifications | Free tier | [novu.co](https://novu.co) |

### Payment Processing
| Service | Purpose | Cost | Link |
|---------|---------|------|------|
| **Stripe** | Subscriptions & billing | 2.9% + 30¢ per transaction | [stripe.com](https://stripe.com) |
| **LemonSqueezy** | Merchant of record | 5% + 50¢ per transaction | [lemonsqueezy.com](https://lemonsqueezy.com) |

---

## 4.2 Environment Variables Template

```bash
# .env.example

# ============================================
# APPLICATION
# ============================================
NODE_ENV=development
APP_NAME=Amarktai Marketing
APP_URL=http://localhost:3000
API_URL=http://localhost:8000

# ============================================
# AUTHENTICATION (Clerk)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ============================================
# DATABASE (Supabase)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# ============================================
# REDIS (Upstash)
# ============================================
REDIS_URL=rediss://default:[password]@your-redis.upstash.io:6379
REDIS_TOKEN=your-redis-token

# ============================================
# LLM PROVIDERS
# ============================================
# Grok (Primary)
GROK_API_KEY=xai-...

# Anthropic (Fallback)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (Premium)
OPENAI_API_KEY=sk-...

# Groq (Fast inference)
GROQ_API_KEY=gsk_...

# ============================================
# MEDIA GENERATION
# ============================================
LEONARDO_API_KEY=your-leonardo-key
RUNWAY_API_KEY=your-runway-key
ELEVENLABS_API_KEY=sk_...
SHOTSTACK_API_KEY=your-shotstack-key

# ============================================
# SOCIAL PLATFORM APIs
# ============================================
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/callback/youtube

TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/callback/tiktok

META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=http://localhost:3000/api/auth/callback/meta

TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/callback/twitter

LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/callback/linkedin

# ============================================
# EMAIL & NOTIFICATIONS
# ============================================
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@amarktai.com

# ============================================
# PAYMENTS (Stripe)
# ============================================
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_FREE=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...

# ============================================
# MONITORING & ANALYTICS
# ============================================
SENTRY_DSN=https://...@sentry.io/...
POSTHOG_KEY=phc_...
POSTHOG_HOST=https://app.posthog.com
```

---

# 5. Sample Agent Code

## 5.1 Research Agent

```python
# agents/src/agents/research_agent.py

from typing import List, Dict, Any
from crewai import Agent
from langchain.tools import tool
from datetime import datetime

class ResearchAgent:
    """
    Research Agent analyzes trends, competitors, and platform best practices
    to inform content strategy decisions.
    """
    
    def __init__(self, llm_client):
        self.llm = llm_client
        self.agent = self._create_agent()
    
    def _create_agent(self) -> Agent:
        return Agent(
            role='Social Media Research Analyst',
            goal='Identify trending topics, analyze competitor content, and gather platform-specific insights',
            backstory='''You are an expert social media researcher with deep knowledge of 
            platform algorithms, trending content formats, and viral strategies.''',
            verbose=True,
            allow_delegation=False,
            tools=[
                self.search_trends,
                self.analyze_competitor,
                self.get_platform_best_practices,
                self.research_hashtags
            ],
            llm=self.llm
        )
    
    @tool
    def search_trends(self, platform: str, niche: str, timeframe: str = "7d") -> Dict[str, Any]:
        """Search for trending topics on a specific platform within a niche."""
        trends_data = {
            "platform": platform,
            "niche": niche,
            "trending_topics": [],
            "timestamp": datetime.now().isoformat()
        }
        # Implementation would use Google Trends API or similar
        return trends_data
    
    @tool
    def analyze_competitor(self, competitor_url: str, platform: str) -> Dict[str, Any]:
        """Analyze a competitor's social media presence and top-performing content."""
        return {
            "competitor": competitor_url,
            "platform": platform,
            "top_performing_content": [],
            "content_patterns": {},
            "posting_frequency": "",
            "engagement_rate": 0.0
        }
    
    @tool
    def get_platform_best_practices(self, platform: str, content_type: str) -> Dict[str, Any]:
        """Get current best practices for a specific platform and content type."""
        best_practices = {
            "youtube_shorts": {
                "optimal_length": "15-60 seconds",
                "hook_duration": "0-3 seconds",
                "caption_style": "Large, centered, high contrast",
                "hashtag_count": "3-5 relevant hashtags",
                "posting_times": ["12:00 PM", "6:00 PM", "9:00 PM"],
                "optimal_frequency": "1-3 per day"
            },
            "tiktok": {
                "optimal_length": "15-30 seconds",
                "hook_duration": "0-1 seconds",
                "caption_style": "Trending sounds + text overlay",
                "hashtag_count": "3-5 hashtags including 1-2 trending",
                "posting_times": ["7:00 AM", "12:00 PM", "7:00 PM"],
                "optimal_frequency": "1-4 per day"
            },
            "instagram_reels": {
                "optimal_length": "15-30 seconds",
                "hook_duration": "0-3 seconds",
                "caption_style": "Engaging cover image + trending audio",
                "hashtag_count": "5-10 hashtags",
                "posting_times": ["11:00 AM", "2:00 PM", "7:00 PM"],
                "optimal_frequency": "1-2 per day"
            },
            "twitter_x": {
                "optimal_length": "Short, punchy text + media",
                "hook_duration": "N/A",
                "caption_style": "Concise with strong hook",
                "hashtag_count": "1-2 hashtags max",
                "posting_times": ["8:00 AM", "12:00 PM", "5:00 PM"],
                "optimal_frequency": "3-5 per day"
            },
            "linkedin": {
                "optimal_length": "Professional, value-driven",
                "hook_duration": "Strong opening line",
                "caption_style": "Professional tone, industry insights",
                "hashtag_count": "3-5 relevant hashtags",
                "posting_times": ["8:00 AM", "12:00 PM", "5:00 PM"],
                "optimal_frequency": "1-2 per day"
            }
        }
        return best_practices.get(platform, {})
    
    def run_research(self, webapp_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute full research workflow for a web app."""
        research_results = {
            "webapp_id": webapp_data.get("id"),
            "research_date": datetime.now().isoformat(),
            "trends": {},
            "competitor_analysis": {},
            "best_practices": {},
            "recommended_hashtags": {},
            "content_angles": []
        }
        
        for platform in ["youtube_shorts", "tiktok", "instagram_reels", "twitter_x", "linkedin"]:
            research_results["trends"][platform] = self.search_trends(
                platform=platform,
                niche=webapp_data.get("category", "SaaS")
            )
            research_results["best_practices"][platform] = self.get_platform_best_practices(
                platform=platform,
                content_type="short_video"
            )
        
        return research_results
```

## 5.2 Creative Agent

```python
# agents/src/agents/creative_agent.py

from typing import List, Dict, Any
from crewai import Agent
from langchain.tools import tool
from datetime import datetime

class CreativeAgent:
    """Creative Agent generates scripts, copy, and creative concepts."""
    
    def __init__(self, llm_client):
        self.llm = llm_client
        self.agent = self._create_agent()
    
    def _create_agent(self) -> Agent:
        return Agent(
            role='Creative Content Strategist',
            goal='Generate compelling scripts, copy, and creative concepts that drive engagement',
            backstory='You are a master copywriter and creative strategist with expertise in viral content.',
            verbose=True,
            allow_delegation=False,
            tools=[self.generate_video_script, self.write_caption, self.create_image_prompt],
            llm=self.llm
        )
    
    @tool
    def generate_video_script(self, platform: str, topic: str, duration: int,
                            target_audience: str, key_message: str, tone: str = "engaging") -> Dict[str, Any]:
        """Generate a complete video script with scene breakdown."""
        templates = {
            "youtube_shorts": {
                "structure": ["Hook (0-3s)", "Problem (3-10s)", "Solution (10-45s)", "CTA (45-60s)"],
                "style": "Fast-paced, high energy, clear visual direction"
            },
            "tiktok": {
                "structure": ["Hook (0-1s)", "Relatable moment (1-10s)", "Value/Reveal (10-25s)", "CTA (25-30s)"],
                "style": "Trendy, authentic, trend-jacking opportunities"
            },
            "instagram_reels": {
                "structure": ["Visual Hook (0-3s)", "Story/Value (3-25s)", "Transformation/Reveal (25-28s)", "CTA (28-30s)"],
                "style": "Aesthetic, aspirational, visually polished"
            }
        }
        
        template = templates.get(platform, templates["youtube_shorts"])
        
        prompt = f"""
        Create a detailed video script for {platform}:
        Topic: {topic}
        Duration: {duration} seconds
        Target Audience: {target_audience}
        Key Message: {key_message}
        Tone: {tone}
        Structure: {template['structure']}
        """
        
        response = self.llm.complete(prompt)
        
        return {
            "platform": platform,
            "topic": topic,
            "duration": duration,
            "script": response.text,
            "generated_at": datetime.now().isoformat()
        }
    
    @tool
    def write_caption(self, platform: str, content_type: str, topic: str, 
                     tone: str, include_cta: bool = True) -> Dict[str, Any]:
        """Write platform-optimized caption/copy."""
        platform_limits = {"twitter_x": 280, "instagram": 2200, "linkedin": 3000}
        max_length = platform_limits.get(platform, 2200)
        
        prompt = f"""
        Write a compelling {platform} caption for {content_type} about: {topic}
        Tone: {tone}, Max Length: {max_length}, Include CTA: {include_cta}
        """
        
        response = self.llm.complete(prompt)
        
        return {
            "platform": platform,
            "caption": response.text,
            "character_count": len(response.text),
            "generated_at": datetime.now().isoformat()
        }
    
    @tool
    def create_image_prompt(self, content_type: str, subject: str, style: str,
                           platform: str, mood: str = "professional") -> Dict[str, Any]:
        """Generate optimized image generation prompts for AI image tools."""
        platform_dimensions = {
            "instagram_post": "1080x1080",
            "instagram_story": "1080x1920",
            "twitter_x": "1200x675",
            "linkedin": "1200x627",
            "facebook": "1200x630"
        }
        
        prompt = f"""
        Create a detailed image generation prompt for Leonardo.AI:
        Content Type: {content_type}, Subject: {subject}, Style: {style}
        Platform: {platform}, Mood: {mood}
        Dimensions: {platform_dimensions.get(platform, '1080x1080')}
        """
        
        response = self.llm.complete(prompt)
        
        return {
            "content_type": content_type,
            "platform": platform,
            "prompts": response.text,
            "generated_at": datetime.now().isoformat()
        }
```

## 5.3 Media Generation Agent

```python
# agents/src/agents/media_agent.py

import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import base64

class MediaType(Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"

@dataclass
class MediaAsset:
    id: str
    type: MediaType
    url: str
    local_path: Optional[str] = None
    metadata: Dict[str, Any] = None
    status: str = "pending"

class MediaAgent:
    """Media Agent orchestrates generation of images, videos, and audio."""
    
    def __init__(self, config: Dict[str, str]):
        self.leonardo_api_key = config.get("LEONARDO_API_KEY")
        self.runway_api_key = config.get("RUNWAY_API_KEY")
        self.elevenlabs_api_key = config.get("ELEVENLABS_API_KEY")
        self.shotstack_api_key = config.get("SHOTSTACK_API_KEY")
        
        self.leonardo_base_url = "https://cloud.leonardo.ai/api/rest/v1"
        self.runway_base_url = "https://api.runwayml.com/v1"
        self.elevenlabs_base_url = "https://api.elevenlabs.io/v1"
        self.shotstack_base_url = "https://api.shotstack.io/v1"
    
    async def generate_image(self, prompt: str, width: int = 1024, 
                            height: int = 1024) -> MediaAsset:
        """Generate image using Leonardo.AI"""
        headers = {
            "Authorization": f"Bearer {self.leonardo_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": prompt,
            "width": width,
            "height": height,
            "modelId": " Leonardo Kino XL",
            "num_images": 1,
            "guidance_scale": 7,
            "presetStyle": "DYNAMIC"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.leonardo_base_url}/generations",
                headers=headers,
                json=payload
            ) as response:
                data = await response.json()
                generation_id = data["sdGenerationJob"]["generationId"]
                image_url = await self._poll_leonardo_generation(session, headers, generation_id)
                
                return MediaAsset(
                    id=generation_id,
                    type=MediaType.IMAGE,
                    url=image_url,
                    status="completed"
                )
    
    async def _poll_leonardo_generation(self, session, headers, generation_id, max_attempts=60):
        """Poll Leonardo API for generation completion."""
        for _ in range(max_attempts):
            async with session.get(
                f"{self.leonardo_base_url}/generations/{generation_id}",
                headers=headers
            ) as response:
                data = await response.json()
                if data["generations_by_pk"]["status"] == "COMPLETE":
                    return data["generations_by_pk"]["generated_images"][0]["url"]
                await asyncio.sleep(2)
        raise TimeoutError("Image generation timed out")
    
    async def generate_voiceover(self, text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> MediaAsset:
        """Generate voiceover using ElevenLabs"""
        headers = {
            "xi-api-key": self.elevenlabs_api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.elevenlabs_base_url}/text-to-speech/{voice_id}",
                headers=headers,
                json=payload
            ) as response:
                audio_content = await response.read()
                audio_base64 = base64.b64encode(audio_content).decode()
                
                return MediaAsset(
                    id=f"voice_{hash(text) % 1000000}",
                    type=MediaType.AUDIO,
                    url=f"data:audio/mpeg;base64,{audio_base64}",
                    status="completed"
                )
```

## 5.4 Nightly Workflow Orchestrator (LangGraph)

```python
# agents/src/workflows/nightly_workflow.py

from typing import Dict, List, Any, TypedDict, Annotated
from langgraph.graph import StateGraph, END
import operator
from datetime import datetime
import asyncio

class WorkflowState(TypedDict):
    user_id: str
    webapps: List[Dict[str, Any]]
    research_results: Dict[str, Any]
    content_packages: List[Dict[str, Any]]
    media_assets: List[Dict[str, Any]]
    pending_approval: List[Dict[str, Any]]
    errors: Annotated[List[str], operator.add]
    current_step: str

class NightlyWorkflow:
    """LangGraph-based workflow orchestrator for nightly content generation."""
    
    def __init__(self, research_agent, creative_agent, media_agent, db_client):
        self.research_agent = research_agent
        self.creative_agent = creative_agent
        self.media_agent = media_agent
        self.db = db_client
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow."""
        workflow = StateGraph(WorkflowState)
        
        workflow.add_node("fetch_webapps", self._fetch_user_webapps)
        workflow.add_node("research", self._run_research)
        workflow.add_node("generate_content", self._generate_content_packages)
        workflow.add_node("generate_media", self._generate_media)
        workflow.add_node("save_to_db", self._save_pending_content)
        workflow.add_node("send_notification", self._send_approval_notification)
        
        workflow.set_entry_point("fetch_webapps")
        workflow.add_conditional_edges(
            "fetch_webapps",
            lambda s: "has_webapps" if s.get("webapps") else "no_webapps",
            {"has_webapps": "research", "no_webapps": END}
        )
        workflow.add_edge("research", "generate_content")
        workflow.add_edge("generate_content", "generate_media")
        workflow.add_edge("generate_media", "save_to_db")
        workflow.add_edge("save_to_db", "send_notification")
        workflow.add_edge("send_notification", END)
        
        return workflow.compile()
    
    def _fetch_user_webapps(self, state: WorkflowState) -> WorkflowState:
        """Fetch active web apps for the user."""
        state["current_step"] = "fetch_webapps"
        try:
            webapps = self.db.query(
                "SELECT * FROM webapps WHERE user_id = %s AND is_active = true",
                (state["user_id"],)
            )
            state["webapps"] = webapps
        except Exception as e:
            state["errors"] = [f"Failed to fetch webapps: {str(e)}"]
        return state
    
    def _run_research(self, state: WorkflowState) -> WorkflowState:
        """Run research agent for all webapps."""
        state["current_step"] = "research"
        try:
            research_results = {}
            for webapp in state["webapps"]:
                result = self.research_agent.run_research(webapp)
                research_results[webapp["id"]] = result
            state["research_results"] = research_results
        except Exception as e:
            state["errors"] = state.get("errors", []) + [f"Research failed: {str(e)}"]
        return state
    
    def _generate_content_packages(self, state: WorkflowState) -> WorkflowState:
        """Generate content packages using creative agent."""
        state["current_step"] = "generate_content"
        try:
            content_packages = []
            platforms = ["youtube_shorts", "tiktok", "instagram_reels", "twitter_x", "linkedin"]
            
            for webapp in state["webapps"]:
                research = state["research_results"].get(webapp["id"], {})
                for platform in platforms:
                    if self._is_platform_connected(state["user_id"], platform):
                        package = self.creative_agent.generate_content_package(
                            research_data=research,
                            webapp_data=webapp,
                            platform=platform
                        )
                        content_packages.append(package)
            
            state["content_packages"] = content_packages
        except Exception as e:
            state["errors"] = state.get("errors", []) + [f"Content generation failed: {str(e)}"]
        return state
    
    def _generate_media(self, state: WorkflowState) -> WorkflowState:
        """Generate media assets for all content packages."""
        state["current_step"] = "generate_media"
        # Implementation for media generation
        return state
    
    def _save_pending_content(self, state: WorkflowState) -> WorkflowState:
        """Save generated content to database as pending approval."""
        state["current_step"] = "save_to_db"
        try:
            pending_approval = []
            for package in state["content_packages"]:
                content_record = {
                    "id": self._generate_uuid(),
                    "user_id": state["user_id"],
                    "webapp_id": package.get("webapp_id"),
                    "platform": package["platform"],
                    "status": "pending_approval",
                    "content_data": package["content"],
                    "created_at": datetime.now().isoformat()
                }
                self.db.insert("content_queue", content_record)
                pending_approval.append(content_record)
            state["pending_approval"] = pending_approval
        except Exception as e:
            state["errors"] = state.get("errors", []) + [f"Failed to save content: {str(e)}"]
        return state
    
    def _send_approval_notification(self, state: WorkflowState) -> WorkflowState:
        """Send email notification to user."""
        state["current_step"] = "send_notification"
        # Implementation for notification
        return state
    
    def _is_platform_connected(self, user_id: str, platform: str) -> bool:
        """Check if user has connected a specific platform."""
        result = self.db.query_one(
            "SELECT 1 FROM platform_connections WHERE user_id = %s AND platform = %s AND is_active = true",
            (user_id, platform)
        )
        return result is not None
    
    def _generate_uuid(self) -> str:
        import uuid
        return str(uuid.uuid4())
    
    async def run(self, user_id: str) -> Dict[str, Any]:
        """Execute the nightly workflow for a user."""
        initial_state = WorkflowState(
            user_id=user_id,
            webapps=[],
            research_results={},
            content_packages=[],
            media_assets=[],
            pending_approval=[],
            errors=[],
            current_step="init"
        )
        
        result = await self.workflow.ainvoke(initial_state)
        
        return {
            "user_id": user_id,
            "success": len(result.get("errors", [])) == 0,
            "content_generated": len(result.get("pending_approval", [])),
            "errors": result.get("errors", []),
            "completed_at": datetime.now().isoformat()
        }
```
