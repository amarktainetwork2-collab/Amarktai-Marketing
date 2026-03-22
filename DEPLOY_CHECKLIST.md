# AmarktAI Marketing — Deployment & Integration Checklist

> **Target subdomain:** `marketing.amarktai.com`

---

## 1 · Files Changed / Added

| File | What Changed |
|------|--------------|
| `backend/app/core/config.py` | Added `APP_ID`, `APP_SLUG`, `APP_VERSION`, `APP_ENVIRONMENT`, `AMARKTAI_DASHBOARD_URL`, `AMARKTAI_INTEGRATION_TOKEN`, `AMARKTAI_INTEGRATION_ENABLED` |
| `backend/app/main.py` | Periodic heartbeat background task; canonical `/api/amarktai/status` route mount; structured logging |
| `backend/app/api/v1/router.py` | Registered `amarktai_status` router under `/api/v1/amarktai` |
| `backend/app/api/v1/endpoints/amarktai_status.py` | **NEW** — local status endpoint returning app id, version, health, integration state, metric keys |
| `backend/app/services/integration.py` | **NEW** — `send_heartbeat()`, `send_metrics()`, `send_event()` (server-side only, bearer token auth) |
| `backend/.env.example` | Added all integration env vars + `APP_VERSION`, `APP_ENVIRONMENT` |
| `app/.env.example` | Added `VITE_APP_VERSION`, `VITE_APP_ENVIRONMENT` |
| `nginx-subdomain.conf` | **NEW** — production Nginx config for `marketing.amarktai.com` with HTTPS |
| `deploy/deploy.sh` | **NEW** — VPS deploy script (pull → build frontend → install backend → migrate → PM2 restart → Nginx reload) |
| `deploy/ecosystem.config.cjs` | **NEW** — PM2 config for API, Celery worker, Celery Beat |
| `deploy/app-registration.json` | **NEW** — app registration record for AmarktAI Network dashboard |
| `docker-compose.yml` | Added subdomain CORS origin |

---

## 2 · Deployment Structure on VPS

```
/var/www/amarktai-marketing/
├── app/                         # React/Vite source
│   └── dist/                    # Built frontend (served by Nginx)
├── backend/
│   ├── .venv/                   # Python virtual environment
│   ├── .env                     # Production env vars (NOT committed)
│   └── app/                     # FastAPI application
└── deploy/
    ├── deploy.sh
    ├── ecosystem.config.cjs
    └── app-registration.json

/etc/nginx/sites-available/amarktai-marketing   ← nginx-subdomain.conf
/etc/nginx/sites-enabled/amarktai-marketing     ← symlink
/etc/letsencrypt/live/marketing.amarktai.com/  ← SSL certs (certbot)
/var/log/pm2/                    ← PM2 logs
/var/log/nginx/amarktai-marketing.*  ← Nginx logs
```

---

## 3 · Environment Variables Required

### Backend (`backend/.env`)

```env
# ── App identity ──────────────────────────────────────────────────────────────
APP_ID="amarktai-marketing"
APP_SLUG="amarktai-marketing"
APP_NAME="AmarktAI Marketing"
APP_VERSION="1.0.0"
APP_ENVIRONMENT="production"

# ── AmarktAI Network integration ──────────────────────────────────────────────
AMARKTAI_DASHBOARD_URL="https://dashboard.amarktai.com"
AMARKTAI_INTEGRATION_TOKEN="<generated-per-app-token>"   # server-side ONLY
AMARKTAI_INTEGRATION_ENABLED=true

# ── Core ──────────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://amarktai:<pw>@localhost:5432/amarktai"
REDIS_URL="redis://localhost:6379"
CORS_ORIGINS='["https://marketing.amarktai.com"]'
FRONTEND_URL="https://marketing.amarktai.com"

# ... (all other vars from backend/.env.example)
```

### Frontend (`app/.env` or build args)

```env
VITE_API_URL=                        # empty = use Nginx /api proxy
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_APP_NAME=AmarktAI Marketing
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

---

## 4 · Integration Model

```
AmarktAI Marketing VPS                     AmarktAI Network Dashboard
─────────────────────────────────          ──────────────────────────
backend/app/services/integration.py
  │
  ├─ send_heartbeat()  ──── POST /integrations/heartbeat ──────────►  registers liveness
  ├─ send_metrics()   ──── POST /integrations/metrics ─────────────►  stores metrics
  └─ send_event()     ──── POST /integrations/events ──────────────►  logs events

  All calls:
    Authorization: Bearer <AMARKTAI_INTEGRATION_TOKEN>
    X-App-ID: amarktai-marketing

  Token is READ FROM SERVER ENV ONLY — never returned to the frontend.

Heartbeat cadence: every 5 minutes (asyncio background task in FastAPI lifespan)
```

The status endpoint the dashboard polls:
```
GET https://marketing.amarktai.com/api/amarktai/status
→ { app_id, app_name, version, environment, health, integration.enabled,
     integration.last_heartbeat, supported_metric_keys, ... }
