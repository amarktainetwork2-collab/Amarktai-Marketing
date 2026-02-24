# ✅ Go-Live Checklist — Amarktai Marketing

> Everything that was previously incomplete has been fixed.
> This document now serves as the **production deployment checklist**.

---

## 🔐 Security Checklist

- [ ] Generate a strong `ENCRYPTION_KEY`: `openssl rand -base64 32`
- [ ] Set `CLERK_SECRET_KEY` to your **production** Clerk key (`sk_live_...`)
- [ ] Set `CLERK_WEBHOOK_SECRET` from Clerk Dashboard → Webhooks → Signing Secret
- [ ] Set `ADMIN_USER_IDS` to your Clerk user ID(s) for admin panel access
- [ ] Ensure `DEBUG=false` in production `.env`
- [ ] Set `CORS_ORIGINS` to your real domain only (e.g. `https://yourdomain.com`)
- [ ] Rotate all API keys if they were ever committed to git history
- [ ] Set up UFW firewall (ports 22, 80, 443 only)
- [ ] Configure Fail2Ban for brute-force protection

---

## 🔑 Required Environment Variables (Minimum to Go Live)

```
DATABASE_URL=postgresql://amarktai:<password>@localhost:5432/amarktai_prod
REDIS_URL=redis://:<password>@localhost:6379/0
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
ENCRYPTION_KEY=<openssl rand -base64 32>
HUGGINGFACE_TOKEN=hf_...
ADMIN_USER_IDS=<your-clerk-user-id>
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

---

## 🌐 Clerk Dashboard Setup

1. Create a Clerk app at https://clerk.com
2. Go to **API Keys** — copy `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY`
3. Go to **Webhooks** → **Add Endpoint**:
   - URL: `https://yourdomain.com/api/v1/auth/webhook/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy **Signing Secret** → `CLERK_WEBHOOK_SECRET`
4. In **Sessions** → set session token lifetime as desired

---

## 🤗 HuggingFace Setup

1. Create a free account at https://huggingface.co
2. Go to **Settings → Access Tokens** → create a token with **Read** permission
3. Set as `HUGGINGFACE_TOKEN` in `.env`
4. *(Optional)* Upgrade to Pro ($9/month) for higher rate limits

---

## 📱 Social Platform API Keys (add as you need each platform)

| Platform | Developer Portal | Key Variables |
|----------|-----------------|---------------|
| Twitter/X | https://developer.twitter.com | `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`, `TWITTER_BEARER_TOKEN` |
| Facebook/Instagram | https://developers.facebook.com | `META_APP_ID`, `META_APP_SECRET` |
| LinkedIn | https://www.linkedin.com/developers | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` |
| TikTok | https://developers.tiktok.com | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` |
| YouTube | https://console.cloud.google.com | `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` |
| Pinterest | https://developers.pinterest.com | `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET` |
| Reddit | https://www.reddit.com/prefs/apps | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` |
| Bluesky | https://bsky.social (app password) | `BLUESKY_IDENTIFIER`, `BLUESKY_APP_PASSWORD` |
| Telegram | https://t.me/BotFather | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` |
| Snapchat | https://businesshelp.snapchat.com | `SNAPCHAT_CLIENT_ID`, `SNAPCHAT_CLIENT_SECRET` |

---

## 🚀 Pre-Deployment Steps

- [ ] VPS created (Ubuntu 22.04, ≥2GB RAM, ≥40GB disk)
- [ ] Domain DNS A record pointed to VPS IP
- [ ] SSH key-based login configured
- [ ] Docker + Docker Compose installed: `sudo apt install docker.io docker-compose -y`
- [ ] Repo cloned to `/var/www/amarktai`
- [ ] `backend/.env` created from `backend/.env.example` with real values
- [ ] `app/.env.production` created: `VITE_CLERK_PUBLISHABLE_KEY=pk_live_...`

---

## 🐳 Docker Deployment

```bash
cd /var/www/amarktai/Amarktai-Marketing

# Build and start all services
sudo docker-compose up -d --build

# Run database migrations
sudo docker-compose exec backend alembic upgrade head

# Check all services are healthy
sudo docker-compose ps

# View logs
sudo docker-compose logs -f backend
sudo docker-compose logs -f celery_worker
sudo docker-compose logs -f celery_beat
```

---

## 🔒 SSL Setup

```bash
# Run certbot (profile=ssl in docker-compose)
sudo docker-compose --profile ssl run certbot

# Or install certbot directly
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf: uncomment the HTTPS redirect and ssl_certificate lines
# Then reload nginx
sudo docker-compose restart nginx
```

---

## ✅ Post-Deployment Verification

```bash
# API health check
curl https://yourdomain.com/api/v1/health   # → {"status":"healthy"}

# Verify Celery is working
sudo docker-compose exec celery_worker celery -A app.workers.celery_app inspect active

# Verify beat schedule
sudo docker-compose logs celery_beat | grep "beat"

# Test auth webhook
# Create a user via Clerk → should appear in DB automatically

# Test HuggingFace generation (from admin panel)
# Dashboard → Admin → Trigger Manual Generation
```

---

## 📊 Enable Autonomous Posting

Once tested and comfortable with content quality:

1. In Admin Panel: set `ENABLE_AUTO_POST=true`
2. Users go to **Settings** → toggle "Auto-Post" ON
3. Content will be auto-approved and posted without human review
4. OR keep `ENABLE_AUTO_POST=false` and use the approval queue (recommended initially)

---

## 🗄️ Database Tables (created by Alembic migrations)

Migrations live in `backend/alembic/versions/`. Run `alembic upgrade head` to apply all.

| Table | Alembic migration file |
|-------|------------------------|
| users | `0001_initial.py` |
| webapps | `0001_initial.py` |
| platform_connections | `0001_initial.py` |
| content | `0001_initial.py` |
| analytics | `0001_initial.py` |
| engagement_replies | `0001_initial.py` |
| ab_tests | `0001_initial.py` |
| viral_scores | `0001_initial.py` |
| cost_tracking | `0001_initial.py` |
| user_api_keys | `0001_initial.py` |
| user_integrations | `0001_initial.py` |
| content_remixes | `0002_power_tools.py` |
| competitor_profiles | `0002_power_tools.py` |
| feedback_analyses | `0002_power_tools.py` |
| leads | `0003_leads_new_platforms.py` |
| blog_posts | `0004_blog_posts.py` |
| business_groups | `0005_business_groups.py` |

---

## ✅ Previously Fixed Issues (for reference)

| Issue | Fixed in Session | Notes |
|-------|-----------------|-------|
| Hardcoded `user_id="user-1"` in all endpoints | Session 2 | `get_current_user` dependency wired everywhere |
| Insecure `GET /auth/me` endpoint | This session | Removed — use `GET /users/me` |
| Clerk webhook with no signature verification | This session | Svix HMAC verification added |
| Duplicate `get_db` in session.py | This session | Consolidated to `db/base.py` |
| Mock `get_current_user` in integrations.py | Session 3 | Real Clerk auth used |
| Unauthenticated `/api-keys/internal/{user_id}` | Session 3 | Endpoint removed |
| Fernet key initialisation bug | Session 2 | Properly padded 32-byte key |
| `sync_platform_analytics` Celery stub | Session 4 | Real platform API sync |
| `cryptography` 41.0.7 CVEs | Session 4 | Upgraded to 46.0.5 |

---

*Designed and created by Amarktai Network*
