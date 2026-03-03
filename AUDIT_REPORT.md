# Amarktai Marketing — Full Code Audit Report

**Date**: 2026-03-03  
**Repository**: `amarktainetwork-blip/Amarktai-Marketing`  
**Branch**: `copilot/update-codebase-for-fastapi`  
**Auditor**: Amarktai AI Coding Agent  

---

## Executive Summary

The platform is a **full-stack autonomous AI social-media marketing SaaS** built with:

| Layer | Stack |
|---|---|
| Backend | FastAPI 0.109 + SQLAlchemy 2 + PostgreSQL + Redis + Celery |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| AI | HuggingFace Inference API + LangGraph multi-agent workflow |
| Auth | Clerk (JWT + webhooks) with demo-mode fallback |
| Deploy | Docker Compose + Nginx + Certbot |

**Overall readiness: ~88 % complete.**  
One critical bug was fixed in this session; three further items were resolved. The platform can accept real users after the remaining go-live checklist is completed.

---

## 1. Complete Feature List

### 1.1 Backend API — Route Groups & Endpoints

#### `POST /api/v1/auth/webhook/clerk`
Receives Clerk `user.created`, `user.updated`, `user.deleted` events.  
Svix HMAC signature verification enforced when `CLERK_WEBHOOK_SECRET` is set.

#### `GET /api/v1/users/me`
Returns the authenticated user's profile (plan, quotas, preferences).

#### `PUT /api/v1/users/me`
Updates name, timezone, language, notification preferences, auto-post/reply flags.

#### `PATCH /api/v1/users/me/location`
Stores browser-captured `latitude`/`longitude` on the user record for AI geo-targeting.

#### `GET/POST/PUT/DELETE /api/v1/webapps/`
Full CRUD for web apps (businesses). Maximum 20 per user enforced.

#### `POST /api/v1/webapps/{id}` — scrape triggered inline during content generation

#### `GET/POST /api/v1/platforms/`
List connected platforms, connect, disconnect (`PlatformConnection` records).

#### `GET /api/v1/content/`
List all content with optional `status` filter.

#### `GET /api/v1/content/pending`
Get pending approval queue.

#### `POST /api/v1/content/generate`
Single-item HuggingFace content generation for one webapp + platform.

#### `POST /api/v1/content/generate-all`
Batch: generate for all active platforms + active webapps (≤ 2 webapps per call). Scrapes live URL first.

#### `POST /api/v1/content/{id}/approve` / `reject` / update
Individual approval/rejection, bulk approve-all.

#### `GET /api/v1/analytics/summary`
Total posts, views, engagement, CTR + per-platform breakdown + 7-day daily stats.

#### `GET /api/v1/analytics/platform/{platform}`
Per-platform stats.

#### `GET/POST /api/v1/leads/`
Lead capture (public, no auth), list with filters, pagination.

#### `GET /api/v1/leads/stats`
Totals, qualification rate, conversion rate, by-platform breakdown.

#### `GET /api/v1/leads/export/csv`
CSV export (streaming response).

#### `PATCH/DELETE /api/v1/leads/{id}`
Update status/notes, delete lead.

#### `POST /api/v1/leads/utm/generate`
Generate UTM-tagged tracking links.

#### `GET /api/v1/engagement/queue`
Engagement reply queue with status/platform/priority filters.

#### `POST /api/v1/engagement/incoming`
Receive new DM/comment, trigger background AI reply generation.

#### `POST /api/v1/engagement/{id}/action`
Approve, reject, or edit an AI reply.

#### `POST /api/v1/engagement/{id}/regenerate`
Re-queue AI reply generation.

#### `POST /api/v1/engagement/batch-action`
Bulk approve/reject.

#### `GET /api/v1/engagement/stats`
Counts by status, by platform, pending total.

#### `GET /api/v1/integrations/api-keys`
List user's saved API keys (masked values).

