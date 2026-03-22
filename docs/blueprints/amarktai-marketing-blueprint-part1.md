# AmarktAI Marketing - Complete SaaS Blueprint
## Autonomous AI Social Media Marketing Engine | Part of AmarktAI Network

---

# Executive Summary

AmarktAI Marketing is a fully autonomous AI-powered social media marketing SaaS platform that promotes users' web apps across the top 6 social media platforms daily with **zero manual effort** beyond a single daily approval step.

### Core Value Proposition
- **Set & Forget**: Connect your web apps once, approve content daily
- **6-Platform Coverage**: YouTube Shorts, TikTok, Instagram, Facebook, X, LinkedIn
- **AI-Generated Content**: Videos, images, copy, hashtags optimized per platform
- **Performance-Driven**: Self-optimizing based on engagement data
- **Affordable**: Built on free/cheap API tiers with clear upgrade paths

---

# 1. System Architecture Overview

## 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AMARKTAI MARKETING PLATFORM                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND LAYER (Next.js)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ Landing Page│  │  Dashboard  │  │   Auth      │  │ Content Preview │  │   │
│  │  │   (Public)  │  │  (Private)  │  │ (Clerk)     │  │   & Approval    │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│                                    ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      API GATEWAY / BACKEND (FastAPI)                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │   Users     │  │   Web Apps  │  │   Content   │  │   Scheduling    │  │   │
│  │  │    API      │  │     API     │  │     API     │  │      API        │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│                                    ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    AI ORCHESTRATION LAYER (CrewAI)                       │   │
│  │                                                                          │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │   │ Research │  │ Creative │  │  Media   │  │ Optimize │  │  Post    │  │   │
│  │   │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │  │   │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  │                                                                          │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐                              │   │
│  │   │ Reporting│  │  Trend   │  │ Community│                              │   │
│  │   │  Agent   │  │  Agent   │  │  Agent   │                              │   │
│  │   └──────────┘  └──────────┘  └──────────┘                              │   │
│  │                                                                          │   │
│  │                    [Central Orchestrator - LangGraph]                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│                                    ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      EXTERNAL SERVICE INTEGRATIONS                       │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    MEDIA GENERATION APIs                         │   │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │   │   │
│  │  │  │ Leonardo │  │ Runway   │  │ ElevenLabs│  │   Shotstack      │ │   │   │
│  │  │  │    AI    │  │   ML     │  │   TTS    │  │  Video Editor    │ │   │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                  SOCIAL MEDIA PLATFORM APIs                      │   │   │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌─────┐ │   │   │
│  │  │  │YouTube │ │ TikTok │ │Instagram│ │Facebook│ │   X    │ │Linked│ │   │   │
│  │  │  │ Shorts │ │        │ │  Reels  │ │        │ │Twitter │ │  In  │ │   │   │
│  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └─────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                      LLM PROVIDERS                               │   │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │   │
│  │  │  │  Grok API    │  │ Claude 3.5   │  │      GPT-4o          │  │   │   │
│  │  │  │ (Primary)    │  │ (Fallback)   │  │   (Premium Tier)     │  │   │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│                                    ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER (Supabase)                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ PostgreSQL  │  │    Redis    │  │   Storage   │  │  Edge Functions │  │   │
│  │  │  (Primary)  │  │   (Cache)   │  │   (Media)   │  │  (Background)   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DAILY AUTONOMOUS CYCLE                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    2:00 AM (User Local Time)
            |
            ▼
    ┌───────────────┐
    │  Scheduler    | ──► Triggers nightly workflow for each active user
    │  (Bull Queue) |
    └───────────────┘
            |
            ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         ORCHESTRATOR (LangGraph)                         │
    └─────────────────────────────────────────────────────────────────────────┘
            |
    ┌───────┴───────┬───────────────┬───────────────┬───────────────┐
    ▼               ▼               ▼               ▼               ▼
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
|Research|───►|Creative|───►| Media  |───►|Optimize|───►| Queue  |
| Agent  |    | Agent  |    | Agent  |    | Agent  |    | Content|
└────────┘    └────────┘    └────────┘    └────────┘    └────────┘
    |               |               |               |               |
    |               |               |               |               |
    ▼               ▼               ▼               ▼               ▼
