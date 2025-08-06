const Database = require('./index.js');
const RedisManager = require('./redis-setup.js');

/**
 * Scalable database layer combining Redis caching with PostgreSQL persistence
 * Optimized for high-concurrency bot operations and web queries
 */
class ScalableDatabase extends Database {
    
    static async initialize() {
        await RedisManager.connect();
        console.log('🚀 Scalable database layer initialized');
    }

    // Optimized user operations with Redis caching
    static async createOrUpdateUser(blueskyDid, blueskyHandle, displayName = null, avatarUrl = null) {
        // Try cache first for existing users
        const cached = await RedisManager.getCachedUser(blueskyDid);
        if (cached && cached.bluesky_handle === blueskyHandle) {
            return cached;
        }

        // Create/update in PostgreSQL
        const user = await super.createOrUpdateUser(blueskyDid, blueskyHandle, displayName, avatarUrl);
        
        // Cache for 1 hour
        await RedisManager.cacheUser(blueskyDid, user, 3600);
        
        return user;
    }

    static async getUserByDid(blueskyDid) {
        // Check cache first
        const cached = await RedisManager.getCachedUser(blueskyDid);
        if (cached) return cached;

        // Fallback to database
        const user = await super.getUserByDid(blueskyDid);
        if (user) {
            await RedisManager.cacheUser(blueskyDid, user, 3600);
        }
        
        return user;
    }

    // Lightning-fast daily claim checking with Redis
    static async canClaimDaily(userId) {
        const userDid = userId; // Assuming userId is actually the DID
        const hasClaimed = await RedisManager.hasClaimed(userDid);
        
        if (hasClaimed) return false;
        
        // Double-check with database for accuracy
        const dbResult = await super.canClaimDaily(userId);
        
        // If they've claimed according to DB, cache it
        if (!dbResult) {
            await RedisManager.setClaimed(userDid);
        }
        
        return dbResult;
    }

    static async claimDailyObject(userId, objectId) {
        try {
            // Perform the database transaction
            const result = await super.claimDailyObject(userId, objectId);
            
            // Cache the claim status immediately
            await RedisManager.setClaimed(userId);
            
            // Increment stats
            await RedisManager.incrementStat('daily_claims');
            await RedisManager.incrementStat('total_objects_distributed');
            
            // Invalidate user cache to force refresh
            await RedisManager.client.del(`user:${userId}`);
            
            return result;
        } catch (error) {
            console.error('Error in claimDailyObject:', error);
            throw error;
        }
    }

    // Optimized featured objects with aggressive caching
    static async getFeaturedObjects() {
        // Check cache first (5 minute cache)
        const cached = await RedisManager.getFeaturedObjects();
        if (cached) {
            return { rows: cached, fromCache: true };
        }

        // Optimized query for scale - avoid RANDOM() completely
        const query = `
            WITH recent_objects AS (
                SELECT *, 
                       ROW_NUMBER() OVER (PARTITION BY rarity ORDER BY created_at DESC) as rn
                FROM objects 
                WHERE created_at > NOW() - INTERVAL '30 days'
            )
            SELECT * FROM recent_objects 
            WHERE (rarity = 'common' AND rn <= 2)
               OR (rarity = 'uncommon' AND rn <= 2) 
               OR (rarity = 'rare' AND rn <= 1)
               OR (rarity IN ('epic', 'legendary', 'mythic', 'unique') AND rn <= 1)
            ORDER BY 
                CASE rarity 
                    WHEN 'unique' THEN 1
                    WHEN 'mythic' THEN 2  
                    WHEN 'legendary' THEN 3
                    WHEN 'epic' THEN 4
                    WHEN 'rare' THEN 5
                    WHEN 'uncommon' THEN 6
                    ELSE 7
                END,
                created_at DESC
            LIMIT 8
        `;

        const result = await this.webQuery(query);
        
        // Cache for 5 minutes
        if (result.rows.length > 0) {
            await RedisManager.cacheFeaturedObjects(result.rows, 300);
        }
        
        return result;
    }

    // Real-time statistics for monitoring
    static async getRealtimeStats() {
        const redisStats = await RedisManager.getStats();
        
        // Combine with some DB stats
        const dbStats = await this.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM objects) as total_objects,
                (SELECT COUNT(*) FROM user_inventory) as total_inventory_items,
                (SELECT COUNT(*) FROM daily_claims WHERE claim_date = CURRENT_DATE) as today_claims
        `);
        
        return {
            ...redisStats,
            ...dbStats.rows[0],
            cache_hits: redisStats.cache_hits || 0,
            timestamp: new Date().toISOString()
        };
    }

    // Gift operations with optimized caching
    static async giftObject(senderUserId, receiverUserId, objectId, quantity = 1, blueskyPostUri = null, message = null) {
        try {
            const result = await super.giftObject(senderUserId, receiverUserId, objectId, quantity, blueskyPostUri, message);
            
            // Update stats
            await RedisManager.incrementStat('gifts_sent');
            
            // Invalidate relevant user caches
            await Promise.all([
                RedisManager.client.del(`user:${senderUserId}`),
                RedisManager.client.del(`user:${receiverUserId}`)
            ]);
            
            return result;
        } catch (error) {
            console.error('Error in giftObject:', error);
            throw error;
        }
    }

    // Graceful shutdown
    static async close() {
        await Promise.all([
            super.close(),
            RedisManager.close()
        ]);
    }
}

module.exports = ScalableDatabase;