#### `POST /api/v1/integrations/api-keys`
Save/update an API key (encrypted with Fernet AES-256).  
Accepted key names: `HUGGINGFACE_TOKEN`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `LEONARDO_API_KEY`, `ELEVENLABS_API_KEY`, `REPLICATE_API_TOKEN`, `FAL_AI_KEY`, `SILICONFLOW_API_KEY`, `COQUI_API_KEY`, `PLAYHT_API_KEY`.

#### `DELETE /api/v1/integrations/api-keys/{id}`
Delete API key.

#### `GET/PATCH /api/v1/integrations/platforms/{platform}`
Get integration status, update `auto_post_enabled` / `auto_reply_enabled` / `low_risk_auto_reply`.

#### `GET/POST /api/v1/ab-testing/tests`
List A/B tests, create new test.

#### `GET/PATCH /api/v1/ab-testing/tests/{id}`
Get details, update winner / confidence.

#### `GET /api/v1/cost-tracking/`
List cost tracking records.

#### `GET /api/v1/cost-tracking/summary`
Monthly cost summary.

#### `POST /api/v1/autonomous/batch-approve`
Batch-approve content and schedule to optimal times.

#### `POST /api/v1/autonomous/post/{id}`
Post immediately or schedule for a specific time.

#### `GET /api/v1/autonomous/queue-status`
Status counts + upcoming scheduled posts.

#### `POST /api/v1/autonomous/sync-analytics`
Background analytics sync from all connected platforms.

#### `GET /api/v1/autonomous/best-posting-times`
Historical best-performing hours.

#### `POST /api/v1/remix/`
Content Remix Engine — remixes existing content for a new platform.

#### `GET /api/v1/tools/competitor/analyze`  
Competitor Shadow Analyzer — scrapes + HF analysis.

#### `GET /api/v1/tools/feedback/`
Feedback Alchemy.

#### `GET /api/v1/tools/echo/`
Social Echo Amplifier.

#### `GET /api/v1/tools/seo-mirage/`
SEO Mirage Creator.

#### `GET /api/v1/tools/churn-shield/`
Churn Shield Defender.

#### `GET /api/v1/tools/harmony-pricer/`
Dynamic Harmony Pricer.

#### `GET /api/v1/tools/viral-spark/`
Viral Spark Igniter.

#### `GET /api/v1/tools/audience-map/`
Audience Mirage Mapper.

#### `GET /api/v1/tools/ad-alchemy/`
Ad Alchemy Optimizer.

#### `POST /api/v1/blog/generate`
Generate long-form SEO blog post via HuggingFace Mistral.

#### `GET/PATCH/DELETE /api/v1/blog/{id}`
Full blog post CRUD.

#### `POST /api/v1/blog/{id}/remix-to-social`
Remix blog post into social content for all connected platforms.

#### `GET/POST /api/v1/groups/`
List groups, search for groups by platform.

#### `POST /api/v1/groups/{id}/confirm-join`
Mark group as joined (user joined manually).

#### `PATCH /api/v1/groups/{id}/status`
Activate / pause / remove a group.

#### `POST /api/v1/groups/{id}/post`
Post content to an active group.

#### `DELETE /api/v1/groups/{id}`
Remove group record.

#### `GET /api/v1/groups/stats/summary`
Aggregate group stats.

#### `GET /api/v1/admin/health`
System health metrics (admin only).

#### `GET/POST /api/v1/admin/system-keys`
View / update system-level API keys at runtime.

#### `PATCH /api/v1/admin/feature-flags`
Toggle ENABLE_AUTO_POST, ENABLE_AUTO_REPLY, etc. at runtime.

#### `POST /api/v1/admin/trigger-generation`
Manually trigger a Celery content generation task.

#### `GET /api/v1/admin/users`
List all users with stats (admin only).

---

### 1.2 Background Workers (Celery Tasks)

