# 🚀 Amarktai Marketing — Complete Feature List

> Autonomous AI Social Media Marketing Platform powered by HuggingFace and Qwen.
> **Designed and created by Amarktai Network.**

---

## Table of Contents

1. [User Management & Auth](#1-user-management--auth)
2. [Business / Web App Management](#2-business--web-app-management)
3. [Social Platform Connections (12 Platforms)](#3-social-platform-connections-12-platforms)
4. [AI Content Generation](#4-ai-content-generation)
5. [Content Approval Workflow](#5-content-approval-workflow)
6. [Autonomous Posting Schedule](#6-autonomous-posting-schedule)
7. [Lead Capture & Management](#7-lead-capture--management)
8. [Analytics & Reporting](#8-analytics--reporting)
9. [Community Groups Feature](#9-community-groups-feature)
10. [10 Power Tools (AI Add-Ons)](#10-10-power-tools-ai-add-ons)
11. [SEO Blog Post Generator](#11-seo-blog-post-generator)
12. [Engagement & Auto-Reply](#12-engagement--auto-reply)
13. [A/B Testing](#13-ab-testing)
14. [Cost Tracking](#14-cost-tracking)
15. [Autonomous Workflows](#15-autonomous-workflows)
16. [Admin Panel](#16-admin-panel)
17. [API Key & Integrations Management](#17-api-key--integrations-management)
18. [Scheduler & Content Calendar](#18-scheduler--content-calendar)
19. [Settings & User Preferences](#19-settings--user-preferences)
20. [Deployment & Infrastructure](#20-deployment--infrastructure)

---

## 1. User Management & Auth

| Feature | Status | Notes |
|---------|--------|-------|
| Clerk JWT authentication (production) | ✅ | RS256 JWKS verification |
| Demo mode (no Clerk key needed) | ✅ | Auto-creates demo user |
| Clerk webhook — user.created | ✅ | Svix signature verified |
| Clerk webhook — user.updated | ✅ | Svix signature verified |
| Clerk webhook — user.deleted | ✅ | Cascade deletes all user data |
| User profile (name, avatar, timezone, language) | ✅ | Editable via `/users/me` |
| Plan tiers: FREE / PRO / BUSINESS / ENTERPRISE | ✅ | Stored in DB |
| Monthly content quota tracking | ✅ | `monthly_content_used` / `monthly_content_quota` |
| API cost budget tracking | ✅ | `api_cost_budget` / `api_cost_used` |
| Per-user feature flags | ✅ | `auto_post_enabled`, `auto_reply_enabled` |
| Admin user designation (ADMIN_USER_IDS env) | ✅ | Via `get_admin_user` dependency |

---

## 2. Business / Web App Management

| Feature | Status | Notes |
|---------|--------|-------|
| Create web app / business profile | ✅ | Name, URL, description, category, audience |
| Up to **20 businesses** per user | ✅ | Enforced at POST `/webapps/` |
| Edit / delete web app | ✅ | |
| Active / inactive toggle | ✅ | |
| Key features list | ✅ | JSON array column |
| Logo upload field | ✅ | |
| **Live website scraping** (nightly refresh) | ✅ | BeautifulSoup, stored in `scraped_data` JSON |
| Scraper enriches content generation | ✅ | Used in `generate-all` and nightly Celery task |

---

## 3. Social Platform Connections (12 Platforms)

| Platform | OAuth Connect | Auto-Post | Group/Community |
|----------|--------------|-----------|-----------------|
| YouTube | ✅ | ✅ | — |
| TikTok | ✅ | ✅ | — |
| Instagram | ✅ | ✅ | — |
| Facebook | ✅ | ✅ | ✅ Groups |
| Twitter / X | ✅ | ✅ | — |
| LinkedIn | ✅ | ✅ | — |
| Pinterest | ✅ | ✅ | — |
| Reddit | ✅ | ✅ | ✅ Subreddits |
| Bluesky | ✅ | ✅ | — |
| Threads | ✅ | ✅ | — |
| Telegram | ✅ | ✅ | ✅ Channels |
| Snapchat | ✅ | ✅ | — |

All OAuth flows include PKCE `code_verifier` (secure).  
Tokens stored encrypted (Fernet AES-128) in `user_integrations` table.  
Per-platform: `auto_post_enabled`, `auto_reply_enabled`, `low_risk_auto_reply`.

---

## 4. AI Content Generation

Generation priority (lowest cost first): **Qwen/Qwen2.5-72B-Instruct** → **HuggingFace Mistral-7B** → template fallback.

| Feature | Status | Notes |
|---------|--------|-------|
| `POST /content/generate` — single platform | ✅ | Qwen2.5-72B or Mistral-7B-Instruct-v0.2 |
| `POST /content/generate-all` — batch (all platforms × all webapps) | ✅ | Capped at 2 webapps per manual trigger |
| Platform-specific prompts (12 platforms) | ✅ | Length, hashtag count, style hints |
| Website scraper enrichment | ✅ | Live site copy fed into prompt |
| Fallback content on API timeout | ✅ | Template-based fallback |
| JSON response parsing with markdown fence stripping | ✅ | |
| Title + caption + hashtags + CTA per post | ✅ | |
| Viral score (0–100) stored per content item | ✅ | |
| Content type detection (video / image / text) | ✅ | Platform-based auto-detect |
| `generate_batch()` — concurrent per-platform generation | ✅ | |
| Immediate re-generation on content rejection | ✅ | Background task on reject |

### Specialist HF Methods
| Method | Model | Used by |
|--------|-------|---------|
| `summarize()` | facebook/bart-large-cnn | Remix Engine, Blog |
| `analyze_sentiment()` | distilbert-base-uncased-finetuned-sst-2-english | Lead scoring, Feedback Alchemy |
| `classify_topics()` | facebook/bart-large-mnli | Lead scoring, Ad Alchemy |
| `extract_keywords()` | Mistral-7B | Competitor Analyzer, SEO |
| `remix_to_platform()` | Mistral-7B | Content Remix Engine |
| `generate_competitor_insights()` | Mistral-7B | Competitor Shadow Analyzer |
| `generate_feedback_insights()` | Mistral-7B | Feedback Alchemy Platform |
| `generate_blog_post()` | Mistral-7B | SEO Blog Generator |
| `generate_comment_reply()` | Mistral-7B | Auto-Reply, Echo Amplifier |
| `score_lead_intelligence()` | sentiment + zero-shot | Lead scoring |
| `generate_echo_amplification()` | Mistral-7B | Echo Amplifier |
| `generate_seo_mirage()` | Mistral-7B | SEO Mirage Creator |
| `generate_harmony_pricing()` | Mistral-7B | Harmony Pricer |
| `generate_audience_map()` | Mistral-7B | Audience Mirage Mapper |
| `generate_ad_alchemy()` | Mistral-7B | Ad Alchemy Optimizer |
| `generate_viral_hook()` | Mistral-7B | Viral Spark Igniter |

---

## 5. Content Approval Workflow

| Feature | Status | Notes |
|---------|--------|-------|
| Pending queue — `GET /content/pending` | ✅ | |
| Approve single item | ✅ | Status → `approved` |
| Reject single item | ✅ | Status → `rejected` |
| Bulk approve | ✅ | `POST /content/approve-all` |
| Edit caption / hashtags before approving | ✅ | `PUT /content/{id}` |
| Schedule for specific time | ✅ | `scheduled_for` field |
| Approval UI page (`/dashboard/approval`) | ✅ | |
| **Content approval is the only non-automated step** | ✅ | All else is fully autonomous |

---

## 6. Autonomous Posting Schedule

**19 Celery beat tasks** running 24/7:

| Task | Schedule (UTC) | What it does |
|------|---------------|--------------|
| Morning content generation | 08:00 | Generate + auto-queue posts for all users |
| Midday content generation | 13:00 | Same |
| Evening content generation | 18:00 | Same |
| Post approved content | Every 15 min | Posts any approved-but-unposted content |
| Sync platform analytics | Every 6 hours | Pull views/likes/shares from platform APIs |
| Morning group posts | 08:30 | Post HF-generated content to active groups |
| Midday group posts | 13:30 | Same |
| Evening group posts | 18:30 | Same |
| Nightly scrape refresh | 00:30 | Re-scrape all webapp URLs |
| Nightly churn check | 01:00 | Churn Shield Defender |
| Daily competitor refresh | 02:00 | Competitor Shadow Analyzer |
| Analyse A/B tests | 03:00 | A/B testing winners |
| Weekly group search | Sunday 03:30 | Discover new groups for all webapps |
| Feedback Alchemy | 04:00 | Process social feedback |
| SEO Mirage | 05:00 | SEO visual generation |
| Auto-repurpose top content | 06:00 | Remix high-performing posts to other platforms |
| Daily Viral Spark | 07:00 | Viral hook suggestions |
| Harmony Pricer | 09:00 | Dynamic pricing insights |
| Echo Amplifier | 10:00 | Amplify best-performing content |
| Audience Mapper | 14:00 | Psychographic mapping |
| Ad Alchemy | 15:00 | Ad copy optimisation |
| Poll comment leads | Every 2 hours | Scan comments → capture as leads |

---

## 7. Lead Capture & Management

| Feature | Status | Notes |
|---------|--------|-------|
| Lead model with UTM tracking | ✅ | utm_source, utm_medium, utm_campaign, utm_content, utm_term |
| Public `POST /leads/capture` endpoint | ✅ | No auth — for embedded forms |
| Lead scoring (0–100, HF-powered) | ✅ | Sentiment + zero-shot + rule-based |
| Pre-qualifying form data (JSON) | ✅ | Custom questions per webapp |
| Lead list with search & filter | ✅ | By status, source, platform, lead score |
| Lead status workflow | ✅ | new → contacted → qualified → converted / lost |
| Lead stats dashboard | ✅ | Total, by status, by platform, by source |
| CSV export | ✅ | `GET /leads/export` |
| UTM link generator | ✅ | `POST /leads/utm-builder` |
| Comment-to-lead auto-capture | ✅ | Celery task scans comments every 2h |
| Leads page UI (`/dashboard/leads`) | ✅ | |

---

## 8. Analytics & Reporting

| Feature | Status | Notes |
|---------|--------|-------|
| Total posts / views / engagement / CTR summary | ✅ | |
| Platform-level breakdown | ✅ | |
| 7-day daily stats (posts, views, engagement) | ✅ | |
| Live sync from Twitter v2, Facebook Graph, YouTube Data API | ✅ | Every 6h Celery task |
| Analytics page with charts (`/dashboard/analytics`) | ✅ | |
| Per-content performance (views, likes, comments, shares, clicks, CTR) | ✅ | |
| Group-level metrics (posts_sent, engagement, member_count) | ✅ | |
| Viral score per content | ✅ | |
| A/B test performance tracking | ✅ | |
| Cost per lead / cost per post tracking | ✅ | |

---

## 9. Community Groups Feature

| Feature | Status | Notes |
|---------|--------|-------|
| Facebook group search (Graph API) | ✅ | Returns suggested groups |
| Reddit subreddit search (public JSON) | ✅ | No auth required for search |
| Telegram channel lookup | ✅ | Via bot API |
| Discord channel — manual input helper | ✅ | |
| Group suggestion status workflow | ✅ | suggested → joined → active → paused |
| Post to Facebook group | ✅ | Graph API put_object |
| Post to Reddit subreddit | ✅ | OAuth2 password flow |
| Post to Telegram channel | ✅ | Bot sendMessage |
| Post to Discord channel | ✅ | Webhook |
| 3× daily group posts (offset from main) | ✅ | 08:30, 13:30, 18:30 UTC |
| Weekly auto-discovery of new groups | ✅ | Sunday 03:30 UTC |
| Rate limiting (1–2 posts/group/day) | ✅ | Tracked via `last_posted_at` |
| Communities page UI (`/dashboard/groups`) | ✅ | Search, join-link, confirm, activate |
| Compliance notice ("join manually") | ✅ | Shown in UI |

---

## 10. Ten Power Tools (AI Add-Ons)

All tools use HuggingFace exclusively. Each runs autonomously via daily Celery tasks.

### 10.1 Content Remix Engine
- Turns any blog post / article into platform-native snippets
- Platform-specific re-formatting (TikTok, Instagram, X, LinkedIn, etc.)
- Daily trending hashtag injection
- Engagement-feedback-loop learning (high-engagement styles prioritised)
- Endpoint: `POST /remix/remix`, `POST /remix/batch`

### 10.2 Competitor Shadow Analyzer
- Daily scrape of competitor websites & social profiles
- HF-powered keyword extraction + insight generation
- Counter-strategy suggestions
- Sentiment analysis on competitor content
- Nightly Celery refresh + weekly full scan
- Endpoint: `POST /tools/competitor/analyze`

### 10.3 Feedback Alchemy Platform
- Processes social comments & reviews
- Transforms feedback into campaign tweaks and response templates
- A/B test simulation suggestions based on historical data
- Daily Celery run at 04:00 UTC
- Endpoint: `POST /tools/feedback/analyze`

### 10.4 Social Echo Amplifier
- Turns visitor queries and comments into amplified social campaigns
- Scales echoes based on virality potential
- Daily run at 10:00 UTC
- Endpoint: `POST /tools/echo/amplify`

### 10.5 SEO Mirage Creator
- Generates SEO-optimised text content and visual descriptions
- Aligns with platform algorithm hints
- Daily run at 05:00 UTC
- Endpoint: `POST /tools/seo/create`

### 10.6 Churn Shield Defender
- Predicts social audience churn using engagement drop signals
- Generates personalised re-engagement post campaigns
- Nightly Celery run at 01:00 UTC
- Endpoint: `POST /tools/churn/predict`

### 10.7 Dynamic Harmony Pricer
- Analyses daily social buzz to suggest price adjustments for promoted products
- Sentiment-aware pricing recommendations
- Daily run at 09:00 UTC
- Endpoint: `POST /tools/pricing/optimize`

### 10.8 Viral Spark Igniter
- Predicts daily viral opportunities from trend data
- Generates hooks, challenges, and angles for scheduled posts
- Pre-morning run at 07:00 UTC (before content generation)
- Endpoint: `POST /tools/viral/spark`

### 10.9 Audience Mirage Mapper
- Maps audience psychographics from engagement data
- Suggests segmented campaigns per platform/niche
- Daily run at 14:00 UTC
- Endpoint: `POST /tools/audience/map`

### 10.10 Ad Alchemy Optimizer
- Virtual A/B tests on ad copy variants
- Selects and deploys winning copy automatically
- Daily run at 15:00 UTC
- Endpoint: `POST /tools/ad/optimize`

---

## 11. SEO Blog Post Generator

| Feature | Status | Notes |
|---------|--------|-------|
| HF-powered long-form blog post generation | ✅ | Mistral-7B |
| Keyword-rich SEO structure (H1/H2/H3, meta) | ✅ | |
| Remix blog post to social snippets | ✅ | `POST /blog/{id}/remix-to-social` |
| Draft / published / archived status | ✅ | |
| Blog list, read, edit, delete | ✅ | |
| Blog page UI (`/dashboard/blog`) | ✅ | Generate, expand/collapse, publish, remix |

---

## 12. Engagement & Auto-Reply

| Feature | Status | Notes |
|---------|--------|-------|
| Engagement reply list | ✅ | |
| HF-generated reply suggestions | ✅ | `generate_comment_reply()` |
| Low-risk auto-reply toggle (per platform) | ✅ | |
| Auto-reply enabled toggle (per platform) | ✅ | |
| Comment-to-lead detection | ✅ | Interest keywords → auto-capture lead |
| `POST /engagement/reply` — fire reply async | ✅ | Background Celery task |
| Engagement page UI (`/dashboard/engagement`) | ✅ | |

---

## 13. A/B Testing

| Feature | Status | Notes |
|---------|--------|-------|
| A/B test creation | ✅ | Compare 2+ content variants |
| Variant tracking (views, CTR per variant) | ✅ | |
| Winner selection | ✅ | Highest CTR auto-wins |
| Daily analysis Celery task | ✅ | 03:00 UTC |
| A/B testing page UI (`/dashboard/ab-testing`) | ✅ | |

---

## 14. Cost Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Per-generation cost logging | ✅ | LLM tokens, image cost, video cost |
| Monthly API cost budget | ✅ | Per user, configurable |
| Cost-per-post, cost-per-lead metrics | ✅ | |
| Cost tracking page UI | ✅ | |

---

## 15. Autonomous Workflows

| Feature | Status | Notes |
|---------|--------|-------|
| Auto-repurpose top-performing content | ✅ | ≥100 views → remix to other platforms |
| Nightly webapp re-scraping | ✅ | Fresh site copy for generation |
| Feedback loop — learning from analytics | ✅ | HF scores + engagement data |
| Autonomous scheduler — `ENABLE_AUTO_POST` flag | ✅ | Off by default for safety |

---

## 16. Admin Panel

| Feature | Status | Notes |
|---------|--------|-------|
| System health + stats | ✅ | Users, webapps, content, posted count |
| System API key management | ✅ | Set HF/platform keys at runtime |
| Feature flag toggles | ✅ | Enable/disable auto-post, auto-reply, etc. |
| Trigger manual content generation | ✅ | Fire Celery task from UI |
| User list with usage stats | ✅ | |
| Admin page UI (`/dashboard/admin`) | ✅ | Requires `ADMIN_USER_IDS` in env |

---

## 17. API Key & Integrations Management

| Feature | Status | Notes |
|---------|--------|-------|
| Per-user API key storage (encrypted Fernet) | ✅ | |
| Supported keys: HUGGINGFACE_TOKEN, GROQ, OPENAI, GEMINI, LEONARDO, ELEVENLABS, REPLICATE, FAL_AI, SILICONFLOW, COQUI, PLAYHT | ✅ | |
| Add / delete / list API keys | ✅ | Values never returned in API |
| Platform OAuth2 connection status | ✅ | |
| Auto-post / auto-reply toggle per platform | ✅ | |
| Integrations page UI (`/dashboard/integrations`) | ✅ | |

---

## 18. Scheduler & Content Calendar

| Feature | Status | Notes |
|---------|--------|-------|
| Schedule content for future time | ✅ | `scheduled_for` datetime field |
| 15-minute post queue | ✅ | Celery picks up approved + scheduled content |
| Content calendar view (`/dashboard/scheduler`) | ✅ | |
| Smart scheduler service | ✅ | Optimal time-slot suggestions |

---

## 19. Settings & User Preferences

| Feature | Status | Notes |
|---------|--------|-------|
| Timezone selection | ✅ | |
| Language preference | ✅ | |
| Notification preferences (JSON) | ✅ | |
| Auto-post toggle | ✅ | |
| Auto-reply toggle | ✅ | |
| Low-risk auto-reply toggle | ✅ | |
| Settings page UI (`/dashboard/settings`) | ✅ | |

---

## 20. Deployment & Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| Docker Compose (7 services) | ✅ | db, redis, backend, worker, beat, frontend, nginx |
| Dockerfile.backend (Python 3.11 slim) | ✅ | |
| Dockerfile.frontend (Node 20, multi-stage Vite build) | ✅ | |
| Nginx reverse proxy with rate limiting | ✅ | 30 req/min on /api/ |
| SSL via Let's Encrypt / Certbot (docker profile) | ✅ | |
| Alembic database migrations (0001–0005) | ✅ | |
| `Base.metadata.create_all` on startup | ✅ | Fallback for dev |
| Celery worker + beat as separate containers | ✅ | |
| Health check endpoints | ✅ | `/health` on backend + nginx |
| CORS properly configured | ✅ | Via CORS_ORIGINS env |
| Fernet encryption for tokens & API keys | ✅ | `cryptography==46.0.5` |
| Svix webhook signature verification | ✅ | `svix==1.15.0` |
| Sentry error monitoring | ✅ | Optional SENTRY_DSN |
| Ubuntu Webdock VPS deployment guide | ✅ | `DEPLOYMENT_GUIDE.md` |
| Systemd service files documented | ✅ | In deployment guide |
| Log rotation strategy | ✅ | In deployment guide |
| Daily DB backup script | ✅ | In deployment guide |
| UFW firewall rules | ✅ | In deployment guide |
| Fail2Ban configuration | ✅ | In deployment guide |

---

## Summary

**Total backend API endpoints**: 100+  
**Total frontend pages**: 17  
**Social platforms supported**: 12  
**AI tasks / day per user**: up to 21 Celery-driven AI operations  
**HuggingFace models used**: 4 (Mistral-7B, BART-CNN, DistilBERT-SST2, BART-MNLI)  
**Only API key required to run**: `HUGGINGFACE_TOKEN`

---

*Designed and created by Amarktai Network*
