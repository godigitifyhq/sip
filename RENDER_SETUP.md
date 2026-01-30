# Render Dashboard Configuration Guide

## API Service Manual Setup (If render.yaml doesn't work)

If Render isn't automatically picking up `render.yaml`, manually configure via the dashboard:

### Create Web Service

1. **Dashboard** → **New +** → **Web Service**
2. **Connect Repository**: Select `godigitifyhq/sip`
3. **Configure Service**:

| Field | Value |
|-------|-------|
| **Name** | `sip-api-service` |
| **Environment** | `Node` |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run prisma:generate && npm run build --filter=api-service` |
| **Start Command** | `bash apps/api-service/start.sh` |
| **Plan** | `Starter` ($7/month) |

### Environment Variables

Click **Environment** and add:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-32-char-secret>
CORS_ORIGIN=https://<your-vercel-domain>
OPENAI_API_KEY=<from-openai-dashboard>
AWS_ACCESS_KEY_ID=<optional>
AWS_SECRET_ACCESS_KEY=<optional>
```

**Database URLs** (add after creating databases):
```
DATABASE_URL=postgresql://user:pass@host:5432/sip
REDIS_URL=redis://:password@host:port
```

### Deploy

Click **Create Web Service** → Wait for build to complete

---

## Database Setup

### PostgreSQL

1. **Dashboard** → **New +** → **PostgreSQL**
2. Configure:
   - **Name**: `sip-postgres`
   - **Database**: `sip`
   - **User**: `sip_user` (auto-generated)
   - **Plan**: `Starter` ($7/month)

3. **After creation**:
   - Copy **Internal Database URL** to API service `DATABASE_URL`
   - SSH into API service:
     ```bash
     ssh <render-service-url>
     cd /opt/render/project/repo
     npm run db:migrate
     npm run db:seed  # optional
     ```

### Redis

1. **Dashboard** → **New +** → **Redis**
2. Configure:
   - **Name**: `sip-redis`
   - **Plan**: `Starter` ($7/month)

3. **After creation**:
   - Copy **Internal Redis URL** to API service `REDIS_URL`

---

## AI Engine Manual Setup

1. **Dashboard** → **New +** → **Web Service**
2. **Configure Service**:

| Field | Value |
|-------|-------|
| **Name** | `sip-ai-engine` |
| **Environment** | `Python 3.12` |
| **Branch** | `main` |
| **Build Command** | `pip install -r apps/ai-engine/requirements.txt` |
| **Start Command** | `cd apps/ai-engine && python -m uvicorn main:app --host 0.0.0.0 --port 5000` |

### Environment Variables

```
PYTHONUNBUFFERED=true
OPENAI_API_KEY=<from-openai-dashboard>
DATABASE_URL=<from-postgresql>
```

---

## Verify Deployments

### API Service Logs

Dashboard → `sip-api-service` → **Logs** tab

Look for:
```
✓ Connected to database
✓ Connected to Redis
✓ Server listening on port 3001
```

### Test Endpoints

```bash
# Health check
curl https://sip-api-service.onrender.com/api/v1/health

# Database connection
curl https://sip-api-service.onrender.com/api/v1/users
```

### AI Engine Logs

Dashboard → `sip-ai-engine` → **Logs** tab

Look for:
```
INFO:     Uvicorn running on http://0.0.0.0:5000
```

---

## Common Issues & Fixes

### Issue: Start Command Not Found

**Error**: `Cannot find module 'dist/main.js'`

**Solution**:
1. Verify build command output: Check **Logs** → **Build**
2. Ensure `dist/` folder exists after build
3. Use absolute path: `bash apps/api-service/start.sh`

### Issue: Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
1. Add to build command: `npm run prisma:generate`
2. Verify `@prisma/client` in `package.json` dependencies

### Issue: Database Connection Timeout

**Error**: `connect ETIMEDOUT`

**Solution**:
1. Verify `DATABASE_URL` format
2. Check PostgreSQL instance is running
3. Ensure services are linked (Dashboard → Service → Environments)

### Issue: Port Already in Use

**Error**: `Error: listen EADDRINUSE :::3001`

**Solution**:
1. Ensure `PORT` env var is set to `3001`
2. Check only one instance is running

---

## Scaling & Monitoring

### Upgrade Instance Size

1. Service → **Instance Type**
2. Select higher tier (Pro/Business)
3. Apply changes (auto-deploys)

### Monitor Metrics

Dashboard → Service → **Metrics** tab:
- CPU usage
- Memory usage
- Network I/O
- Request latency

### Set Up Alerts

Dashboard → Service → **Settings** → **Notifications**:
- Failed deploys
- CPU > 80%
- Memory > 80%

---

## Environment Variables Cheat Sheet

**Required**:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<32-char-random>
CORS_ORIGIN=https://your-vercel-domain
OPENAI_API_KEY=sk-...
```

**Optional**:
```bash
AWS_ACCESS_KEY_ID=<for-s3>
AWS_SECRET_ACCESS_KEY=<for-s3>
LOG_LEVEL=debug
```

---

## Troubleshooting Checklist

- [ ] Build command includes `prisma:generate`
- [ ] Start command points to correct `dist/` location
- [ ] All environment variables are set
- [ ] Database is created and URL is correct
- [ ] Redis is created and URL is correct
- [ ] Services are linked in environment variables
- [ ] Port is set to 3001 (not default 8080)
- [ ] Node version is 20.x
- [ ] Python version is 3.12 (for AI engine)

---

## Next Steps

1. Create PostgreSQL instance
2. Create Redis instance
3. Set up API service with all env vars
4. Run migrations: `npm run db:migrate`
5. Test health endpoint
6. Deploy AI engine
7. Configure CI/CD on GitHub
