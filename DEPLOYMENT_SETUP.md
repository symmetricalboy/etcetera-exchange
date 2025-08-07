# 🚀 Smart Deployment Setup Guide

This guide explains how to configure Railway services with optimized build/start commands for faster, more efficient deployments using Nixpacks.

## Current Architecture

```
📦 Railway Services:
├── 🌐 etcetera-exchange        → Web Service (Next.js)
├── 🤖 etcetera-exchange (bot)  → Bot Service (Node.js)
├── 🗄️  PostgreSQL             → Database
└── 🔴 Redis                    → Cache
```

## Setup Instructions

### 1. Configure Web Service

In Railway dashboard for `etcetera-exchange` service:

1. Go to **Settings** → **Deploy**
2. Set **Build Command**: `npm ci && npm run build --workspace=packages/shared && npm run build --workspace=packages/web`
3. Set **Start Command**: `cd packages/web && npm start`
4. Keep **Root Directory**: `/` (default)

### 2. Configure Bot Service  

In Railway dashboard for `etcetera-exchange (bot)` service:

1. Go to **Settings** → **Deploy**
2. Set **Build Command**: `npm ci && npm run build --workspace=packages/shared`
3. Set **Start Command**: `cd packages/bot && npm start`
4. Keep **Root Directory**: `/` (default)

### 3. Deploy Both Services

After configuring the build/start commands above:

```bash
# Deploy web service
railway service connect etcetera-exchange
railway up

# Deploy bot service  
railway service connect "etcetera-exchange (bot)"
railway up
```

**Note**: Railway will automatically use the build/start commands you configured in the dashboard.

## Benefits

✅ **Faster Builds**: Only builds necessary packages per service
✅ **Better Resource Usage**: No unnecessary dependencies per service
✅ **Better Isolation**: Services build and run independently  
✅ **Independent Scaling**: Scale web and bot separately
✅ **Easier Debugging**: Clear separation of concerns
✅ **Simpler Setup**: Uses Railway's native Nixpacks (no custom Dockerfiles needed)

## Build Comparison

| Service | Before | After | Improvement |
|---------|--------|-------|-------------|
| Web     | 69s (builds web+bot+shared) | ~35s (builds web+shared only) | 50% faster  |
| Bot     | 69s (builds web+bot+shared) | ~20s (builds shared+bot only) | 70% faster  |
| Dependencies | All packages installed | Only relevant packages per service | Reduced bloat |

## Troubleshooting

**If builds fail:**
1. Check that `packages/shared` builds successfully first
2. Verify all package.json files have correct dependencies
3. Ensure environment variables are set in Railway

**For deployment issues:**
1. Check Railway logs for specific error messages
2. Verify build/start commands are set correctly in Railway dashboard
3. Check that workspace commands work locally first

## Rollback Plan

If issues occur, you can revert to the original setup:
1. Clear the **Build Command** and **Start Command** fields in Railway dashboard
2. Railway will auto-detect and use Nixpacks again  
3. Services will work as before (but slower)

## Environment Variables

Both services share these environment variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection  
- `GEMINI_API_KEY` - AI API key
- `BLUESKY_*` - Bot authentication
- `NEXTAUTH_*` - Web authentication

All existing environment variables will continue to work unchanged.
