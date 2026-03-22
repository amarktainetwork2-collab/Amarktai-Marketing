# AmarktAI Marketing - Phase 2 & 3 Upgrade Documentation

## Overview

This document describes the comprehensive upgrade to AmarktAI Marketing, implementing Phase 2 (AI Content Generation Pipeline) and Phase 3 (Full Autonomy & Optimization), along with new Community Management features.

## What's New

### Phase 2: AI Content Generation Pipeline ✅

#### 1. Multi-Agent System with LangGraph
- **Research Agent V2**: Enhanced with real-time trend sources
  - Google Trends API integration
  - Reddit trend analysis
  - X/Twitter trend scraping
  - TikTok Creative Center data
  - News API integration
  - Web app crawling (Firecrawl/ScrapingBee)
  
- **Creative Agent**: Platform-optimized content generation
  - X threads, LinkedIn posts, Instagram/Facebook content
  - TikTok/YouTube scripts with hooks
  - Bold, non-generic writing style
  
- **Media Agent V2**: Multi-provider image/video/audio generation
  - **Free providers**: Hugging Face (Flux.1, SDXL), SiliconFlow
  - **Paid providers**: Leonardo.ai, OpenAI DALL-E, Runway ML
  - **Video**: Runway, HeyGen, Replicate
  - **Audio**: ElevenLabs, Coqui TTS (free), Play.ht
  - Intelligent fallback routing
  
- **Optimizer Agent**: Viral optimization
  - Viral score prediction (0-100)
  - Hashtag optimization
  - Emoji placement
  - Platform-specific formatting
  - Hook strength analysis

#### 2. Nightly Workflow Orchestrator
- Celery beat job at 2:00 AM UTC
- LangGraph stateful workflow
- Generates content for all 6 platforms
- Saves to approval queue
- Cost tracking and budget management

### Phase 3: Full Autonomy & Optimization ✅

#### 1. Autonomous Posting
- One-click batch approval
- Automatic posting via platform APIs
- Scheduled posting with optimal timing
- Queue management

#### 2. Self-Optimizing Closed Loop
- Nightly analytics sync from all platforms
- Performance data fed back to agents
- LangGraph memory for prompt refinement
- Learning from past performance

#### 3. A/B Testing Engine
- Automatic variant generation (2-3 per campaign)
- Staggered posting for fair comparison
- Statistical analysis of results
- Winner declaration with confidence level
- Prioritization of winning styles

#### 4. Viral Traction Maximization
- Daily trend search (X, TikTok, Google Trends)
- Trending hooks/hashtags injection
- Real-time trend alignment scoring

#### 5. Best-Time-to-Post Prediction
- Historical analytics analysis
- Per-platform optimal timing
- User timezone support

### Community Management (New Feature) ✅

#### 1. Comment/DM Monitoring
- Periodic job to pull new engagements
- Every 30 minutes via Celery
- Platform API integration

#### 2. AI Reply Generation
- Sentiment analysis
- Intent detection
- Risk assessment for auto-reply
- Multiple tone options

#### 3. Engagement Approval Queue
- Separate queue for replies
- User review/edit/approve workflow
- Low-risk auto-reply option
- Alternative reply suggestions

### API Keys & Integrations ✅

#### 1. User-Provided API Keys
- Secure encrypted storage
- Support for 11+ providers
- Fallback order: User key → Project default → Free tier

#### 2. Social Platform OAuth2
- Full OAuth2 flows for all 6 platforms
- Secure token storage
- Refresh token handling
- Connection status dashboard

#### 3. Auto-Settings per Platform
- Auto-post after approval
- Auto-reply to comments
- Low-risk only option

## Database Schema Changes

### New Tables

```sql
-- User API Keys (encrypted)
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    key_name VARCHAR(100),
    encrypted_key TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP
);

-- Platform Integrations (OAuth tokens)
CREATE TABLE user_integrations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    platform VARCHAR(50),
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    is_connected BOOLEAN DEFAULT false,
    auto_post_enabled BOOLEAN DEFAULT false,
    auto_reply_enabled BOOLEAN DEFAULT false,
    low_risk_auto_reply BOOLEAN DEFAULT false
);

-- Engagement Replies
CREATE TABLE engagement_replies (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    platform VARCHAR(50),
    engagement_type VARCHAR(50),
    original_text TEXT,
    ai_reply_text TEXT,
    sentiment VARCHAR(20),
    status VARCHAR(50),
    auto_reply_safe BOOLEAN,
    risk_factors JSONB
);

-- A/B Tests
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    content_id UUID REFERENCES content(id),
    variants JSONB,
    status VARCHAR(50),
    winning_variant_id VARCHAR(50),
    confidence_level VARCHAR(10),
    variant_metrics JSONB
);

-- Viral Scores
CREATE TABLE viral_scores (
    id UUID PRIMARY KEY,
    content_id UUID REFERENCES content(id),
    overall_score INTEGER,
    hook_strength INTEGER,
    emotional_impact INTEGER,
    viral_probability INTEGER
);

-- Cost Tracking
CREATE TABLE cost_tracking (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    llm_tokens_used INTEGER,
    images_generated INTEGER,
    videos_generated INTEGER,
    total_cost VARCHAR(20),
    billing_period_start TIMESTAMP,
    billing_period_end TIMESTAMP
);
```

