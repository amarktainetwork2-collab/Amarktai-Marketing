# Quick Start — AmarktAI Marketing

Get the platform running locally in under 10 minutes.

---

## Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js     | 18+            |
| Python      | 3.11+          |
| MySQL       | 8.0+           |
| Redis       | 7.0+           |

---

## 1. Clone and Configure

```bash
git clone https://github.com/your-org/Amarktai-Marketing.git
cd Amarktai-Marketing
```

---

## 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Create your `.env` file

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database — MySQL only, PyMySQL driver
DATABASE_URL=mysql+pymysql://amarktai_user:yourpassword@localhost:3306/amarktai

# Security
JWT_SECRET=your-long-random-secret-here        # openssl rand -hex 32
ENCRYPTION_KEY=your-base64-key-here            # openssl rand -base64 32

# Cache and task queue
REDIS_URL=redis://localhost:6379/0

# AI Providers (Qwen required, HuggingFace required as fallback)
QWEN_API_KEY=sk-your-dashscope-key
HUGGINGFACE_TOKEN=hf_your-token

# Optional AI providers
OPENAI_API_KEY=                    # leave blank to skip
GEMINI_API_KEY=                    # leave blank to skip

# Scraping (strongly recommended)
FIRECRAWL_API_KEY=fc-your-key

# Admin
ADMIN_EMAIL=admin@yourdomain.com
CORS_ORIGINS=http://localhost:5173
```

### Create the MySQL database

```sql
CREATE DATABASE amarktai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'amarktai_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON amarktai.* TO 'amarktai_user'@'localhost';
FLUSH PRIVILEGES;
```

### Run database migrations

```bash
alembic upgrade head
```

### Start the backend API server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

## 3. Celery Worker

In a separate terminal (with the same virtualenv activated):

```bash
cd backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

To also run the scheduler (beat):

```bash
celery -A app.celery_app beat --loglevel=info
```

---

## 4. Frontend Setup

In a separate terminal:

```bash
cd app
npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

The frontend proxies `/api` requests to the backend. To override, set `VITE_API_URL` in `app/.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 5. Verify Everything Is Running

| Service         | URL / Check                        |
|-----------------|------------------------------------|
| Frontend        | http://localhost:5173              |
| Backend API     | http://localhost:8000/docs         |
| Backend health  | `curl http://localhost:8000/health` |
| Redis           | `redis-cli ping` → `PONG`          |
| MySQL           | `mysql -u amarktai_user -p amarktai` |

---

## Next Steps

- See [FEATURES.md](./FEATURES.md) for a full list of available features
- See [INTEGRATIONS_LIST.md](./INTEGRATIONS_LIST.md) to add optional providers (Stripe, SendGrid, etc.)
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to deploy to your Webdock VPS