| Task | Schedule | Description |
|---|---|---|
| `run_content_generation_and_post` | 08:00, 13:00, 18:00 UTC | HF content gen for all users |
| `post_approved_content` | Every 15 min | Posts APPROVED items to platforms |
| `sync_platform_analytics` | Every 6 hrs | Pulls analytics from all platforms |
| `analyze_ab_tests` | 03:00 UTC | Declares A/B test winners |
| `daily_competitor_refresh` | 02:00 UTC | Re-scrapes competitor profiles |
| `daily_viral_spark` | 07:00 UTC | Viral Spark report |
| `daily_churn_check` | 01:00 UTC | Churn Shield check |
| `daily_feedback_alchemy` | 04:00 UTC | Feedback Alchemy analysis |
| `daily_seo_mirage` | 05:00 UTC | SEO Mirage for yesterday's posts |
| `auto_repurpose_top_content` | 06:00 UTC | Repurposes top-performing content |
| `daily_harmony_pricer` | 09:00 UTC | Dynamic pricing report |
| `daily_echo_amplifier` | 10:00 UTC | Echo Amplifier |
| `daily_audience_mapper` | 14:00 UTC | Audience Mapper |
| `daily_ad_alchemy` | 15:00 UTC | Ad Alchemy |
| `poll_and_capture_comment_leads` | Every 2 hrs | Scans comments for leads |
| `search_and_suggest_groups` | Sunday 03:30 UTC | Weekly group suggestions |
| `post_to_active_groups` | 08:30, 13:30, 18:30 UTC | Group posting |
| `refresh_all_webapp_scrapes` | 00:30 UTC | Nightly URL re-scrape |

---

### 1.3 AI Agents

| Agent | File | Purpose |
|---|---|---|
| `ResearchAgentV2` | `research_agent_v2.py` | Trend research, competitor analysis, optimal posting times |
| `CreativeAgent` | `creative_agent.py` | Platform-specific content package generation |
| `MediaAgentV2` | `media_agent_v2.py` | Image/video/audio generation with multi-provider cascade |
| `OptimizerAgent` | `optimizer_agent.py` | Viral score optimisation, hashtag tuning |
| `CommunityAgent` | `community_agent.py` | Sentiment analysis, tone-matched reply generation |
| `MediaAgent` (v1) | `media_agent.py` | Legacy Leonardo / Runway / ElevenLabs wrapper |
| `ResearchAgent` (v1) | `research_agent.py` | Legacy CrewAI-based research |

---

### 1.4 Services

| Service | File | Key Functions |
|---|---|---|
| `HuggingFaceGenerator` | `hf_generator.py` | `generate_content`, `generate_batch`, `generate_blog_post`, `generate_comment_reply`, `remix_to_platform`, `score_lead_intelligence` |
| `SmartScheduler` | `smart_scheduler.py` | Platform optimal time tables, audience insights |
| Web Scraper | `scraper.py` | `scrape_page`, `scrape_multiple` (httpx + BeautifulSoup) |
| Posting Service | `posting_service.py` | `post_to_twitter`, `post_to_instagram`, `post_to_facebook_group`, `post_to_reddit`, `post_to_telegram_channel`, `post_to_discord_channel`, `post_to_linkedin`, `post_to_youtube`, `post_to_tiktok`, `post_to_pinterest`, `post_to_bluesky`, `post_to_threads` |
| Group Search | `group_search.py` | `search_groups_for_webapp`, `extract_keywords_from_scraped` |
| AB Testing | `ab_testing.py` | Variant selection, winner analysis |
| Content Predictor | `content_predictor.py` | Viral prediction scoring |

---

### 1.5 Database Models (17 tables)