• Trends      • Scripts      • Images      • A/B tests   • Store in
• Competitors • Copywriting  • Videos      • Scheduling  •   DB
• Platform    • Hashtags     • Voiceover   • Targeting   • Notify User
  updates     • CTAs         • Assembly


    8:00 AM (User Local Time)
            |
            ▼
    ┌───────────────┐
    │    Email      | ──► "Your daily content is ready for approval"
    │  Notification |
    └───────────────┘
            |
            ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                     USER APPROVAL DASHBOARD                              │
    │                                                                          │
    │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
    │   │ Preview │  │ Preview │  │ Preview │  │ Preview │  │ Preview │      │
    │   │Content 1│  │Content 2│  │Content 3│  │Content 4│  │Content 5│      │
    │   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
    │                                                                          │
    │   [✓ Approve All]  [✓ Approve Selected]  [✗ Reject All]  [Edit]        │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
            |
            ▼
    ┌───────────────┐
    │   Approval    | ──► User reviews, approves/rejects/edits content
    │   Received    |
    └───────────────┘
            |
            ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                      POSTING ORCHESTRATOR                                │
    │                                                                          │
    │   For each approved content piece:                                       │
    │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐             │
    │   │YouTube  │    │ TikTok  │    │Instagram│    │   X     │             │
    │   │ Shorts  │    │         │    │  Reels  │    │Twitter  │             │
    │   └─────────┘    └─────────┘    └─────────┘    └─────────┘             │
    │                                                                          │
    │   ┌─────────┐    ┌─────────┐                                            │
    │   │Facebook │    │LinkedIn │                                            │
    │   │  Reels  │    │         │                                            │
    │   └─────────┘    └─────────┘                                            │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
            |
            ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                    PERFORMANCE MONITORING                                │
    │                                                                          │
    │   • Track views, likes, shares, comments, CTR                            │
    │   • Store metrics in analytics DB                                        │
    │   • Feed data back to Optimization Agent                                 │
    │   • Generate daily/weekly reports                                        │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Complete Repository Structure

```
amarktai-marketing/
|
├── 📁 apps/
│   |
│   ├── 📁 web/                          # Next.js Frontend Application
│   │   ├── 📁 app/
│   │   │   ├── 📁 (auth)/
│   │   │   │   ├── 📁 login/
│   │   │   │   ├── 📁 register/
│   │   │   │   ├── 📁 reset-password/
│   │   │   │   └── layout.tsx
│   │   │   |
│   │   │   ├── 📁 (dashboard)/
│   │   │   │   ├── 📁 dashboard/        # Main dashboard
│   │   │   │   ├── 📁 webapps/          # List web apps
│   │   │   │   ├── 📁 content/          # Content library
│   │   │   │   ├── 📁 approval/         # Daily approval queue
│   │   │   │   ├── 📁 analytics/        # Performance analytics
│   │   │   │   └── 📁 settings/         # Account settings
│   │   │   |
│   │   │   ├── 📁 api/webhooks/         # Clerk & Stripe webhooks
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 # Landing page
│   │   │   └── globals.css
│   │   |
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/                   # shadcn/ui components
│   │   │   ├── 📁 layout/               # Navbar, Sidebar, Footer
│   │   │   ├── 📁 dashboard/            # StatsCards, ApprovalQueue
│   │   │   ├── 📁 content/              # ContentCard, VideoPlayer
│   │   │   └── 📁 webapps/              # WebAppCard, WebAppForm
│   │   |
│   │   ├── 📁 hooks/                    # useAuth, useContent, etc.
│   │   ├── 📁 lib/                      # utils, api-client
│   │   ├── 📁 types/                    # TypeScript definitions
│   │   └── 📁 public/                   # Static assets
│   |
│   └── 📁 marketing-site/               # Optional: Separate marketing site
│
├── 📁 services/
│   └── 📁 api/                          # FastAPI Backend Service
│       ├── 📁 app/
│       │   ├── 📁 api/v1/endpoints/     # API routes
│       │   ├── 📁 core/                 # config, security
│       │   ├── 📁 models/               # Database models
│       │   ├── 📁 schemas/              # Pydantic schemas
│       │   ├── 📁 services/             # Business logic
│       │   └── 📁 db/                   # Database session
│       ├── Dockerfile
│       └── requirements.txt
│
├── 📁 agents/                           # AI Agent System (CrewAI + LangGraph)
│   ├── 📁 src/
│   │   ├── 📁 agents/                   # Research, Creative, Media, etc.
│   │   ├── 📁 crews/                    # Agent crews
│   │   ├── 📁 workflows/                # LangGraph workflows
│   │   ├── 📁 tools/                    # Agent tools
│   │   └── 📁 prompts/                  # LLM prompts
│   └── Dockerfile
│
├── 📁 workers/                          # Background Job Workers
│   ├── 📁 src/jobs/                     # Content generation, posting
│   └── worker.py
│
├── 📁 integrations/                     # Platform API Integrations
│   ├── 📁 src/platforms/                # YouTube, TikTok, Instagram, etc.
│   ├── 📁 src/media/                    # Leonardo, Runway, ElevenLabs
│   └── 📁 src/oauth/                    # OAuth manager
│
├── 📁 supabase/                         # Database Migrations
│   ├── 📁 migrations/
│   └── 📁 functions/                    # Edge functions
│
├── 📁 infrastructure/                   # IaC
│   ├── 📁 terraform/
│   ├── 📁 kubernetes/
│   └── 📁 docker/
│
└── 📁 docs/                             # Documentation
```

