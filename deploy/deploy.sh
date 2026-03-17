#!/usr/bin/env bash
# ============================================================
# deploy.sh  — Amarktai Marketing VPS deploy script
#
# Target:  amarktai-marketing.amarktai.com
# Server:  Ubuntu 22.04+ VPS (any provider)
#
# Usage (run as the deploy user, not root):
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
#
# First-time setup prerequisites (run once as root):
#   apt update && apt install -y git curl nginx certbot python3-certbot-nginx \
#       python3.11 python3.11-venv python3-pip postgresql redis-server nodejs npm
#   npm install -g pm2
# ============================================================

set -euo pipefail

APP_NAME="amarktai-marketing"
APP_DIR="/var/www/${APP_NAME}"
REPO_URL="${REPO_URL:-https://github.com/amarktainetwork-blip/Amarktai-Marketing.git}"
BRANCH="${BRANCH:-main}"
DOMAIN="amarktai-marketing.amarktai.com"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

# ── 1. Pull latest code ────────────────────────────────────────────────────────
log "Pulling latest code from ${BRANCH}…"
if [ -d "${APP_DIR}/.git" ]; then
    git -C "${APP_DIR}" fetch origin
    git -C "${APP_DIR}" checkout "${BRANCH}"
    git -C "${APP_DIR}" pull origin "${BRANCH}"
else
    git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"

# ── 2. Build frontend ──────────────────────────────────────────────────────────
log "Installing frontend dependencies…"
cd app
npm ci --silent

log "Building frontend…"
# Copy .env if present; otherwise build will use defaults
[ -f .env ] || cp .env.example .env
npm run build

log "Deploying frontend dist to /var/www/${APP_NAME}/dist…"
rsync -a --delete dist/ "/var/www/${APP_NAME}/dist/"
cd ..

# ── 3. Set up Python venv & install backend deps ──────────────────────────────
log "Setting up Python virtual environment…"
cd backend
python3.11 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# ── 4. Run database migrations ────────────────────────────────────────────────
log "Running database migrations…"
[ -f .env ] || { log "ERROR: backend/.env not found — copy .env.example and fill in values"; exit 1; }
alembic upgrade head

# ── 5. Restart backend with PM2 ───────────────────────────────────────────────
cd "${APP_DIR}"
log "Restarting backend with PM2…"
if pm2 describe "${APP_NAME}-api" > /dev/null 2>&1; then
    pm2 reload "${APP_NAME}-api"
else
    pm2 start deploy/ecosystem.config.cjs --only "${APP_NAME}-api"
fi

# ── 6. Reload Nginx ───────────────────────────────────────────────────────────
log "Reloading Nginx…"
if [ -f /etc/nginx/sites-available/${APP_NAME} ]; then
    sudo nginx -t && sudo systemctl reload nginx
else
    log "Nginx config not linked — run the first-time setup steps in DEPLOY_CHECKLIST.md"
fi

log "✅ Deploy complete → https://${DOMAIN}"