| Table | Model | Migration |
|---|---|---|
| `users` | `User` | 0001 |
| `webapps` | `WebApp` | 0001 |
| `platform_connections` | `PlatformConnection` | 0001 |
| `content` | `Content` | 0001 |
| `analytics` | `Analytics` | 0001 |
| `engagement_replies` | `EngagementReply` | 0001 |
| `ab_tests` | `ABTest` | 0001 |
| `viral_scores` | `ViralScore` | 0001 |
| `cost_tracking` | `CostTracking` | 0001 |
| `user_api_keys` | `UserAPIKey` | 0001 |
| `user_integrations` | `UserIntegration` | 0001 |
| `content_remixes` | `ContentRemix` | 0002 |
| `competitor_profiles` | `CompetitorProfile` | 0002 |
| `feedback_analyses` | `FeedbackAnalysis` | 0002 |
| `leads` | `Lead` | 0003 |
| `blog_posts` | `BlogPost` | 0004 |
| `business_groups` | `BusinessGroup` | 0005 |
| `users.geo_lat/geo_lon` (columns) | `User` | **0006** ✅ added this session |

---

### 1.6 Frontend Pages (15 pages)

| Route | File | Connected to real API |
|---|---|---|
| `/` | `page.tsx` (landing) | Pricing plans from `mockData.ts` (static, intentional) |
| `/login` | `login/page.tsx` | Clerk or demo mode |
| `/register` | `register/page.tsx` | Clerk or demo mode |
| `/dashboard` | `dashboard/page.tsx` | ✅ `contentApi.getPending`, `analyticsApi.getSummary` |
| `/dashboard/webapps` | `webapps/page.tsx` | ✅ `webAppApi.getAll` |
| `/dashboard/webapps/new` | `webapps/new/page.tsx` | ✅ `webAppApi.create` |
| `/dashboard/webapps/edit/:id` | `webapps/edit/page.tsx` | ✅ `webAppApi.update` |
| `/dashboard/platforms` | `platforms/page.tsx` | ✅ `platformApi.getAll/connect/disconnect` |
| `/dashboard/content` | `content/page.tsx` | ✅ `contentApi`, `contentBatchApi` |
| `/dashboard/approval` | `approval/page.tsx` | ✅ `contentApi.getPending/approve/reject` |
| `/dashboard/scheduler` | `scheduler/page.tsx` | ⚠️ `SmartScheduler` component uses mock data |
| `/dashboard/analytics` | `analytics/page.tsx` | ✅ `analyticsApi.getSummary` |
| `/dashboard/settings` | `settings/page.tsx` | ✅ `integrationsApi.saveApiKey` |
| `/dashboard/integrations` | `integrations/page.tsx` | ✅ `integrationsApi` |
| `/dashboard/engagement` | `engagement/page.tsx` | ✅ engagement API |
| `/dashboard/tools` | `tools/page.tsx` | ✅ power tools API |
| `/dashboard/leads` | `leads/page.tsx` | ✅ `leadsApi` |
| `/dashboard/blog` | `blog/page.tsx` | ✅ `blogApi` |
| `/dashboard/groups` | `groups/page.tsx` | ✅ `groupsApi` |
| `/dashboard/admin` | `admin/page.tsx` | ✅ admin API |

---

### 1.7 Frontend Dashboard Components

| Component | File | Data Source |
|---|---|---|
| `ContentStudio` | `ContentStudio.tsx` | ✅ calls `contentBatchApi.generateAll` |
| `SmartScheduler` | `SmartScheduler.tsx` | ⚠️ hardcoded `mockScheduledPosts` — **not connected to API** |
| `ABTestingPanel` | `ABTestingPanel.tsx` | ⚠️ hardcoded `mockTests` — **not connected to API** |
| `ContentRepurposer` | `ContentRepurposer.tsx` | ⚠️ hardcoded `mockContent` — **not connected to API** |
| `ViralPredictor` | `ViralPredictor.tsx` | ⚠️ hardcoded `mockPrediction` — **not connected to API** |
| `PerformancePredictor` | `PerformancePredictor.tsx` | ⚠️ generates random mock prediction — **not connected to API** |
| `CompetitorIntel` | `CompetitorIntel.tsx` | ⚠️ hardcoded `mockCompetitors`/`mockTrends` — **not connected to API** |
| `AIInsightsFeed` | `AIInsightsFeed.tsx` | ⚠️ hardcoded `mockInsights` — **not connected to API** |
| `ContentCalendar` | `ContentCalendar.tsx` | Visual calendar component |