---

# 3. Step-by-Step Implementation Roadmap

## Phase 1: Foundation & MVP (Weeks 1-4)

### Week 1: Project Setup & Authentication

**Day 1-2: Repository & Infrastructure**
```bash
# Initialize monorepo structure
mkdir amarktai-marketing && cd amarktai-marketing

# Setup frontend
npx create-next-app@latest apps/web --typescript --tailwind --app

# Setup backend
mkdir -p services/api && cd services/api
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic pydantic python-jose

# Setup Supabase project
# - Create project at supabase.com
# - Initialize CLI: supabase init
# - Start local: supabase start
```

**Day 3-4: Authentication (Clerk)**
- [ ] Setup Clerk account & configure application
- [ ] Integrate Clerk with Next.js frontend
- [ ] Create auth pages (login, register, reset)
- [ ] Protect dashboard routes
- [ ] Sync Clerk users to Supabase database

**Day 5-7: Database Schema**
- [ ] Design core tables (users, webapps, content, platforms)
- [ ] Create Supabase migrations
- [ ] Setup Row Level Security (RLS) policies
- [ ] Create database triggers and functions

**Deliverable**: Working auth system with protected routes

---

### Week 2: Core Dashboard & Web App Management

**Day 8-10: Dashboard UI**
- [ ] Create sidebar navigation
- [ ] Build dashboard layout with shadcn/ui
- [ ] Implement stats cards component
- [ ] Create recent activity feed

**Day 11-12: Web App CRUD**
- [ ] Web app list page
- [ ] Add new web app form
- [ ] Edit web app functionality
- [ ] Delete with confirmation

**Day 13-14: API Endpoints**
- [ ] `/api/v1/webapps` - CRUD endpoints
- [ ] Input validation with Pydantic
- [ ] Error handling
- [ ] API documentation with Swagger

**Deliverable**: Users can add/manage their web apps

---

### Week 3: Social Platform Connections

**Day 15-17: OAuth Integration**
- [ ] YouTube OAuth setup
- [ ] Meta (Instagram/Facebook) OAuth
- [ ] X (Twitter) OAuth
- [ ] LinkedIn OAuth
- [ ] TikTok OAuth

**Day 18-19: Connection Management UI**
- [ ] Platform connection cards
- [ ] Connect/disconnect functionality
- [ ] Connection status indicators
- [ ] Token refresh logic

**Day 20-21: Token Storage**
- [ ] Encrypt OAuth tokens
- [ ] Store in Supabase securely
- [ ] Token refresh scheduling

**Deliverable**: Users can connect social accounts

---

### Week 4: Basic Content Generation (Manual)

**Day 22-24: Content Creation UI**
- [ ] Content creation form
- [ ] Platform selection
- [ ] Text input for captions
- [ ] Image upload functionality

**Day 25-26: Manual Posting**
- [ ] Post to connected platforms
- [ ] Platform-specific formatting
- [ ] Scheduling (immediate or future)

**Day 27-28: Content Library**
- [ ] List all created content
- [ ] Filter by platform/status
- [ ] View content details
- [ ] Delete content

**Deliverable**: MVP - Users can manually create and post content

---

## Phase 2: AI Content Generation (Weeks 5-8)

### Week 5: AI Agent Foundation

**Day 29-31: LLM Integration**
- [ ] Setup Grok API access
- [ ] Create LLM client wrapper
- [ ] Implement fallback to Claude/GPT-4o
- [ ] Rate limiting and cost tracking

**Day 32-33: Research Agent**
- [ ] Trend analysis implementation
- [ ] Competitor content research
- [ ] Platform best practices research
- [ ] Web app analysis

**Day 34-35: Creative Agent**
- [ ] Script generation for videos
- [ ] Caption/copy generation
- [ ] Hashtag research
- [ ] CTA optimization

**Deliverable**: AI agents can research and generate content ideas

---

### Week 6: Media Generation Integration

**Day 36-37: Image Generation**
- [ ] Leonardo.AI API integration
- [ ] Image prompt generation
- [ ] Download and store images
- [ ] Image optimization

**Day 38-39: Video Generation**
- [ ] Runway ML API integration
- [ ] Video script to generation
- [ ] Download and store videos

