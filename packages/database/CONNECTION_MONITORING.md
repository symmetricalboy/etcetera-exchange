# Database Connection Monitoring Guide

## Connection Pool Setup

We now use **separate connection pools** to prevent bot operations from being blocked by web queries:

- **Bot Pool**: 15 connections (priority for critical operations)
- **Web Pool**: 10 connections (for web interface queries)

## Monitoring Connection Health

### 1. Check Pool Stats (Add to your monitoring)

```javascript
// Add this to your database class for monitoring
static getPoolStats() {
    return {
        bot: {
            totalCount: botPool.totalCount,
            idleCount: botPool.idleCount,
            waitingCount: botPool.waitingCount
        },
        web: {
            totalCount: webPool.totalCount,
            idleCount: webPool.idleCount,
            waitingCount: webPool.waitingCount
        }
    };
}
```

### 2. Database Query to Monitor Active Connections

```sql
-- Run this to see active connections by application
SELECT 
    application_name,
    state,
    COUNT(*) as connection_count
FROM pg_stat_activity 
WHERE datname = current_database()
GROUP BY application_name, state
ORDER BY connection_count DESC;
```

### 3. Signs the Solution is Working

✅ **Good indicators:**
- Bot responses are consistently fast (< 5 seconds)
- Web page loads without timeouts
- No "connection timeout" errors in logs
- Bot pool waiting count stays low

❌ **Warning signs:**
- High waiting counts in pool stats
- Connection timeout errors
- Bot response delays > 10 seconds

## Scaling Options

If you still see issues:

1. **Increase pool sizes** (current: 25 total connections)
2. **Add Redis caching** for frequently accessed data
3. **Consider read replicas** for web queries
4. **Switch to MongoDB** if PostgreSQL becomes too complex

## Environment Variables

Make sure these are set appropriately:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NODE_ENV`: 'production' for SSL connections