---

### 1.8 PWA / Mobile

- `app/public/manifest.json` — PWA manifest (name, icons, shortcuts, theme colour)
- `app/public/service-worker.js` — Network-first API, cache-first static, offline shell fallback, push notifications
- `app/index.html` — manifest link, Apple PWA meta tags, SW registration script

---

## 2. Incomplete / Unfinished Sections

### 2.1 Backend

| # | File | Issue | Severity |
|---|---|---|---|
| B1 | `backend/app/services/smart_scheduler.py` | Uses hardcoded time tables with `random.choice`; does not query real audience analytics | Medium |
| B2 | `backend/app/integrations/platforms/instagram.py` | OAuth flow stubs only — no token exchange implemented | Medium |
| B3 | `backend/app/integrations/platforms/youtube.py` | OAuth flow stubs only — no token exchange implemented | Medium |
| B4 | `backend/app/api/v1/endpoints/autonomous.py` line 164 | `# In production, send the reply via platform API` comment — actual API call not made; status is manually set to SENT | Medium |
| B5 | `backend/app/agents/research_agent_v2.py` line 372 | Comment `# This is a placeholder for the actual implementation` in `get_optimal_posting_time` | Low |
| B6 | `backend/app/agents/media_agent.py` | Falls back to placeholder image/video/audio URLs when no API key set — placeholders would be stored as real media URLs in DB | Low |
| B7 | `backend/app/agents/media_agent_v2.py` | Same placeholder fallback for image/video | Low |
| B8 | `backend/app/services/group_search.py` | Telegram and Discord return placeholder suggestions (no public search API exists; this is intentional by design — documented) | Low (by design) |
| B9 | `backend/app/api/v1/endpoints/integrations.py` | `GET /integrations/platforms/{platform}/connect-url` returns mock auth URL; real OAuth redirect flow not implemented | High |

### 2.2 Frontend Dashboard Components (Mock Data)

| # | Component | Issue | Severity |
|---|---|---|---|
| F1 | `SmartScheduler.tsx` | Shows 3 hardcoded scheduled posts; does not call `GET /autonomous/queue-status` | Medium |
| F2 | `ABTestingPanel.tsx` | Shows 2 hardcoded A/B tests; does not call `GET /ab-testing/tests` | Medium |
| F3 | `ContentRepurposer.tsx` | Shows hardcoded repurposed content; does not call remix API | Medium |
| F4 | `ViralPredictor.tsx` | Returns hardcoded viral prediction object; does not call viral-spark API | Medium |
| F5 | `PerformancePredictor.tsx` | Generates random mock prediction locally; no API call | Medium |
| F6 | `CompetitorIntel.tsx` | Shows 2 hardcoded competitors + 4 hardcoded trends; does not call competitor tools API | Medium |
| F7 | `AIInsightsFeed.tsx` | Shows 4 hardcoded insights; does not call any real insights endpoint | Medium |

### 2.3 Missing Functionality

| # | Area | Description | Severity |
|---|---|---|---|
| M1 | OAuth token exchange | Platforms page allows connecting by entering an account name (no real OAuth redirect → callback → token exchange flow) | High |
| M2 | Stripe subscription enforcement | Pricing plans UI and Stripe keys exist but no subscription gate on quota/plan limits | Medium |
| M3 | Email notifications | `RESEND_API_KEY` in config, `FROM_EMAIL` set, but no email send calls implemented anywhere | Medium |
| M4 | Push notifications | Service worker handles push events; no backend endpoint to send `PushSubscription` or call Web Push API | Low |
| M5 | Media file uploads | `uploads/` directory created in Docker, but no file upload endpoint (`POST /media/upload`) | Low |
| M6 | Webhook receivers for platforms | Auto-reply flow requires incoming webhooks from Twitter, Instagram, etc. — no platform webhook handler routes defined | Medium |
| M7 | Rate-limit enforcement | `MAX_CONTENT_PER_DAY` / `MAX_ENGAGEMENT_REPLIES_PER_DAY` flags exist in config but are not enforced in endpoints | Medium |

