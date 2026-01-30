# Deployment Guide - SIP Monorepo

## Overview

This guide covers deploying the Smart Internship Portal (SIP) across multiple platforms:
- **Web App**: Vercel (Next.js)
- **API Service**: Render (NestJS)
- **AI Engine**: Render (FastAPI)

## Prerequisites

1. GitHub repository connected to Vercel and Render
2. Render account with database provisioning enabled
3. Vercel account
4. Environment variables configured on each platform

## Deployment Architecture

```
┌─────────────────┐
│  Vercel         │
│  - web-app      │  → https://your-app.vercel.app
│  (.next build)  │
└────────┬────────┘
         │
         ├── NEXT_PUBLIC_API_URL ──→ API_SERVICE_URL
         │
┌────────┴────────────────────────────────┐
│         Render Services                 │
├─────────────────────────────────────────┤
│  sip-api-service (NestJS)               │
│  ├─ Node 20.x                           │
│  ├─ dist/ built output                  │
│  ├─ Connected to PostgreSQL 16          │
│  └─ Connected to Redis                  │
│                                         │
│  sip-ai-engine (FastAPI)                │
│  ├─ Python 3.12                         │
│  ├─ Uvicorn server                      │
│  └─ Connected to PostgreSQL              │
│                                         │
│  Databases:                             │
│  ├─ PostgreSQL 16 (shared)              │
│  └─ Redis (cache/queue)                 │
└─────────────────────────────────────────┘
```

## Step 1: Prepare Repository

### 1.1 Add Package Manager Declaration

Root `package.json` includes:
```json
{
  "packageManager": "npm@9.9.3"
}
```

### 1.2 Verify Node Versions

- Root & API: `.nvmrc` → `20.11.1`
- `apps/api-service/package.json` → `engines.node: "20.x"`

### 1.3 Fix Python Dependencies

`apps/ai-engine/requirements.txt`:
- Updated `pydantic` to `2.7.0` (Python 3.12 compatible)
- Updated `pydantic-settings` to `2.2.1`
- Added `tiktoken==0.7.0` (pre-built wheel support)
- Python runtime: `3.12.1` in `runtime.txt`

## Step 2: Deploy Web App to Vercel

### 2.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select root directory (automatic detection)

### 2.2 Configure Environment Variables

In Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://sip-api-service.onrender.com/api/v1
```

### 2.3 Build Settings

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build --filter=web-app`
- **Output Directory**: `apps/web-app/.next`
- **Install Command**: `npm install`

**Deploy** - Vercel will auto-build and deploy.

## Step 3: Deploy API Service to Render

### 3.1 Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | sip-api-service |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run prisma:generate && npm run build --filter=api-service` |
| **Start Command** | `cd apps/api-service && node dist/main` |

### 3.2 Add Environment Variables

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<from PostgreSQL>
REDIS_URL=<from Redis>
JWT_SECRET=<your-secret>
CORS_ORIGIN=https://your-app.vercel.app
OPENAI_API_KEY=<your-key>
```

### 3.3 Create PostgreSQL Database

1. Dashboard → "New +" → "PostgreSQL"
2. Name: `sip-postgres`
3. Copy connection string to `DATABASE_URL`
4. After creation, run migrations:
   - SSH into Render service
   - Run: `npm run db:migrate`
   - Run: `npm run db:seed` (optional)

### 3.4 Create Redis Instance

1. Dashboard → "New +" → "Redis"
2. Name: `sip-redis`
3. Copy connection URL to `REDIS_URL`

### 3.5 Deploy

Click "Create Web Service" - deployment starts automatically.

## Step 4: Deploy AI Engine to Render

### 4.1 Create Web Service

1. Dashboard → "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | sip-ai-engine |
| **Runtime** | Python |
| **Build Command** | `pip install -r apps/ai-engine/requirements.txt` |
| **Start Command** | `cd apps/ai-engine && python -m uvicorn main:app --host 0.0.0.0 --port 5000` |

### 4.2 Add Environment Variables

```env
PYTHONUNBUFFERED=true
OPENAI_API_KEY=<your-key>
DATABASE_URL=<from PostgreSQL>
```

### 4.3 Deploy

Click "Create Web Service" - deployment starts.

## Step 5: Verify Deployments

### 5.1 Web App
```bash
curl https://your-app.vercel.app
```

### 5.2 API Service
```bash
curl https://sip-api-service.onrender.com/api/v1/health
```

### 5.3 AI Engine
```bash
curl https://sip-ai-engine.onrender.com/health
```

## Environment Variables Reference

### Vercel (Web App)
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://sip-api-service.onrender.com/api/v1` |

