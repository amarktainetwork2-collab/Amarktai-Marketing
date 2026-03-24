# Pre-Deployment Checklist — AmarktAI Marketing

Complete every item before going live. Items marked ✅ are hard requirements.

---

## Infrastructure

- [ ] Server running Ubuntu 22.04 LTS with 4 GB+ RAM
- [ ] MySQL 8 installed and service running (`sudo systemctl status mysql`)
- [ ] Redis 7 installed and service running (`redis-cli ping` → `PONG`)
- [ ] Nginx installed and enabled

---

## Database

- [ ] MySQL database `amarktai` created with `utf8mb4` charset
- [ ] MySQL user created and granted full privileges on `amarktai` database
- [ ] `DATABASE_URL` set to `mysql+pymysql://user:pass@localhost:3306/amarktai`
- [ ] Alembic migrations applied (`alembic upgrade head` exits with no errors)

---

## Security & Secrets

- [ ] `JWT_SECRET` set to a 64-character hex string (`openssl rand -hex 32`)
- [ ] `ENCRYPTION_KEY` set to a base64 key (`openssl rand -base64 32`)
- [ ] No secrets committed to source control (`.env` is in `.gitignore`)
- [ ] `.env` file has restricted permissions (`chmod 600 .env`)

---

## AI Providers

- [ ] `QWEN_API_KEY` set (DashScope — primary AI provider, required)
- [ ] `HUGGINGFACE_TOKEN` set (fallback AI provider, required)
- [ ] `FIRECRAWL_API_KEY` set (competitor intelligence scraping, recommended)
- [ ] `OPENAI_API_KEY` set if OpenAI enhancement is desired (optional)
- [ ] `GEMINI_API_KEY` set if Gemini enhancement is desired (optional)

---

## Application Configuration

- [ ] `ADMIN_EMAIL` set to the default admin account email
- [ ] `CORS_ORIGINS` set to the production domain (e.g., `https://yourdomain.com`)
- [ ] `REDIS_URL` set to `redis://localhost:6379/0`

---

## Optional Integrations

- [ ] `SENDGRID_API_KEY` — ⬜ Deferred (beta): transactional email not required for beta launch
- [ ] `STRIPE_SECRET_KEY` — ⬜ Deferred (beta): subscription billing not integrated in beta
- [ ] `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `AWS_S3_BUCKET` set (media storage, optional)

---

## Backend Deployment

- [ ] Python virtualenv created and `requirements.txt` installed
- [ ] `amarktai-api` systemd service enabled and running
- [ ] `amarktai-worker` systemd service (Celery worker) enabled and running
- [ ] `amarktai-beat` systemd service (Celery beat) enabled and running
- [ ] Backend health check passes: `curl https://yourdomain.com/api/health`

---

## Frontend Deployment

- [ ] Node 18+ installed
- [ ] `npm run build` completes without errors (output in `app/dist/`)
- [ ] `VITE_API_URL` set correctly (or Nginx proxy handles `/api` routing)
- [ ] Nginx serving `app/dist/` for frontend routes

---

## Nginx & SSL

- [ ] Nginx config passes syntax check (`sudo nginx -t`)
- [ ] Nginx configured to proxy `/api/` to `127.0.0.1:8000`
- [ ] Nginx configured to serve `app/dist/` with SPA fallback (`try_files $uri /index.html`)
- [ ] SSL certificate issued via Certbot (`sudo certbot --nginx ...`)
- [ ] HTTPS redirect active (HTTP → HTTPS)
- [ ] `sudo certbot renew --dry-run` passes

---

## Final Smoke Tests

- [ ] Frontend loads at `https://yourdomain.com`
- [ ] Login page renders and authentication works end-to-end
- [ ] Dashboard loads without console errors
- [ ] At least one AI content generation request completes successfully
- [ ] Scheduled task appears in Celery worker logs

---

> See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on each step.