---

## 3. Go-Live Blockers

### 🔴 CRITICAL (was blocking, now fixed)

| # | Blocker | Status |
|---|---|---|
| C1 | **HuggingFace key name mismatch**: `settings/page.tsx` called `saveApiKey('huggingface', ...)` but backend `valid_keys` only accepts `'HUGGINGFACE_TOKEN'`. Every user attempting to save their HF key from Settings would silently fail with a misleading "Failed to save key" toast. | ✅ **FIXED** — key name corrected to `'HUGGINGFACE_TOKEN'` |
| C2 | **`geo_lat`/`geo_lon` columns not in DB schema**: `users.py` endpoint wrote to `current_user.geo_lat` / `current_user.geo_lon` but no Alembic migration created those columns. The endpoint silently skipped and logged a debug message. | ✅ **FIXED** — migration `0006_user_geolocation.py` created; columns added to `User` model |

### 🟠 HIGH (must fix before accepting paid users)

| # | Blocker | Details |
|---|---|---|
| H1 | **No real OAuth flow for social platforms** | The Platforms page lets users type an `accountName` and calls `POST /platforms/{platform}/connect` which just creates a DB record. Real users need a proper OAuth redirect → callback → token exchange. Without real tokens, `post_approved_content` task will fail for every platform. Workaround for launch: use manual API-key mode (direct token entry in Integrations) and document this for users. |
| H2 | **`ENCRYPTION_KEY` default value in `.env.example`** | The default `"your-encryption-key-here-change-in-production"` is a known value. If deployed without changing it, all stored API keys can be decrypted by anyone with the codebase. Must be changed to a random 32-byte key before any user stores keys. **Instruction**: run `openssl rand -base64 32` and set result as `ENCRYPTION_KEY`. |
| H3 | **`CLERK_WEBHOOK_SECRET` not set → webhook signature skipped** | In `auth.py`, signature verification is skipped when `CLERK_WEBHOOK_SECRET` is empty. Without it, anyone can POST to `/auth/webhook/clerk` and create arbitrary users. Must set `CLERK_WEBHOOK_SECRET` from Clerk Dashboard → Webhooks. |
| H4 | **`POSTGRES_PASSWORD` uses default `changeme`** | `docker-compose.yml` defaults `POSTGRES_PASSWORD=changeme`. Must override in production `.env` before deploy. |

### 🟡 MEDIUM (fix before scaling or for production quality)

| # | Item | Details |
|---|---|---|
| M1 | **Dashboard components use mock data** | 7 components (`SmartScheduler`, `ABTestingPanel`, `ContentRepurposer`, `ViralPredictor`, `PerformancePredictor`, `CompetitorIntel`, `AIInsightsFeed`) show hardcoded data. They work for demo but users see static numbers. Connect them to real API endpoints. |
| M2 | **Rate limits not enforced** | `MAX_CONTENT_PER_DAY` is defined but never checked against `monthly_content_used` in endpoints. Heavy users could abuse the HF free tier. |
| M3 | **Stripe billing not wired** | Subscription plans are UI-only. No webhook handler for `checkout.session.completed` to update user plan in DB. |
| M4 | **No media upload endpoint** | Content generation stores `media_urls=[]`. Users cannot upload images/videos to attach to posts. |
| M5 | **Platform OAuth not implemented** | See H1 above — medium severity for launch with manual tokens. |

### 🟢 LOW (polish / nice-to-have)