### Render (API Service)
| Variable | Required | Source |
|----------|----------|--------|
| `NODE_ENV` | ✓ | `production` |
| `PORT` | ✓ | `3001` |
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `REDIS_URL` | ✓ | Redis connection string |
| `JWT_SECRET` | ✓ | Generate secure string |
| `CORS_ORIGIN` | ✓ | Vercel app URL |
| `OPENAI_API_KEY` | ✓ | OpenAI dashboard |
| `AWS_ACCESS_KEY_ID` | Optional | For S3 uploads |
| `AWS_SECRET_ACCESS_KEY` | Optional | For S3 uploads |

### Render (AI Engine)
| Variable | Required | Source |
|----------|----------|--------|
| `PYTHONUNBUFFERED` | ✓ | `true` |
| `OPENAI_API_KEY` | ✓ | OpenAI dashboard |
| `DATABASE_URL` | ✓ | PostgreSQL connection string |

## Troubleshooting

### Build Issues

**Error**: `Cannot find module '/opt/render/project/src/apps/api-service/dist/main.js'`
- **Solution**: Ensure build command includes `prisma:generate` and outputs to `dist/`

**Error**: `Failed to build installable wheels for pydantic-core, tiktoken`
- **Solution**: 
  - Use Python 3.12 (not 3.13)
  - Update pydantic to 2.7.0+
  - Add `runtime.txt` with Python version

### Runtime Issues

**Error**: Database connection failed
- Check `DATABASE_URL` format and connectivity
- Ensure PostgreSQL instance is running
- Verify IP whitelist on Render

**Error**: Missing Prisma Client
- Run build command: `npm run prisma:generate`
- Ensure `@prisma/client` is in dependencies

### Performance

**AI Engine timeout on large requests**
- Increase Render instance size
- Set appropriate timeouts in FastAPI
- Use job queue for long operations

## Monitoring

### Logs

**Vercel**: Dashboard → Deployments → Logs
**Render**: Dashboard → Service → Logs

### Health Checks

Configure health endpoints:
- API: `GET /api/v1/health`
- AI: `GET /health`

### Metrics

Monitor on Render dashboard:
- CPU usage
- Memory usage
- Network I/O
- Request latency

## CI/CD Pipeline

Deployments trigger automatically on:
1. Push to `main` branch
2. Pull request (preview deployments on Vercel)

To manually trigger:
- **Vercel**: Dashboard → Deployments → Redeploy
- **Render**: Dashboard → Manual Deploy

## Cost Estimation

| Service | Tier | Cost/Month |
|---------|------|-----------|
| Vercel Web App | Free | $0 |
| Render API | Starter | ~$7 |
| Render AI Engine | Starter | ~$7 |
| PostgreSQL | Starter | ~$7 |
| Redis | Starter | ~$7 |
| **Total** | - | ~$28 |

Upgrade instances as needed for production traffic.

## Next Steps

1. ✅ Update dependencies and configs (done)
2. Deploy web app to Vercel
3. Create databases on Render
4. Deploy API service to Render
5. Deploy AI engine to Render
6. Test end-to-end flows
7. Set up monitoring and alerts
8. Configure CI/CD integrations
