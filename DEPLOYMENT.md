# Deployment Guide for etcetera.exchange

This guide walks you through deploying the etcetera.exchange project to Railway.

## Prerequisites

1. [Railway account](https://railway.app/)
2. [Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)
3. Bluesky bot account with app password
4. Domain pointing to Railway (for etcetera.exchange)

## Quick Railway Deployment

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
```

### 2. Add PostgreSQL Database

In your Railway dashboard:
1. Click "New Service"
2. Select "Database" → "PostgreSQL"
3. Note the connection details

### 3. Set Environment Variables

In Railway dashboard, go to your web service and add these environment variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/dbname

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Bluesky Bot
BLUESKY_IDENTIFIER=your_bot_account@bsky.social
BLUESKY_PASSWORD=your_app_password_here

# Web App
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=https://etcetera.exchange

# Bluesky OAuth (for web login)
BLUESKY_CLIENT_ID=your_oauth_client_id
BLUESKY_CLIENT_SECRET=your_oauth_client_secret

# Production settings
NODE_ENV=production
PORT=3000
```

### 4. Deploy

```bash
# Connect to Railway
railway link

# Deploy the web app
railway up

# Deploy the bot (if using separate service)
railway service create bot
railway up --service bot
```

## Detailed Setup

### Creating Bluesky Bot Account

1. Create a new Bluesky account for your bot
2. Go to Settings → App Passwords
3. Create a new app password
4. Use the handle and app password in environment variables

### Setting up Bluesky OAuth

1. Register your app with Bluesky's OAuth provider
2. Set redirect URI to `https://etcetera.exchange/api/auth/callback/bluesky`
3. Get client ID and secret

### Database Migration

After deployment, run the database migration:

```bash
# Connect to your Railway project
railway connect

# Run migration
npm run db:migrate
```

### Generating Objects

After the database is set up, generate your object catalog:

```bash
# Generate a test batch (100 objects)
npm run generate:objects

# Or generate the full catalog (10,000+ objects)
npm run generate:batch
```

### Domain Configuration

1. In Railway dashboard, go to Settings → Domains
2. Add your custom domain: `etcetera.exchange`
3. Configure DNS records as shown in Railway

## Service Architecture

### Web Service (packages/web)
- Next.js app with API routes
- Handles user authentication and collection viewing
- Serves the main website

### Bot Service (packages/bot)
- Standalone Node.js process
- Monitors Bluesky for mentions
- Distributes objects and handles gifting

### Database Service
- PostgreSQL database
- Stores objects, users, and transactions
- Shared by both web and bot services

## Monitoring & Logs

### View Logs
```bash
# Web service logs
railway logs --service web

# Bot service logs  
railway logs --service bot

# Database logs
railway logs --service database
```

### Health Checks

The bot includes health monitoring and will automatically restart on failures. Monitor these logs for any issues:

- Database connection errors
- Bluesky API failures
- Gemini API rate limits

## Scaling

### Auto-scaling
Railway automatically scales based on traffic. For the bot service, you typically want exactly 1 replica to avoid duplicate message processing.

### Manual Scaling
```bash
# Scale web service
railway service scale --replicas 2

# Database scaling is automatic
```

## Backup & Recovery

### Database Backups
Railway automatically backs up PostgreSQL databases. You can also manually export:

```bash
# Export database
railway run pg_dump $DATABASE_URL > backup.sql

# Import backup  
railway run psql $DATABASE_URL < backup.sql
```

### Object Images
If using local image storage, consider setting up cloud storage (Cloudinary, S3) for production.

## Troubleshooting

### Common Issues

1. **Bot not responding to mentions**
   - Check Bluesky credentials
   - Verify bot service is running
   - Check logs for API errors

2. **Web app not loading**
   - Verify environment variables
   - Check database connection
   - Review build logs

3. **Database connection issues**
   - Verify DATABASE_URL format
   - Check Railway PostgreSQL service status
   - Ensure database migrations ran

4. **Gemini API errors**
   - Verify API key
   - Check rate limits
   - Monitor API quotas

### Getting Help

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Check Railway status: [status.railway.app](https://status.railway.app)
- Review logs: `railway logs`

## Production Checklist

- [ ] Environment variables set
- [ ] Database migrated
- [ ] Objects generated
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Bot responding to mentions
- [ ] Web login working
- [ ] Monitoring set up

## Cost Optimization

### Railway Pricing
- Starter plan: $5/month for hobby projects
- Pro plan: Usage-based pricing
- Database: $5/month for PostgreSQL

### Tips to Reduce Costs
1. Use Railway's sleep mode for non-production environments
2. Optimize object generation batch sizes
3. Monitor and optimize database queries
4. Use efficient image formats and compression

## Updates & Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Deploy updates
railway up
```

### Database Maintenance
```bash
# Check database size
railway run psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Vacuum database (optimize performance)
railway run psql $DATABASE_URL -c "VACUUM ANALYZE;"
```

### Monitoring Object Generation
Keep an eye on your object catalog size and generation costs:

```bash
# Check object count
railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM objects;"

# Check rarity distribution
railway run psql $DATABASE_URL -c "SELECT rarity, COUNT(*) FROM objects GROUP BY rarity ORDER BY COUNT(*) DESC;"
```