| # | Item |
|---|---|
| L1 | `SmartScheduler.py` service uses `random.choice` fallback instead of historical analytics |
| L2 | Engagement reply `approve` action marks as SENT without actually calling the platform post API |
| L3 | `AIInsightsFeed`, `ViralPredictor`, `PerformancePredictor` components have no real API connection |
| L4 | No PWA icon PNGs in `app/public/icons/` — manifest references icon files that don't exist yet |
| L5 | Placeholder image/video URLs from media agents stored in DB without validation |
| L6 | No email send implementation despite `RESEND_API_KEY` configuration |
| L7 | `_clerk_jwks_uri()` parsing logic in `deps.py` is fragile — better to use the `CLERK_PUBLISHABLE_KEY` form |

---

## 4. Security Notes

| Item | Status |
|---|---|
| Fernet AES-256 encryption for all stored API keys / OAuth tokens | ✅ Implemented |
| Clerk JWT verification with JWKS | ✅ Implemented |
| Svix HMAC webhook signature verification | ✅ Implemented (skipped in demo mode) |
| `ENCRYPTION_KEY` default value is insecure | ⚠️ Must change before production |
| `CLERK_WEBHOOK_SECRET` empty skips verification | ⚠️ Must set before production |
| `POSTGRES_PASSWORD` defaults to `changeme` | ⚠️ Must change before production |
| Pillow `10.2.0` buffer overflow CVE | ✅ Fixed → `12.1.1` |
| Pillow `10.3.0` PSD out-of-bounds write CVE | ✅ Fixed → `12.1.1` |
| Admin endpoints gated by `get_admin_user` | ✅ Implemented |
| `ADMIN_USER_IDS` env var for admin whitelist | ✅ Implemented |
| CORS restricted to configured origins | ✅ Implemented |

---

## 5. Deploy Checklist (Ready-to-Accept-Users)

```
# Minimum viable production setup:

1. VPS: Ubuntu 22.04, ≥2 GB RAM, ≥20 GB disk
2. DNS A record → VPS IP
3. Clone repo to /var/www/amarktai
4. cp backend/.env.example backend/.env  → fill in:
     DATABASE_URL=postgresql://amarktai:<STRONG_PW>@db:5432/amarktai
     REDIS_URL=redis://redis:6379
     ENCRYPTION_KEY=$(openssl rand -base64 32)    ← CRITICAL
     CLERK_SECRET_KEY=sk_live_...
     CLERK_PUBLISHABLE_KEY=pk_live_...
     CLERK_WEBHOOK_SECRET=whsec_...               ← CRITICAL
     HUGGINGFACE_TOKEN=hf_...
     ADMIN_USER_IDS=<your-clerk-user-id>
     POSTGRES_PASSWORD=<STRONG_PW>                ← CRITICAL
     DOMAIN=yourdomain.com
     FRONTEND_URL=https://yourdomain.com
     CORS_ORIGINS=https://yourdomain.com
     DEBUG=false

5. cp app/.env.example app/.env.local → fill in:
     VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
     VITE_API_URL=https://yourdomain.com

6. docker compose up -d --build
7. docker compose exec backend alembic upgrade head   ← runs all 6 migrations
8. SSL: docker compose --profile ssl run certbot
9. Verify: curl https://yourdomain.com/api/v1/health
10. In Clerk Dashboard → Webhooks → add endpoint:
      https://yourdomain.com/api/v1/auth/webhook/clerk
      Events: user.created, user.updated, user.deleted
```

---

## 6. Changes Made in This Session

| File | Change |
|---|---|
| `app/src/app/settings/page.tsx` | **BUG FIX**: Changed `saveApiKey('huggingface', ...)` → `saveApiKey('HUGGINGFACE_TOKEN', ...)` |
| `backend/alembic/versions/0006_user_geolocation.py` | **NEW**: Migration adding `geo_lat FLOAT` and `geo_lon FLOAT` to `users` table |
| `backend/app/models/user.py` | **NEW**: Added `geo_lat` and `geo_lon` Float columns to the `User` SQLAlchemy model |
| `AUDIT_REPORT.md` | **NEW**: This document — complete feature list, incomplete sections, go-live blockers |

---

*Part of Amarktai Network — Copyright 2026*