```

---

## 5 · How to Register / Generate the App Token in AmarktAI Network

1. Log in to the AmarktAI Network admin panel (`dashboard.amarktai.com`).
2. Navigate to **Apps → Register App → Import JSON**.
3. Upload / paste the contents of `deploy/app-registration.json`.
4. Click **Register App**.
5. Open the newly created app record → click **Generate Token**.
6. Copy the token.
7. On the VPS, open `backend/.env` and set:
   ```
   AMARKTAI_INTEGRATION_TOKEN="<paste token here>"
   AMARKTAI_INTEGRATION_ENABLED=true
   ```
8. Restart the backend: `pm2 reload amarktai-marketing-api`
9. Verify: `curl https://marketing.amarktai.com/api/amarktai/status | jq`

---

## 6 · Exact VPS Deploy Steps

### First-Time Setup (run as root)

```bash
# 1 — System dependencies
apt update && apt install -y git curl nginx certbot python3-certbot-nginx \
    python3.11 python3.11-venv python3-pip postgresql redis-server nodejs npm
npm install -g pm2

# 2 — PostgreSQL
sudo -u postgres psql -c "CREATE USER amarktai WITH PASSWORD 'CHANGEME';"
sudo -u postgres psql -c "CREATE DATABASE amarktai OWNER amarktai;"

# 3 — App directory
mkdir -p /var/www/amarktai-marketing /var/log/pm2
chown -R $USER:$USER /var/www/amarktai-marketing

# 4 — Clone repo
git clone https://github.com/amarktainetwork-blip/Amarktai-Marketing.git \
    /var/www/amarktai-marketing

# 5 — Configure backend env
cd /var/www/amarktai-marketing/backend
cp .env.example .env
nano .env   # fill in DATABASE_URL, CLERK keys, REDIS_URL, AMARKTAI_* etc.

# 6 — Configure frontend env
cd /var/www/amarktai-marketing/app
cp .env.example .env
nano .env   # fill in VITE_CLERK_PUBLISHABLE_KEY

# 7 — Build & install
cd /var/www/amarktai-marketing
bash deploy/deploy.sh

# 8 — Nginx subdomain config
cp nginx-subdomain.conf /etc/nginx/sites-available/amarktai-marketing
ln -s /etc/nginx/sites-available/amarktai-marketing \
      /etc/nginx/sites-enabled/amarktai-marketing

# Add rate limit zone to /etc/nginx/nginx.conf http block:
#   limit_req_zone $binary_remote_addr zone=amarktai_api:10m rate=30r/m;

nginx -t && systemctl reload nginx

# 9 — HTTPS / SSL
certbot --nginx -d marketing.amarktai.com

# 10 — PM2 on boot
pm2 startup   # copy and run the printed command
pm2 save
```

### Subsequent Deploys (run as deploy user)

```bash
cd /var/www/amarktai-marketing
bash deploy/deploy.sh
```

---

## 7 · Nginx / Subdomain Notes

- Config file: `nginx-subdomain.conf` → copy to `/etc/nginx/sites-available/amarktai-marketing`
- The config serves the Vite `dist/` folder **directly from Nginx** (no Node process needed for frontend)
- All `/api/*` requests are proxied to `127.0.0.1:8000` (FastAPI/uvicorn)
- HTTPS is handled by Certbot; HTTP 80 redirects to 443
- Security headers (HSTS, X-Frame-Options, etc.) are included
- Rate limiting zone `amarktai_api` must be declared in the `http {}` block of `/etc/nginx/nginx.conf`

DNS record required:
```
Type  Name                             Value
A     marketing.amarktai.com  <VPS IPv4>
```

---

## 8 · QA Checklist

### Deployment

- [ ] DNS A record pointing `marketing.amarktai.com` → VPS IP
- [ ] `curl http://marketing.amarktai.com` → redirects to HTTPS
- [ ] `curl https://marketing.amarktai.com/health` → `{"status":"healthy"}`
- [ ] `curl https://marketing.amarktai.com/api/v1/health` → `{"status":"healthy","database":"connected",...}`
- [ ] HTTPS certificate valid (no browser warnings)
- [ ] HSTS header present: `curl -I https://marketing.amarktai.com | grep Strict`
- [ ] Frontend loads at `https://marketing.amarktai.com`
- [ ] Login / register flow works
- [ ] API calls from frontend succeed (check browser Network tab)

### Integration Status Endpoint

- [ ] `curl https://marketing.amarktai.com/api/amarktai/status | jq`
  - Returns `app_id: "amarktai-marketing"`
  - Returns `health: "healthy"`
  - Returns `integration.enabled: true` (after token is set)
  - Returns non-null `integration.last_heartbeat` (after first heartbeat fires)
  - Returns `supported_metric_keys` list
  - Does **NOT** contain the integration token

### Integration with AmarktAI Dashboard

- [ ] App registered in AmarktAI Network dashboard
- [ ] Token generated and set in `backend/.env`
- [ ] `AMARKTAI_INTEGRATION_ENABLED=true` in `backend/.env`
- [ ] After backend restart: heartbeat appears in dashboard within 5 minutes
- [ ] No token in any log output (`grep AMARKTAI_INTEGRATION_TOKEN /var/log/pm2/*.log` returns empty)

### Security

- [ ] `AMARKTAI_INTEGRATION_TOKEN` not in any frontend response
- [ ] `AMARKTAI_INTEGRATION_TOKEN` not in any API response
- [ ] Backend `.env` not accessible via web (`curl https://.../backend/.env` → 404)
- [ ] Rate limiting active (`ab -n 100 -c 10 https://.../api/v1/health` → 429 after burst)
- [ ] Nginx `X-Content-Type-Options: nosniff` header present
