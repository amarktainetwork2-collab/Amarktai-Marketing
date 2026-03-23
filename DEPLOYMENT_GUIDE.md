# Deployment Guide — AmarktAI Marketing

Deploy to a **Webdock VPS** running Ubuntu 22.04 LTS.

---

## Server Requirements

| Resource | Minimum     | Recommended |
|----------|-------------|-------------|
| OS       | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| RAM      | 4 GB        | 8 GB        |
| CPU      | 2 vCPU      | 4 vCPU      |
| Storage  | 40 GB SSD   | 80 GB SSD   |
| Ports    | 22, 80, 443 | 22, 80, 443 |

---

## 1. Initial Server Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential software-properties-common
```

---

## 2. MySQL 8 Setup

### Install MySQL

```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

### Create database and user

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE amarktai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'amarktai_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON amarktai.* TO 'amarktai_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Verify connection

```bash
mysql -u amarktai_user -p amarktai -e "SELECT 1;"
```

---

## 3. Redis Setup

```bash
sudo apt install -y redis-server
sudo systemctl enable --now redis-server

# Verify
redis-cli ping   # should return PONG
```

---

## 4. Python and Backend Setup

### Install Python 3.11

```bash
sudo apt install -y python3.11 python3.11-venv python3.11-dev
```

### Clone repository and create virtualenv

```bash
cd /var/www
sudo git clone https://github.com/your-org/Amarktai-Marketing.git amarktai
sudo chown -R $USER:$USER /var/www/amarktai
cd /var/www/amarktai/backend

python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Configure environment

```bash
cp .env.example .env
nano .env
```

Required values in `.env`:

```env
DATABASE_URL=mysql+pymysql://amarktai_user:your_strong_password@localhost:3306/amarktai
JWT_SECRET=<output of: openssl rand -hex 32>
ENCRYPTION_KEY=<output of: openssl rand -base64 32>
REDIS_URL=redis://localhost:6379/0
QWEN_API_KEY=sk-your-dashscope-key
HUGGINGFACE_TOKEN=hf_your-token
ADMIN_EMAIL=admin@yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

### Run Alembic migrations

```bash
cd /var/www/amarktai/backend
source venv/bin/activate
alembic upgrade head
```

---

## 5. Backend — Gunicorn + Uvicorn Workers

### Install Gunicorn

```bash
pip install gunicorn
```

### Create systemd service

```bash
sudo nano /etc/systemd/system/amarktai-api.service
```

```ini
[Unit]
Description=AmarktAI Marketing API
After=network.target mysql.service redis.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/amarktai/backend
EnvironmentFile=/var/www/amarktai/backend/.env
ExecStart=/var/www/amarktai/backend/venv/bin/gunicorn \
    app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/amarktai/api-access.log \
    --error-logfile /var/log/amarktai/api-error.log
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /var/log/amarktai
sudo chown www-data:www-data /var/log/amarktai
sudo systemctl daemon-reload
sudo systemctl enable --now amarktai-api
sudo systemctl status amarktai-api
```

---

## 6. Celery Worker — Systemd Service

### Worker service

```bash
sudo nano /etc/systemd/system/amarktai-worker.service
```

```ini
[Unit]
Description=AmarktAI Celery Worker
After=network.target redis.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/amarktai/backend
EnvironmentFile=/var/www/amarktai/backend/.env
ExecStart=/var/www/amarktai/backend/venv/bin/celery \
    -A app.celery_app worker \
    --loglevel=info \
    --logfile=/var/log/amarktai/celery-worker.log \
    --concurrency=4
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Beat scheduler service

```bash
sudo nano /etc/systemd/system/amarktai-beat.service
```

```ini
[Unit]
Description=AmarktAI Celery Beat Scheduler
After=network.target redis.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/amarktai/backend
EnvironmentFile=/var/www/amarktai/backend/.env
ExecStart=/var/www/amarktai/backend/venv/bin/celery \
    -A app.celery_app beat \
    --loglevel=info \
    --logfile=/var/log/amarktai/celery-beat.log
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now amarktai-worker amarktai-beat
```

---

## 7. Frontend Build

### Install Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Build the frontend

```bash
cd /var/www/amarktai/app
npm install
npm run build       # output in dist/
```

---

## 8. Nginx Configuration

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### Site configuration

```bash
sudo nano /etc/nginx/sites-available/amarktai
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend — serve built React app
    root /var/www/amarktai/app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API — proxy to Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # WebSocket support (if used)
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/amarktai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl reload nginx
```

Certbot automatically renews certificates via a systemd timer. Verify:

```bash
sudo certbot renew --dry-run
```

---

## 10. Post-Deployment Verification

```bash
# Services running
sudo systemctl status amarktai-api amarktai-worker amarktai-beat nginx mysql redis-server

# API health check
curl https://yourdomain.com/api/health

# Logs
sudo journalctl -u amarktai-api -f
tail -f /var/log/amarktai/celery-worker.log
```

---

## Environment Variable Checklist

| Variable            | Value Format                                              |
|---------------------|-----------------------------------------------------------|
| `DATABASE_URL`      | `mysql+pymysql://user:pass@localhost:3306/amarktai`       |
| `JWT_SECRET`        | 64-char hex string (`openssl rand -hex 32`)               |
| `ENCRYPTION_KEY`    | Base64 string (`openssl rand -base64 32`)                 |
| `REDIS_URL`         | `redis://localhost:6379/0`                                |
| `QWEN_API_KEY`      | DashScope key starting with `sk-`                         |
| `HUGGINGFACE_TOKEN` | HuggingFace token starting with `hf_`                     |
| `ADMIN_EMAIL`       | Valid email address                                       |
| `CORS_ORIGINS`      | `https://yourdomain.com` (no trailing slash)              |

> ⚠️ **DATABASE_URL must use `mysql+pymysql://`**. PostgreSQL is not supported.

---

## Updating the Application

```bash
cd /var/www/amarktai
git pull origin main

# Backend
cd backend && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart amarktai-api amarktai-worker amarktai-beat

# Frontend
cd ../app && npm install && npm run build
sudo systemctl reload nginx
```
