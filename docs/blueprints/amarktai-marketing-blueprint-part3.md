---

# 6. Security & Rate Limiting Best Practices

## 6.1 API Security

```python
# services/api/app/core/security.py

from fastapi import HTTPException
from fastapi.security import HTTPBearer
from passlib.context import CryptContext
from datetime import datetime
import hashlib
from typing import Optional
import re
from html import escape

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security headers middleware
class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            async def send_with_headers(message):
                if message["type"] == "http.response.start":
                    headers = message.get("headers", [])
                    headers.extend([
                        (b"X-Content-Type-Options", b"nosniff"),
                        (b"X-Frame-Options", b"DENY"),
                        (b"X-XSS-Protection", b"1; mode=block"),
                        (b"Strict-Transport-Security", b"max-age=31536000; includeSubDomains"),
                        (b"Content-Security-Policy", b"default-src 'self'"),
                        (b"Referrer-Policy", b"strict-origin-when-cross-origin"),
                    ])
                    message["headers"] = headers
                await send(message)
            await self.app(scope, receive, send_with_headers)
        else:
            await self.app(scope, receive, send)

# Rate limiting
class RateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_limit = 100
        self.default_window = 3600
    
    async def check_limit(self, key_prefix: str, identifier: str, limit: int = None, window: int = None):
        limit = limit or self.default_limit
        window = window or self.default_window
        key = f"rate_limit:{key_prefix}:{identifier}"
        
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, window)
        
        if current > limit:
            raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Try again in {window} seconds.")
        
        return True

# OAuth token encryption
from cryptography.fernet import Fernet
import base64

class TokenEncryption:
    def __init__(self, master_key: str):
        self.cipher = Fernet(self._derive_key(master_key))
    
    def _derive_key(self, master_key: str) -> bytes:
        key_hash = hashlib.sha256(master_key.encode()).digest()
        return base64.urlsafe_b64encode(key_hash)
    
    def encrypt(self, token: str) -> str:
        return self.cipher.encrypt(token.encode()).decode()
    
    def decrypt(self, encrypted_token: str) -> str:
        return self.cipher.decrypt(encrypted_token.encode()).decode()

# Input validation
class InputValidator:
    @staticmethod
    def sanitize_html(text: str) -> str:
        text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', text, flags=re.IGNORECASE)
        return escape(text)
    
    @staticmethod
    def validate_url(url: str) -> bool:
        pattern = re.compile(r'^https?://(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:/?|[/?]\S+)$', re.IGNORECASE)
        return bool(pattern.match(url))

# Platform API rate limiting
class PlatformRateLimiter:
    LIMITS = {
        "youtube": {"daily_quota": 10000, "upload_per_day": 100},
        "tiktok": {"posts_per_day": 50, "api_calls_per_minute": 60},
        "instagram": {"posts_per_day": 25, "api_calls_per_hour": 200},
        "twitter": {"posts_per_day": 50, "api_calls_per_15min": 25},
        "linkedin": {"posts_per_day": 50, "api_calls_per_day": 500}
    }
    
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def check_limit(self, platform: str, user_id: str, action: str) -> bool:
        key = f"platform_limit:{platform}:{user_id}:{action}:{datetime.now().strftime('%Y%m%d')}"
        limit = self.LIMITS.get(platform, {}).get(action)
        if not limit:
            return True
        
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, 86400)
        
        return current <= limit
```

## 6.2 Database Security (Supabase RLS)

