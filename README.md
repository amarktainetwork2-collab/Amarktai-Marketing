# AmarktAI Marketing

**Autonomous AI Social Media Marketing Platform | Part of AmarktAI Network**

AmarktAI Marketing is a fully autonomous AI-powered social media marketing SaaS platform.
It generates, schedules, and publishes content across social platforms with **zero manual effort** beyond a single approval step per post.

**Deployment target:** `marketing.amarktai.com`

---

## Architecture

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery |
| Auth | Clerk (production) · Demo mode (development) |
| AI Providers | **HuggingFace** (Qwen 2.5-72B, Mistral-7B), **Qwen** (DashScope), **OpenAI** (optional, gpt-4o-mini) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Frontend

```bash
cd app
npm install
cp .env.example .env.local   # set VITE_CLERK_PUBLISHABLE_KEY
npm run dev                   # http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill required env vars
alembic upgrade head          # run database migrations
uvicorn app.main:app --reload # http://localhost:8000
```

### Celery Workers (optional, for background tasks)

```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
celery -A app.workers.celery_app beat --loglevel=info
```

---

## Environment Variables

### Frontend (`app/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | For prod auth | Clerk publishable key. Omit for demo mode. |
| `VITE_API_URL` | No | Backend API URL (default: `/api/v1`) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `CLERK_SECRET_KEY` | For prod auth | Clerk secret key. Omit for demo mode. |
| `ENCRYPTION_KEY` | Yes | 32-byte key for API key encryption (Fernet) |
| `ADMIN_EMAIL` | No | Platform admin email (default: `amarktainetwork@gmail.com`) |
| `ADMIN_USER_IDS` | No | Comma-separated Clerk user IDs for admin |
| **AI Providers** | | |
| `HUGGINGFACE_TOKEN` | Recommended | HuggingFace Inference API token |
| `QWEN_API_KEY` | Recommended | Qwen / DashScope API key (primary LLM) |
| `OPENAI_API_KEY` | Optional | OpenAI key for optional refinement layer |
| **Media Generation** | | |
| `LEONARDO_API_KEY` | Optional | Image generation |
| `STABILITY_API_KEY` | Optional | Image generation |
| `FAL_AI_KEY` | Optional | Image generation |
| `ELEVENLABS_API_KEY` | Optional | Voice generation |
| **Platform OAuth** | | |
| `YOUTUBE_CLIENT_ID/SECRET` | Optional | YouTube posting |
| `TIKTOK_CLIENT_ID/SECRET` | Optional | TikTok posting |
| `META_APP_ID/SECRET` | Optional | Instagram/Facebook posting |
| `TWITTER_API_KEY/SECRET` | Optional | Twitter/X posting |
| `LINKEDIN_CLIENT_ID/SECRET` | Optional | LinkedIn posting |

> **Note:** Features activate automatically when valid API keys are added. No code changes required.

---

## AI Provider Stack

| Priority | Provider | Model | Usage |
|----------|----------|-------|-------|
| 1 | **Qwen** (via DashScope or HuggingFace) | Qwen2.5-72B-Instruct | Primary content generation, insights, repurposing |
| 2 | **HuggingFace** | Mistral-7B-Instruct-v0.3 | Fallback content generation, keyword extraction |
| 3 | **OpenAI** (optional) | gpt-4o-mini | Content refinement, strategy, orchestration |
| 4 | Template engine | — | Always-available fallback when no AI keys configured |

---

## Admin & Roles

- **Admin** (`amarktainetwork@gmail.com` or IDs in `ADMIN_USER_IDS`):
  - Full access to all features and settings
  - **No subscription required** — admin bypasses all billing/quota limits
  - Access to admin panel, system controls, provider management
- **Normal users**: Subject to plan-based limits

---

## Key Features

| Feature | Status | Backend Endpoint |
|---------|--------|-----------------|
| AI Content Generation | ✅ Live | `POST /api/v1/content/generate` |
| AI Insights Feed | ✅ Live (polling) | `GET /api/v1/dashboard/insights` |
| Smart Scheduler | ✅ Live (polling) | `GET /api/v1/dashboard/scheduler/heatmap` |
| Viral Predictor | ✅ Live | `POST /api/v1/dashboard/viral-predict` |
| Performance Predictor | ✅ Live | `POST /api/v1/dashboard/performance-predict` |
| A/B Testing Panel | ✅ Live (polling) | `GET /api/v1/ab-testing/tests` |
| Content Repurposer | ✅ Live | `POST /api/v1/remix/` |
| Competitor Intelligence | ✅ Live | `GET /api/v1/dashboard/competitors` |
| Content Calendar | ✅ Live (polling) | `GET /api/v1/dashboard/calendar` |
| Engagement / Comments | ✅ Live | `GET /api/v1/engagement/queue` |
| 10 Power Tools | ✅ Live | `POST /api/v1/tools/{tool}` |
| Lead Management | ✅ Live | `GET /api/v1/leads/` |
| Blog Generator | ✅ Live | `POST /api/v1/blog/generate` |
| Autonomous Posting | ✅ Live | `POST /api/v1/autonomous/post/{id}` |
| Platform OAuth | ✅ Ready | `POST /api/v1/platforms/{platform}/connect` |

---

## VPS Deployment (marketing.amarktai.com)

### With Docker Compose

```bash
git clone <repo> && cd Amarktai-Marketing
cp backend/.env.example backend/.env   # fill env vars
cp app/.env.example app/.env.local     # fill env vars
docker-compose up -d --build
```

### Without Docker

1. **Build frontend:**
   ```bash
   cd app && npm ci && npm run build   # Output: app/dist/
   ```

2. **Start backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   alembic upgrade head
   gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
   ```

3. **Nginx** — use `nginx-subdomain.conf` (proxies `/api` to backend, serves `app/dist/` for frontend)

4. **Celery** (optional):
   ```bash
   celery -A app.workers.celery_app worker -D
   celery -A app.workers.celery_app beat -D
   ```

---

## Project Structure

```
amarktai-marketing/
├── app/                           # Frontend (React + Vite)
│   ├── src/
│   │   ├── app/                  # Page components (21 pages)
│   │   ├── components/           # UI + dashboard widgets
│   │   │   ├── dashboard/        # 9 dashboard feature components
│   │   │   ├── landing/          # Landing page sections
│   │   │   └── ui/               # shadcn/ui primitives
│   │   └── lib/                  # API client, motion, utilities
│   └── dist/                     # Production build (gitignored)
├── backend/                       # Backend (FastAPI)
│   ├── app/
│   │   ├── api/v1/endpoints/     # API routes (18 endpoint modules)
│   │   ├── agents/               # AI agent implementations
│   │   ├── services/             # HF, OpenAI, scheduler, predictor
│   │   ├── models/               # SQLAlchemy models
│   │   ├── workers/              # Celery tasks
│   │   └── workflows/            # Nightly automation workflow
│   └── requirements.txt
├── deploy/                        # Deployment configs
├── docs/blueprints/              # Architecture reference
├── docker-compose.yml
├── nginx-subdomain.conf
└── README.md
```

---

**Part of AmarktAI Network** — Building the future of autonomous marketing