## API Endpoints

### New Endpoints

```
# API Keys & Integrations
GET    /api/v1/integrations/api-keys
POST   /api/v1/integrations/api-keys
DELETE /api/v1/integrations/api-keys/{id}
GET    /api/v1/integrations/platforms
GET    /api/v1/integrations/platforms/{platform}/connect
POST   /api/v1/integrations/platforms/{platform}/disconnect
PATCH  /api/v1/integrations/platforms/{platform}
POST   /api/v1/integrations/platforms/callback

# Engagement
GET    /api/v1/engagement/queue
GET    /api/v1/engagement/stats
POST   /api/v1/engagement/incoming
GET    /api/v1/engagement/{id}
POST   /api/v1/engagement/{id}/action
POST   /api/v1/engagement/{id}/regenerate
POST   /api/v1/engagement/batch-action

# A/B Testing
GET    /api/v1/ab-testing/tests
POST   /api/v1/ab-testing/tests
GET    /api/v1/ab-testing/tests/{id}
PATCH  /api/v1/ab-testing/tests/{id}
POST   /api/v1/ab-testing/tests/{id}/analyze
GET    /api/v1/ab-testing/stats

# Cost Tracking
GET    /api/v1/cost-tracking/current
GET    /api/v1/cost-tracking/history
GET    /api/v1/cost-tracking/content/{id}
GET    /api/v1/cost-tracking/estimate

# Autonomous
POST   /api/v1/autonomous/batch-approve
POST   /api/v1/autonomous/post/{id}
GET    /api/v1/autonomous/queue-status
POST   /api/v1/autonomous/sync-analytics
GET    /api/v1/autonomous/best-posting-times
```

## Celery Tasks

```python
# Nightly at 2:00 AM
run_nightly_content_generation()

# Every 6 hours
sync_platform_analytics()

# Every 30 minutes
fetch_platform_engagement()

# Daily at 3:00 AM
analyze_ab_tests()

# Every 15 minutes
schedule_posts_worker()
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Minimum required for basic functionality:
- `DATABASE_URL`
- `REDIS_URL`
- `CLERK_SECRET_KEY` (or use demo mode)
- At least one LLM API key (Groq recommended for free tier)

### 2. Database Migration

Run the database migrations to create new tables:

```bash
cd backend
alembic revision --autogenerate -m "Add phase 2 3 tables"
alembic upgrade head
```

### 3. Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../app
npm install
```

### 4. Start Services

```bash
# Start Redis
docker run -d -p 6379:6379 redis:alpine

# Start backend
cd backend
uvicorn app.main:app --reload

# Start Celery worker
celery -A app.workers.celery_app worker --loglevel=info

# Start Celery beat (scheduler)
celery -A app.workers.celery_app beat --loglevel=info

# Start frontend
cd ../app
npm run dev
```

## Usage Guide

### For Free Tier Users

1. **No API keys needed** - System uses free providers by default:
   - Hugging Face for images (Flux.1-dev)
   - Groq for LLM (if you add a free key)
   - Coqui for voice (free)

2. **Connect platforms** via OAuth2 in Integrations page

3. **Review generated content** in Approval Queue daily

4. **One-click approve** to auto-post at optimal times

### For Pro Users

1. **Add your API keys** for premium quality:
   - Leonardo.ai for images
   - ElevenLabs for voiceovers
   - OpenAI for GPT-4 content

2. **Enable auto-posting** per platform

3. **Enable auto-replies** for low-risk engagements

4. **Monitor costs** in Cost Tracking dashboard

## Cost Estimation

### Free Tier (using free providers only)
- Images: $0 (Hugging Face)
- LLM: $0 (if using free Groq tier)
- Audio: $0 (Coqui TTS)
- **Total: $0/month**

### Pro Tier (with premium keys)
- Images: ~$0.03/image (Leonardo)
- LLM: ~$0.002/1K tokens (GPT-3.5)
- Video: ~$0.20/video (Runway)
- Audio: ~$0.0001/char (ElevenLabs)
- **Estimated: $5-20/month** for 30 content pieces

## Security Notes

1. **API keys are encrypted** using Fernet before storage
2. **OAuth tokens are encrypted** and never exposed
3. **User keys are isolated** - never shared between users
4. **Fallback system** prevents service disruption
5. **Rate limiting** protects against abuse

## Troubleshooting

### Content not generating
- Check Celery worker is running
- Verify at least one LLM API key is configured
- Check logs: `tail -f logs/celery.log`

### Platform connection failing
- Verify OAuth credentials in .env
- Check redirect URI matches exactly
- Ensure platform app is approved (some require manual review)

### High costs
- Use free providers (Hugging Face, Coqui)
- Set monthly budget limits
- Enable cost alerts at 50%, 80%, 100%

## Future Enhancements

- [ ] More platform support (Pinterest, Snapchat)
- [ ] Advanced analytics with ML predictions
- [ ] Team collaboration features
- [ ] White-label options
- [ ] API for external integrations