```sql
-- migrations/001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webapps ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can only view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can only update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Webapps table policies
CREATE POLICY "Users can view their own webapps"
    ON webapps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webapps"
    ON webapps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webapps"
    ON webapps FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webapps"
    ON webapps FOR DELETE
    USING (auth.uid() = user_id);

-- Content queue policies
CREATE POLICY "Users can view their own content"
    ON content_queue FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert content for users"
    ON content_queue FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own content status"
    ON content_queue FOR UPDATE
    USING (auth.uid() = user_id);

-- Platform connections policies
CREATE POLICY "Users can view their own connections"
    ON platform_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own connections"
    ON platform_connections FOR ALL
    USING (auth.uid() = user_id);

-- Analytics policies (read-only for users)
CREATE POLICY "Users can view their own analytics"
    ON analytics FOR SELECT
    USING (auth.uid() = user_id);

-- Token encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION encrypt_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_encrypt(token, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_token::bytea, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER webapps_audit
    AFTER INSERT OR UPDATE OR DELETE ON webapps
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER content_queue_audit
    AFTER INSERT OR UPDATE OR DELETE ON content_queue
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

# 7. Monetization Strategy

## 7.1 Pricing Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AMARKTAI MARKETING PRICING                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐
│     FREE        │  │      PRO        │  │   BUSINESS      │  │  ENTERPRISE │
│    $0/month     │  │   $29/month     │  │   $99/month     │  │   Custom    │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘

  ✓ 1 Web App         ✓ 5 Web Apps        ✓ Unlimited         ✓ Unlimited
  ✓ 3 Platforms       ✓ 6 Platforms       ✓ 6 Platforms       ✓ 6 Platforms
  ✓ 3 posts/day       ✓ 12 posts/day      ✓ 36 posts/day      ✓ Unlimited
  ✓ Basic AI          ✓ Advanced AI       ✓ Premium AI        ✓ Custom AI
  ✓ Standard support  ✓ Priority support  ✓ Dedicated support ✓ White-label
  ✓ Basic analytics   ✓ Advanced analytics✓ Full analytics    ✓ API access
                      ✓ A/B testing       ✓ Team collaboration✓ SLA guarantee
                      ✓ Auto-optimization ✓ Custom workflows  ✓ Custom dev


FEATURE BREAKDOWN:
──────────────────

WEB APPS:
  Free: 1 web app
  Pro: 5 web apps
  Business: Unlimited
  Enterprise: Unlimited + white-label

PLATFORMS:
  Free: Choose 3 from [YouTube, TikTok, Instagram, Facebook, X, LinkedIn]
  Pro+: All 6 platforms

DAILY POSTS:
  Free: 3 posts/day (90/month)
  Pro: 12 posts/day (360/month)
  Business: 36 posts/day (1080/month)
  Enterprise: Unlimited

AI CAPABILITIES:
  Free: Groq + basic prompts
  Pro: Grok/Claude + advanced prompts
  Business: GPT-4o + custom fine-tuning
  Enterprise: Custom models

MEDIA GENERATION:
  Free: 30 images/month, 5 videos/month
  Pro: 150 images/month, 30 videos/month
  Business: 500 images/month, 100 videos/month
  Enterprise: Unlimited

SUPPORT:
  Free: Community + email (48h response)
  Pro: Priority email (24h response)
  Business: Dedicated chat (4h response)
  Enterprise: Phone + dedicated account manager

ADDITIONAL FEATURES:
  Pro: A/B testing, auto-optimization, hashtag research
  Business: Team seats (5), approval workflows, custom branding
  Enterprise: SLA, API access, custom integrations, on-premise option
```

## 7.2 Revenue Projections

```
YEAR 1 PROJECTIONS:
───────────────────

Month 1-3 (MVP Launch):
  Free users: 500
  Pro users: 20
  Revenue: $580/month

Month 4-6 (Growth):
  Free users: 2,000
  Pro users: 100
  Business users: 10
  Revenue: $3,890/month

Month 7-9 (Scale):
  Free users: 5,000
  Pro users: 300
  Business users: 30
  Revenue: $11,670/month

Month 10-12 (Mature):
  Free users: 10,000
  Pro users: 600
  Business users: 60
  Revenue: $23,340/month

Year 1 Total: ~$234,000

COST STRUCTURE (at 600 Pro, 60 Business):
─────────────────────────────────────────
Infrastructure:
  - Vercel Pro: $20/month
  - Render/Fly.io: $100/month
  - Supabase Pro: $25/month
  - Upstash Redis: $20/month
  - Total: $165/month

API Costs (per 1000 posts):
  - LLM (Grok/Claude): $50
  - Media generation: $200
  - Platform APIs: $10
  - Total per 1000 posts: $260

At 23,340 posts/month: ~$6,068

Total Monthly Costs: ~$6,233
Monthly Profit: ~$17,107
Profit Margin: ~73%
```

---

# 8. Deployment Architecture

## 8.1 Docker Compose (Development)

