# AmarktAI Marketing

> **Autonomous AI Marketing at Scale**

AmarktAI Marketing is a full-stack SaaS platform that automates content creation, scheduling, competitor intelligence, and cross-platform publishing using a tiered AI provider strategy.

---

## Tech Stack

| Layer        | Technology                                                              |
|--------------|-------------------------------------------------------------------------|
| Frontend     | React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui + framer-motion |
| Backend      | FastAPI + SQLAlchemy + Alembic + Celery                                 |
| Database     | MySQL 8 — `mysql+pymysql://` driver — hosted on Webdock VPS             |
| Cache/Queue  | Redis 7                                                                 |
| Auth         | JWT HS256 — email/password only                                         |
| AI Primary   | Qwen (DashScope)                                                        |
| AI Fallback  | HuggingFace                                                             |
| AI Optional  | OpenAI, Gemini (Google)                                                 |
| Scraping     | Firecrawl                                                               |

---

## AI Provider Strategy

Requests flow through providers in priority order:

```
Firecrawl (web scraping) → Qwen (primary LLM) → HuggingFace (fallback) → OpenAI (optional) → Gemini (optional)
```

Only **Qwen** and **HuggingFace** keys are required. Firecrawl is strongly recommended for competitor intelligence. OpenAI and Gemini are opt-in enhancements.

---

## Project Structure

```
Amarktai-Marketing/
├── app/                  # React frontend (Vite)
│   ├── src/
│   │   ├── app/          # Page-level route components
│   │   ├── components/   # ui, layout, dashboard, auth components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # API client, auth utilities
│   │   └── types/        # TypeScript type definitions
│   └── package.json
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic and AI integrations
│   │   └── core/         # Config, security, database session
│   ├── alembic/          # Database migration scripts
│   └── requirements.txt
├── deploy/               # Deployment configs and scripts
├── docs/                 # Additional documentation
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for full setup instructions.

**TL;DR:**

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # edit DATABASE_URL, JWT_SECRET, QWEN_API_KEY
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd app
npm install
npm run dev                 # http://localhost:5173
```

---

## Environment Variables

| Variable            | Required | Description                                                  |
|---------------------|----------|--------------------------------------------------------------|
| `DATABASE_URL`      | ✅       | `mysql+pymysql://user:pass@localhost:3306/amarktai`          |
| `JWT_SECRET`        | ✅       | Random secret for JWT signing (`openssl rand -hex 32`)       |
| `ENCRYPTION_KEY`    | ✅       | Base64 key for credential encryption (`openssl rand -base64 32`) |
| `REDIS_URL`         | ✅       | `redis://localhost:6379/0`                                   |
| `QWEN_API_KEY`      | ✅       | DashScope API key (primary AI provider)                      |
| `HUGGINGFACE_TOKEN` | ✅       | HuggingFace access token (AI fallback)                       |
| `FIRECRAWL_API_KEY` | ⭐       | Recommended for competitor scraping and web data             |
| `OPENAI_API_KEY`    | ⬜       | Optional AI enhancement                                      |
| `GEMINI_API_KEY`    | ⬜       | Optional AI enhancement                                      |
| `SENDGRID_API_KEY`  | ⬜       | Deferred — SMTP email not required for beta                  |
| `STRIPE_SECRET_KEY` | ⬜       | Deferred — Payments not integrated in beta                   |
| `ADMIN_EMAIL`       | ✅       | Default admin account email address                          |
| `CORS_ORIGINS`      | ✅       | Comma-separated allowed frontend origins                     |

---

## Deployment

Deployed on a **Webdock VPS** running Ubuntu 22.04. The MySQL connection string format used throughout is:

```
mysql+pymysql://amarktai_user:yourpassword@localhost:3306/amarktai
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for the full guide and [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) for the pre-launch checklist.

---

## Features

See [FEATURES.md](./FEATURES.md) for the complete feature list with status markers.

Highlights:
- AI content generation across 10+ social platforms
- Autonomous scheduling and publishing
- Viral score and performance prediction
- Competitor intelligence via Firecrawl
- A/B testing and content repurposing
- Lead management and blog generation

---

## Integrations

See [INTEGRATIONS_LIST.md](./INTEGRATIONS_LIST.md) for all supported third-party integrations.
