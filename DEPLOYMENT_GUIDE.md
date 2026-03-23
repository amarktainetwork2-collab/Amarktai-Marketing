# 🚀 AmarktAI Marketing - Ubuntu Webdock VPS Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Database Installation](#database-installation)
4. [Redis Installation](#redis-installation)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Nginx Configuration](#nginx-configuration)
8. [SSL/TLS Setup](#ssltls-setup)
9. [Systemd Services](#systemd-services)
10. [Environment Variables](#environment-variables)
11. [Initial Database Setup](#initial-database-setup)
12. [Monitoring & Logging](#monitoring--logging)
13. [Backup Strategy](#backup-strategy)
14. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS
- **RAM**: Minimum 4GB (8GB recommended)
- **CPU**: 2 cores minimum (4 cores recommended)
- **Disk**: 40GB minimum (100GB+ recommended for media storage)
- **Network**: Public IP with ports 80, 443 open

### Domain Setup
- Domain name pointed to your VPS IP
- Subdomain for API (optional): `api.yourdomain.com`
- Main domain for frontend: `yourdomain.com`

### Required Accounts/Keys
- At least one LLM API key (Groq recommended for free tier)
- HuggingFace account (for free image generation)
- Social platform developer accounts (optional initially)

---

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential software-properties-common

# Set timezone
sudo timedatectl set-timezone UTC

# Create deployment user (optional but recommended)
sudo adduser amarktai
sudo usermod -aG sudo amarktai
su - amarktai
```

### 2. Install Node.js (for frontend)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x
npm --version   # Should be v10.x
```

### 3. Install Python (for backend)

```bash
# Install Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Set Python 3.11 as default
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Verify installation
python3 --version  # Should be Python 3.11.x
```

---

## Database Installation

### PostgreSQL 15+ Setup

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc

# Install PostgreSQL 15
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE amarktai_prod;
CREATE USER amarktai WITH ENCRYPTED PASSWORD 'your-secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE amarktai_prod TO amarktai;
ALTER DATABASE amarktai_prod OWNER TO amarktai;

# Exit PostgreSQL shell
\q

# Test connection
psql -h localhost -U amarktai -d amarktai_prod
```

### PostgreSQL Performance Tuning

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/15/main/postgresql.conf

# Recommended settings for 4GB RAM:
# shared_buffers = 1GB
# effective_cache_size = 3GB
# maintenance_work_mem = 256MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
# random_page_cost = 1.1
# effective_io_concurrency = 200
# work_mem = 8MB
# min_wal_size = 1GB
# max_wal_size = 4GB

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Redis Installation

```bash
# Install Redis 7.x
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Recommended changes:
# supervised systemd
# maxmemory 512mb
# maxmemory-policy allkeys-lru
# requirepass your-redis-password-here

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli
# In Redis CLI:
AUTH your-redis-password-here
PING  # Should return PONG
exit
```

---

## Backend Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/amarktai
sudo chown amarktai:amarktai /var/www/amarktai
cd /var/www/amarktai

# Clone repository
git clone https://github.com/amarktainetwork-blip/Amarktai-Marketing.git
cd Amarktai-Marketing
```

### 2. Setup Python Virtual Environment

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### 3. Create Production Environment File

```bash
# Create .env file
nano .env

# Add the following (adjust values):
```

```env
# ============================================
# PRODUCTION CONFIGURATION
# ============================================

APP_NAME="AmarktAI Marketing"
DEBUG=false
FRONTEND_URL="https://yourdomain.com"

# Admin email — always has full unlimited access at no cost
ADMIN_EMAIL="amarktainetwork@gmail.com"

# Database (use production values)
DATABASE_URL="postgresql://amarktai:your-db-password@localhost:5432/amarktai_prod"

# Redis (use production values)
REDIS_URL="redis://:your-redis-password@localhost:6379/0"

# CORS Origins (your production domain)
CORS_ORIGINS="https://yourdomain.com,https://api.yourdomain.com"

# JWT Authentication (app-owned, no external dependency)
# Generate a strong secret with: openssl rand -hex 32
JWT_SECRET="GENERATE_UNIQUE_SECRET_HERE"

# Encryption Key (generate with: openssl rand -base64 32)
ENCRYPTION_KEY="GENERATE_UNIQUE_KEY_HERE"

# ============================================
# LLM API KEYS (At least one required)
# ============================================

# Groq (FREE tier - recommended for free plan)
GROQ_API_KEY="gsk_YOUR_KEY_HERE"

# HuggingFace (FREE - PRIMARY for text + image generation)
HUGGINGFACE_TOKEN="hf_YOUR_TOKEN_HERE"

# Qwen (Alibaba Cloud DashScope) — low-cost, high quality
# Get key at: https://dashscope.aliyun.com/
QWEN_API_KEY="YOUR_QWEN_KEY_HERE"
QWEN_MODEL="Qwen/Qwen2.5-72B-Instruct"

# OpenAI (Optional - for premium users)
OPENAI_API_KEY="sk-YOUR_KEY_HERE"

# ============================================
# MONITORING
# ============================================

SENTRY_DSN="https://YOUR_SENTRY_DSN@sentry.io/PROJECT"

# ============================================
# FEATURE FLAGS
# ============================================

ENABLE_AUTO_POST=false
ENABLE_AUTO_REPLY=false
ENABLE_AB_TESTING=true
ENABLE_VIRAL_PREDICTION=true
ENABLE_COST_TRACKING=true

# ============================================
# RATE LIMITS
# ============================================

MAX_CONTENT_PER_DAY=10
MAX_ENGAGEMENT_REPLIES_PER_DAY=50
MAX_MEDIA_GENERATIONS_PER_DAY=20
```

### 4. Generate Encryption Key

```bash
# Generate a secure encryption key
openssl rand -base64 32

# Copy output to ENCRYPTION_KEY in .env
```

### 5. Run Database Migrations

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Create migrations directory if it doesn't exist
mkdir -p alembic

# Initialize Alembic (if not already done)
alembic init alembic

# Edit alembic.ini to use DATABASE_URL from .env
nano alembic.ini
# Set: sqlalchemy.url = (leave empty, we'll use env var)

# Edit alembic/env.py to load .env
nano alembic/env.py
```

Add to `alembic/env.py`:
```python
from dotenv import load_dotenv
import os

load_dotenv()

config.set_main_option('sqlalchemy.url', os.getenv('DATABASE_URL'))
```

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial production schema"

# Review the migration file
cat alembic/versions/*.py

# Run migration
alembic upgrade head

# Verify tables created
psql -h localhost -U amarktai -d amarktai_prod -c "\dt"
```

### 6. Test Backend

```bash
# Test backend locally
uvicorn app.main:app --host 127.0.0.1 --port 8000

# In another terminal, test API
curl http://localhost:8000/docs
# Should show Swagger UI in browser

# Stop test server (Ctrl+C)
```

---

## Frontend Deployment

### 1. Build Frontend

```bash
cd /var/www/amarktai/Amarktai-Marketing/app

# Install dependencies
npm install

# Create production .env
nano .env.production

# Add:
```

```env
VITE_API_URL=https://api.yourdomain.com
```

```bash
# Build for production
npm run build

# Verify build
ls -la dist/
# Should contain index.html, assets/, etc.
```

### 2. Set Correct Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/amarktai/Amarktai-Marketing/app/dist

# Set permissions
sudo chmod -R 755 /var/www/amarktai/Amarktai-Marketing/app/dist
```

---

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Create Nginx Configuration

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create API config
sudo nano /etc/nginx/sites-available/amarktai-api
```

Add the following:
```nginx
# API Backend Configuration
upstream amarktai_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS (will be uncommented after SSL setup)
    # return 301 https://$host$request_uri;

    # Temporarily allow HTTP for testing
    location / {
        proxy_pass http://amarktai_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for long-running requests
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://amarktai_backend/health;
        access_log off;
    }
}
```

```bash
# Create Frontend config
sudo nano /etc/nginx/sites-available/amarktai-frontend
```

Add the following:
```nginx
# Frontend Configuration
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (will be uncommented after SSL setup)
    # return 301 https://$host$request_uri;

    root /var/www/amarktai/Amarktai-Marketing/app/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 3. Enable Sites

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/amarktai-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/amarktai-frontend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL/TLS Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Certbot will automatically update Nginx config for HTTPS

# Verify auto-renewal
sudo certbot renew --dry-run

# Certificate auto-renewal is set up via cron/systemd timer
```

### Manual SSL Configuration (if needed)

If Certbot doesn't auto-configure, edit Nginx configs:

```bash
sudo nano /etc/nginx/sites-available/amarktai-api
```

Add HTTPS server block:
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}
```

---

## Systemd Services

### 1. Backend API Service

```bash
sudo nano /etc/systemd/system/amarktai-api.service
```

Add:
```ini
[Unit]
Description=AmarktAI Marketing API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=amarktai
WorkingDirectory=/var/www/amarktai/Amarktai-Marketing/backend
Environment="PATH=/var/www/amarktai/Amarktai-Marketing/backend/venv/bin"
ExecStart=/var/www/amarktai/Amarktai-Marketing/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4

Restart=always
RestartSec=10

# Logging
StandardOutput=append:/var/log/amarktai/api.log
StandardError=append:/var/log/amarktai/api-error.log

[Install]
WantedBy=multi-user.target
```

### 2. Celery Worker Service

```bash
sudo nano /etc/systemd/system/amarktai-worker.service
```

Add:
```ini
[Unit]
Description=AmarktAI Marketing Celery Worker
After=network.target redis-server.service

[Service]
Type=simple
User=amarktai
WorkingDirectory=/var/www/amarktai/Amarktai-Marketing/backend
Environment="PATH=/var/www/amarktai/Amarktai-Marketing/backend/venv/bin"
ExecStart=/var/www/amarktai/Amarktai-Marketing/backend/venv/bin/celery -A app.workers.celery_app worker --loglevel=info

Restart=always
RestartSec=10

StandardOutput=append:/var/log/amarktai/worker.log
StandardError=append:/var/log/amarktai/worker-error.log

[Install]
WantedBy=multi-user.target
```

### 3. Celery Beat Service (Scheduler)

```bash
sudo nano /etc/systemd/system/amarktai-beat.service
```

Add:
```ini
[Unit]
Description=AmarktAI Marketing Celery Beat Scheduler
After=network.target redis-server.service

[Service]
Type=simple
User=amarktai
WorkingDirectory=/var/www/amarktai/Amarktai-Marketing/backend
Environment="PATH=/var/www/amarktai/Amarktai-Marketing/backend/venv/bin"
ExecStart=/var/www/amarktai/Amarktai-Marketing/backend/venv/bin/celery -A app.workers.celery_app beat --loglevel=info

Restart=always
RestartSec=10

StandardOutput=append:/var/log/amarktai/beat.log
StandardError=append:/var/log/amarktai/beat-error.log

[Install]
WantedBy=multi-user.target
```

### 4. Create Log Directory

```bash
sudo mkdir -p /var/log/amarktai
sudo chown amarktai:amarktai /var/log/amarktai
```

### 5. Enable and Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services (start on boot)
sudo systemctl enable amarktai-api
sudo systemctl enable amarktai-worker
sudo systemctl enable amarktai-beat

# Start services
sudo systemctl start amarktai-api
sudo systemctl start amarktai-worker
sudo systemctl start amarktai-beat

# Check status
sudo systemctl status amarktai-api
sudo systemctl status amarktai-worker
sudo systemctl status amarktai-beat

# View logs
sudo journalctl -u amarktai-api -f
sudo journalctl -u amarktai-worker -f
sudo journalctl -u amarktai-beat -f
```

---

## Environment Variables

### Critical Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | ✅ Yes | Redis connection | `redis://:password@localhost:6379/0` |
| `JWT_SECRET` | ✅ Yes | JWT signing secret | Generate with openssl |
| `ENCRYPTION_KEY` | ✅ Yes | API key encryption | Generate with openssl |
| `GROQ_API_KEY` | Recommended | Free LLM access | `gsk_...` |
| `HUGGINGFACE_TOKEN` | Recommended | Free image gen | `hf_...` |
| `CORS_ORIGINS` | ✅ Yes | Allowed origins | `https://yourdomain.com` |
| `FRONTEND_URL` | ✅ Yes | Frontend URL | `https://yourdomain.com` |

### Optional but Useful

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Error tracking |
| `OPENAI_API_KEY` | Premium LLM (GPT-4) |
| `LEONARDO_API_KEY` | Premium image generation |
| `YOUTUBE_CLIENT_ID` | YouTube integration |
| `TIKTOK_CLIENT_KEY` | TikTok integration |
| `META_APP_ID` | Instagram/Facebook integration |

---

## Initial Database Setup

### Create Admin User (Optional)

```bash
# Connect to database
psql -h localhost -U amarktai -d amarktai_prod

# Insert admin user (adjust values)
INSERT INTO users (id, email, name, plan, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'admin@yourdomain.com',
    'Admin User',
    'ENTERPRISE',
    true,
    NOW()
);

# Exit
\q
```

### Verify Database

```bash
# Check tables
psql -h localhost -U amarktai -d amarktai_prod -c "\dt"

# Should show tables:
# - users
# - webapps
# - content
# - platform_connections
# - analytics
# - engagement_replies
# - ab_tests
# - viral_scores
# - cost_tracking
# - user_api_keys
# - user_integrations
```

---

## Monitoring & Logging

### 1. Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/amarktai
```

Add:
```
/var/log/amarktai/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 amarktai amarktai
    sharedscripts
    postrotate
        systemctl reload amarktai-api > /dev/null
        systemctl reload amarktai-worker > /dev/null
        systemctl reload amarktai-beat > /dev/null
    endscript
}
```

### 2. Monitor System Resources

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Check system resources
htop

# Check disk usage
df -h

# Check memory
free -h

# Check database size
psql -h localhost -U amarktai -d amarktai_prod -c "SELECT pg_size_pretty(pg_database_size('amarktai_prod'));"
```

### 3. Setup Email Alerts (Optional)

```bash
# Install mailutils
sudo apt install -y mailutils

# Configure for critical errors
# Add to crontab:
crontab -e

# Add line to check for errors and email:
0 * * * * grep -i error /var/log/amarktai/api-error.log | tail -20 | mail -s "AmarktAI API Errors" admin@yourdomain.com
```

---

## Backup Strategy

### 1. Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-amarktai-db.sh
```

Add:
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/amarktai/database"
DB_NAME="amarktai_prod"
DB_USER="amarktai"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate filename with timestamp
FILENAME="amarktai_db_$(date +%Y%m%d_%H%M%S).sql.gz"

# Perform backup
PGPASSWORD=your-db-password pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/$FILENAME

# Delete old backups
find $BACKUP_DIR -name "amarktai_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $FILENAME"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-amarktai-db.sh

# Add to crontab for daily backup at 3 AM
sudo crontab -e

# Add:
0 3 * * * /usr/local/bin/backup-amarktai-db.sh >> /var/log/amarktai/backup.log 2>&1
```

### 2. Media Files Backup (if using local storage)

```bash
# Create media backup script
sudo nano /usr/local/bin/backup-amarktai-media.sh
```

Add:
```bash
#!/bin/bash

MEDIA_DIR="/var/www/amarktai/Amarktai-Marketing/backend/media"
BACKUP_DIR="/var/backups/amarktai/media"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

FILENAME="amarktai_media_$(date +%Y%m%d_%H%M%S).tar.gz"

tar -czf $BACKUP_DIR/$FILENAME $MEDIA_DIR

find $BACKUP_DIR -name "amarktai_media_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Media backup completed: $FILENAME"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-amarktai-media.sh

# Add to weekly crontab (Sunday 4 AM)
sudo crontab -e

# Add:
0 4 * * 0 /usr/local/bin/backup-amarktai-media.sh >> /var/log/amarktai/backup.log 2>&1
```

### 3. Restore from Backup

```bash
# Restore database
gunzip -c /var/backups/amarktai/database/amarktai_db_YYYYMMDD_HHMMSS.sql.gz | \
    psql -h localhost -U amarktai -d amarktai_prod

# Restore media
tar -xzf /var/backups/amarktai/media/amarktai_media_YYYYMMDD_HHMMSS.tar.gz -C /
```

---

## Troubleshooting

### API Not Starting

```bash
# Check logs
sudo journalctl -u amarktai-api -n 100

# Common issues:
# 1. Database connection
psql -h localhost -U amarktai -d amarktai_prod
# Should connect successfully

# 2. Missing environment variables
cd /var/www/amarktai/Amarktai-Marketing/backend
cat .env | grep -E "(DATABASE_URL|REDIS_URL|JWT_SECRET)"

# 3. Port already in use
sudo lsof -i :8000
# Kill process if needed
sudo kill <PID>

# 4. Permission issues
sudo chown -R amarktai:amarktai /var/www/amarktai
```

### Celery Worker Not Starting

```bash
# Check Redis connection
redis-cli
AUTH your-redis-password
PING

# Check worker logs
sudo journalctl -u amarktai-worker -n 100

# Test Celery manually
cd /var/www/amarktai/Amarktai-Marketing/backend
source venv/bin/activate
celery -A app.workers.celery_app worker --loglevel=debug
```

### Frontend Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify build files exist
ls -la /var/www/amarktai/Amarktai-Marketing/app/dist/

# Check permissions
sudo chown -R www-data:www-data /var/www/amarktai/Amarktai-Marketing/app/dist
sudo chmod -R 755 /var/www/amarktai/Amarktai-Marketing/app/dist

# Test Nginx config
sudo nginx -t
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Verify user permissions
sudo -u postgres psql
\du amarktai
\l amarktai_prod

# Test connection
psql -h localhost -U amarktai -d amarktai_prod -c "SELECT 1;"
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Check top processes
htop

# Reduce Uvicorn workers if needed
sudo nano /etc/systemd/system/amarktai-api.service
# Change --workers 4 to --workers 2

sudo systemctl daemon-reload
sudo systemctl restart amarktai-api
```

### Slow Performance

```bash
# Check database performance
psql -h localhost -U amarktai -d amarktai_prod

# Run EXPLAIN ANALYZE on slow queries
EXPLAIN ANALYZE SELECT * FROM content WHERE user_id = 'xxx';

# Add indexes if needed
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_status ON content(status);

# Analyze tables
ANALYZE content;
ANALYZE analytics;
```

---

## Deployment Verification Checklist

### Pre-Deployment

- [ ] Server meets minimum requirements
- [ ] Domain DNS configured correctly
- [ ] Firewall allows ports 80, 443
- [ ] All required API keys obtained
- [ ] Backup strategy in place

### Post-Deployment

- [ ] PostgreSQL running and accessible
- [ ] Redis running and accessible
- [ ] Backend API service running
- [ ] Celery worker running
- [ ] Celery beat running
- [ ] Nginx serving frontend
- [ ] HTTPS certificates installed
- [ ] API responding to requests: `curl https://api.yourdomain.com/health`
- [ ] Frontend loading: `https://yourdomain.com`
- [ ] Database migrations applied
- [ ] Logs being written
- [ ] Log rotation configured
- [ ] Backups scheduled
- [ ] Monitoring alerts configured
- [ ] JWT authentication working (register/login/protected routes)

### Testing

```bash
# Test API health
curl https://api.yourdomain.com/health

# Test API docs
curl https://api.yourdomain.com/docs

# Test frontend
curl https://yourdomain.com

# Test HTTPS redirect
curl -I http://yourdomain.com
# Should return 301 redirect to HTTPS

# Test database
psql -h localhost -U amarktai -d amarktai_prod -c "SELECT COUNT(*) FROM users;"

# Test Redis
redis-cli -a your-redis-password PING

# Test Celery
cd /var/www/amarktai/Amarktai-Marketing/backend
source venv/bin/activate
python -c "from app.workers.celery_app import app; print(app.control.inspect().active())"
```

---

## Maintenance

### Regular Tasks

**Daily**:
- Check service status
- Review error logs
- Monitor disk usage

**Weekly**:
- Review backup success
- Check SSL certificate expiry (auto-renewed, but verify)
- Review performance metrics

**Monthly**:
- Update system packages: `sudo apt update && sudo apt upgrade`
- Review and optimize database
- Clean up old logs
- Review security updates

### Update Deployment

```bash
# Pull latest code
cd /var/www/amarktai/Amarktai-Marketing
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart amarktai-api amarktai-worker amarktai-beat

# Update frontend
cd ../app
npm install
npm run build
sudo systemctl reload nginx
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban (Optional)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create jail for Nginx
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

```bash
# Restart Fail2Ban
sudo systemctl restart fail2ban
```

### 3. Disable Root Login

```bash
sudo nano /etc/ssh/sshd_config

# Set:
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only

sudo systemctl restart sshd
```

---

## Support & Resources

- **Documentation**: https://github.com/amarktainetwork-blip/Amarktai-Marketing
- **Issues**: Report bugs on GitHub Issues
- **Community**: Join Discord/Slack (if available)

---

**Deployment Completed!** 🎉

Your AmarktAI Marketing platform should now be running on your Ubuntu Webdock VPS.

Access your application at: `https://yourdomain.com`

Access API docs at: `https://api.yourdomain.com/docs`