**Day 40-41: Voiceover Generation**
- [ ] ElevenLabs API integration
- [ ] Voice selection per content
- [ ] Audio file generation

**Day 42: Video Assembly**
- [ ] Shotstack integration
- [ ] Combine video + audio + captions
- [ ] Final video rendering

**Deliverable**: AI can generate complete media assets

---

### Week 7: Content Generation Pipeline

**Day 43-45: Orchestration (LangGraph)**
- [ ] Design workflow graph
- [ ] Implement state management
- [ ] Create agent coordination
- [ ] Error handling and retries

**Day 46-47: Content Generation Job**
- [ ] Bull queue setup
- [ ] Background job implementation
- [ ] Progress tracking
- [ ] Failure recovery

**Day 48-49: Content Preview System**
- [ ] Generate content previews
- [ ] Store generated content in DB
- [ ] Mark as "pending approval"

**Day 50: Testing & Refinement**
- [ ] End-to-end testing
- [ ] Prompt engineering
- [ ] Output quality improvement

**Deliverable**: Automated content generation pipeline

---

### Week 8: Approval Workflow

**Day 51-53: Approval Dashboard**
- [ ] Daily content queue UI
- [ ] Content preview cards
- [ ] Approve/reject buttons
- [ ] Bulk actions

**Day 54-55: Edit Functionality**
- [ ] Text editing for captions
- [ ] Regenerate media option
- [ ] Save edits

**Day 56-57: Notification System**
- [ ] Email notifications (Resend/SendGrid)
- [ ] In-app notifications
- [ ] Push notifications (optional)

**Day 58-60: Scheduling & Posting**
- [ ] Schedule approved content
- [ ] Post at optimal times
- [ ] Posting confirmation

**Deliverable**: Complete approval workflow with notifications

---

## Phase 3: Full Autonomy & Optimization (Weeks 9-12)

### Week 9: Autonomous Posting

**Day 61-63: Posting Agent**
- [ ] Implement posting agent
- [ ] Platform-specific posting logic
- [ ] Error handling and retries
- [ ] Post confirmation tracking

**Day 64-65: Optimal Timing**
- [ ] Analyze best posting times
- [ ] Timezone handling
- [ ] Dynamic scheduling

**Day 66-67: Posting Queue**
- [ ] Queue management
- [ ] Rate limiting per platform
- [ ] Concurrent posting control

**Day 68-70: Monitoring**
- [ ] Post status tracking
- [ ] Failure alerts
- [ ] Manual retry option

**Deliverable**: Autonomous posting after approval

---

### Week 10: Analytics & Performance

**Day 71-73: Metrics Collection**
- [ ] Fetch metrics from each platform
- [ ] Store in analytics tables
- [ ] Click tracking (UTM parameters)
- [ ] Conversion tracking

**Day 74-75: Analytics Dashboard**
- [ ] Performance charts
- [ ] Platform comparison
- [ ] Content performance ranking
- [ ] Date range filtering

**Day 76-77: Reporting Agent**
- [ ] Daily summary generation
- [ ] Weekly reports
- [ ] AI-powered insights
- [ ] Recommendations

**Day 78-80: Export & Sharing**
- [ ] PDF report export
- [ ] CSV data export
- [ ] Share reports via email

**Deliverable**: Comprehensive analytics system

---

### Week 11: Optimization Engine

**Day 81-83: Performance Analysis**
- [ ] Identify top-performing content
- [ ] Analyze patterns
- [ ] A/B test tracking
- [ ] Content scoring

**Day 84-85: Auto-Optimization**
- [ ] Adjust content strategy
- [ ] Format preference learning
- [ ] Timing optimization
- [ ] Hashtag optimization

**Day 86-87: Feedback Loop**
- [ ] Feed performance data to agents
- [ ] Improve prompt engineering
- [ ] Content quality scoring

**Day 88-90: Community Management**
- [ ] Comment monitoring
- [ ] Auto-like positive comments
- [ ] AI reply suggestions
- [ ] Spam detection

**Deliverable**: Self-optimizing system

---

### Week 12: Polish & Launch Prep

**Day 91-93: Landing Page**
- [ ] Design landing page
- [ ] Feature highlights
- [ ] Pricing section
- [ ] Testimonials (beta users)

**Day 94-95: Onboarding Flow**
- [ ] Welcome tutorial
- [ ] Setup wizard
- [ ] Tooltips and guides
- [ ] Help documentation

**Day 96-97: Billing Integration**
- [ ] Stripe setup
- [ ] Subscription plans
- [ ] Usage tracking
- [ ] Invoice generation

**Day 98-100: Testing & Launch**
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Soft launch

**Deliverable**: Production-ready SaaS platform
