from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Amarktai Marketing"
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:3000"
    ADMIN_USER_IDS: str = ""  # comma-separated list of admin Clerk user IDs
    # Platform owner's email — always granted unlimited access at no cost.
    # Override via ADMIN_EMAIL env var to change the admin for a different deployment.
    ADMIN_EMAIL: str = "amarktainetwork@gmail.com"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/amarktai"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Clerk Auth
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_WEBHOOK_SECRET: str = ""  # From Clerk Dashboard → Webhooks → Signing Secret
    
    # Encryption (for API keys and tokens)
    ENCRYPTION_KEY: str = "your-encryption-key-here-change-in-production"
    
    # ==================== LLM API KEYS ====================
    # Primary LLM providers
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GROQ_API_KEY: str = ""  # Fast inference

    # Qwen (Alibaba Cloud) – low-cost, high quality
    QWEN_API_KEY: str = ""  # DashScope API key from console.aliyun.com
    QWEN_MODEL: str = "Qwen/Qwen2.5-72B-Instruct"  # HF model ID or DashScope model name
    
    # Google AI
    GOOGLE_GEMINI_API_KEY: str = ""
    GOOGLE_AI_API_KEY: str = ""  # Legacy
    
    # Grok/X AI
    GROK_API_KEY: str = ""
    XAI_API_KEY: str = ""  # Alternative
    
    # ==================== MEDIA GENERATION API KEYS ====================
    # Image Generation
    LEONARDO_API_KEY: str = ""  # Leonardo.AI
    OPENAI_DALLE_KEY: str = ""  # DALL-E
    MIDJOURNEY_API_KEY: str = ""  # Midjourney (via API)
    STABILITY_API_KEY: str = ""  # Stability AI
    
    # Free/Cheap alternatives
    HUGGINGFACE_TOKEN: str = ""  # Hugging Face Inference API (primary – free tier)
    FAL_AI_KEY: str = ""  # fal.ai
    SILICONFLOW_API_KEY: str = ""  # SiliconFlow
    REPLICATE_API_TOKEN: str = ""  # Replicate
    
    # Video Generation
    RUNWAY_API_KEY: str = ""  # Runway ML
    HEYGEN_API_KEY: str = ""  # HeyGen
    SYNTHESIA_API_KEY: str = ""  # Synthesia
    
    # Audio/Voice
    ELEVENLABS_API_KEY: str = ""  # ElevenLabs
    COQUI_API_KEY: str = ""  # Coqui TTS (free alternative)
    PLAYHT_API_KEY: str = ""  # Play.ht
    
    # ==================== SOCIAL PLATFORM API KEYS ====================
    # YouTube
    YOUTUBE_CLIENT_ID: str = ""
    YOUTUBE_CLIENT_SECRET: str = ""
    YOUTUBE_API_KEY: str = ""  # For read operations
    
    # TikTok
    TIKTOK_CLIENT_KEY: str = ""
    TIKTOK_CLIENT_SECRET: str = ""
    TIKTOK_APP_ID: str = ""
    
    # Meta (Instagram + Facebook)
    META_APP_ID: str = ""
    META_APP_SECRET: str = ""
    INSTAGRAM_CLIENT_ID: str = ""
    INSTAGRAM_CLIENT_SECRET: str = ""
    FACEBOOK_CLIENT_ID: str = ""
    FACEBOOK_CLIENT_SECRET: str = ""
    
    # Twitter/X
    TWITTER_CLIENT_ID: str = ""
    TWITTER_CLIENT_SECRET: str = ""
    TWITTER_API_KEY: str = ""  # v1.1 API
    TWITTER_API_SECRET: str = ""
    TWITTER_BEARER_TOKEN: str = ""
    
    # LinkedIn
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""

    # Pinterest
    PINTEREST_CLIENT_ID: str = ""
    PINTEREST_CLIENT_SECRET: str = ""

    # Reddit (also used for trend analysis)
    REDDIT_CLIENT_ID: str = ""
    REDDIT_CLIENT_SECRET: str = ""
    REDDIT_USER_AGENT: str = "AmarktaiBot/1.0"

    # Bluesky / AT Protocol
    BLUESKY_CLIENT_ID: str = ""
    BLUESKY_IDENTIFIER: str = ""  # handle e.g. user.bsky.social
    BLUESKY_APP_PASSWORD: str = ""

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHANNEL_ID: str = ""  # @channel or numeric chat_id

    # Snapchat
    SNAPCHAT_CLIENT_ID: str = ""
    SNAPCHAT_CLIENT_SECRET: str = ""

    # ==================== TREND DATA SOURCES ====================
    # Google Trends
    GOOGLE_TRENDS_API_KEY: str = ""
    
    # News APIs (for content ideas)
    NEWSAPI_KEY: str = ""
    GNEWS_API_KEY: str = ""
    
    # ==================== WEB SCRAPING ====================
    # ScrapingBee (for web app crawling)
    SCRAPINGBEE_API_KEY: str = ""
    
    # Firecrawl (for web app crawling)
    FIRECRAWL_API_KEY: str = ""
    
    # ==================== PAYMENTS ====================
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID_FREE: str = ""
    STRIPE_PRICE_ID_PRO: str = ""
    STRIPE_PRICE_ID_BUSINESS: str = ""
    STRIPE_PRICE_ID_ENTERPRISE: str = ""
    
    # ==================== EMAIL ====================
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@amarktai.com"
    
    # ==================== STORAGE ====================
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET: str = "amarktai-media"
    
    # AWS S3 (alternative)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    AWS_REGION: str = "us-east-1"
    
    # ==================== AMARKTAI NETWORK INTEGRATION ====================
    # Per-app identity
    APP_ID: str = "amarktai-marketing"
    APP_SLUG: str = "amarktai-marketing"
    APP_NAME: str = "Amarktai Marketing"
    APP_VERSION: str = "1.0.0"
    APP_ENVIRONMENT: str = "production"  # production | staging | development

    # Outbound integration (connection to Amarktai Network main dashboard)
    # Keep AMARKTAI_INTEGRATION_TOKEN server-side only — never expose to frontend
    AMARKTAI_DASHBOARD_URL: str = ""   # e.g. https://dashboard.amarktai.com
    AMARKTAI_INTEGRATION_TOKEN: str = ""  # generated per-app token in Amarktai Network
    AMARKTAI_INTEGRATION_ENABLED: bool = False

    # ==================== MONITORING ====================
    SENTRY_DSN: str = ""
    
    # ==================== FEATURE FLAGS ====================
    ENABLE_AUTO_POST: bool = False  # Enable autonomous posting
    ENABLE_AUTO_REPLY: bool = False  # Enable auto-replies
    ENABLE_AB_TESTING: bool = True
    ENABLE_VIRAL_PREDICTION: bool = True
    ENABLE_COST_TRACKING: bool = True
    
    # ==================== RATE LIMITS ====================
    MAX_CONTENT_PER_DAY: int = 10  # Per user
    MAX_ENGAGEMENT_REPLIES_PER_DAY: int = 50
    MAX_MEDIA_GENERATIONS_PER_DAY: int = 20

    # ==================== BUSINESS LIMITS ====================
    MAX_BUSINESSES_PER_USER: int = 20  # Max web apps / businesses per account
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