```yaml
# infrastructure/docker/docker-compose.yml

version: '3.8'

services:
  web:
    build:
      context: ../../apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ../../apps/web:/app
      - /app/node_modules
    depends_on:
      - api
    networks:
      - amarktai-network

  api:
    build:
      context: ../../services/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/amarktai
      - REDIS_URL=redis://redis:6379
    volumes:
      - ../../services/api:/app
    depends_on:
      - db
      - redis
    networks:
      - amarktai-network

  agents:
    build:
      context: ../../agents
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/amarktai
      - REDIS_URL=redis://redis:6379
      - GROK_API_KEY=${GROK_API_KEY}
      - LEONARDO_API_KEY=${LEONARDO_API_KEY}
    volumes:
      - ../../agents:/app
    depends_on:
      - db
      - redis
    networks:
      - amarktai-network

  workers:
    build:
      context: ../../workers
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/amarktai
      - REDIS_URL=redis://redis:6379
    volumes:
      - ../../workers:/app
    depends_on:
      - db
      - redis
    networks:
      - amarktai-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=amarktai
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - amarktai-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - amarktai-network

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - amarktai-network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  amarktai-network:
    driver: bridge
```

## 8.2 Kubernetes Deployment (Production)

```yaml
# infrastructure/kubernetes/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: amarktai-web
  namespace: amarktai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: amarktai-web
  template:
    metadata:
      labels:
        app: amarktai-web
    spec:
      containers:
      - name: web
        image: amarktai/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.amarktai.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: amarktai-api
  namespace: amarktai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: amarktai-api
  template:
    metadata:
      labels:
        app: amarktai-api
    spec:
      containers:
      - name: api
        image: amarktai/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: amarktai-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: amarktai-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: amarktai-web-service
  namespace: amarktai
spec:
  selector:
    app: amarktai-web
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: amarktai-api-service
  namespace: amarktai
spec:
  selector:
    app: amarktai-api
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: amarktai-ingress
  namespace: amarktai
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - amarktai.com
    - www.amarktai.com
    - api.amarktai.com
    secretName: amarktai-tls
  rules:
  - host: amarktai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: amarktai-web-service
            port:
              number: 80
  - host: api.amarktai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: amarktai-api-service
            port:
              number: 80
```

---

# 9. Getting Started Checklist

## Pre-Launch Setup

### Week 1: Foundation
- [ ] Create GitHub repository
- [ ] Setup project structure
- [ ] Initialize Next.js frontend
- [ ] Setup FastAPI backend
- [ ] Create Supabase project
- [ ] Setup Clerk authentication
- [ ] Configure environment variables

### Week 2: Core Features
- [ ] Implement user authentication
- [ ] Create database schema
- [ ] Build dashboard layout
- [ ] Implement web app CRUD
- [ ] Setup API endpoints

### Week 3: Platform Integration
- [ ] Register for platform developer accounts:
  - [ ] Google Cloud (YouTube)
  - [ ] Meta for Developers
  - [ ] X Developer Portal
  - [ ] LinkedIn Developers
  - [ ] TikTok for Developers
- [ ] Implement OAuth flows
- [ ] Create connection management UI

### Week 4: AI Integration
- [ ] Setup Grok API access
- [ ] Implement research agent
- [ ] Implement creative agent
- [ ] Test content generation
- [ ] Create approval workflow UI

### Week 5: Media Generation
- [ ] Setup Leonardo.AI account
- [ ] Setup Runway ML account
- [ ] Setup ElevenLabs account
- [ ] Implement media generation
- [ ] Test end-to-end flow

### Week 6: Launch Prep
- [ ] Create landing page
- [ ] Setup Stripe billing
- [ ] Write documentation
- [ ] Create onboarding flow
- [ ] Deploy to production

---

# 10. Conclusion

Amarktai Marketing represents a paradigm shift in social media marketing - from manual, time-consuming content creation to fully autonomous AI-powered promotion. By leveraging modern AI technologies, cost-effective APIs, and intelligent automation, this platform enables web app creators to maintain a consistent, high-quality social media presence with minimal effort.

## Key Success Factors

1. **AI-First Architecture**: Multi-agent system with specialized roles ensures high-quality, platform-optimized content
2. **User Control**: Single daily approval step maintains human oversight while enabling full automation
3. **Cost Efficiency**: Built on free/cheap API tiers with clear upgrade paths
4. **Scalable Infrastructure**: Cloud-native architecture that grows with user base
5. **Performance-Driven**: Self-optimizing system that learns from engagement data

## Next Steps

1. Begin with Phase 1 (Weeks 1-4) to build the MVP
2. Gather beta user feedback during Phase 2
3. Iterate on AI prompts and content quality
4. Scale infrastructure as user base grows
5. Expand to additional platforms and features

---

*This blueprint provides a complete roadmap for building Amarktai Marketing. Adjust timelines and priorities based on team size, budget, and market feedback.*

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Amarktai Network Engineering Team
