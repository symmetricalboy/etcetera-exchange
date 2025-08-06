const Redis = require('redis');

class RedisManager {
    constructor() {
        this.client = null;
        this.connected = false;
        this.connectionFailed = false;
        
        // Only initialize Redis if we have a REDIS_URL (production) or explicitly enabled
        if (process.env.REDIS_URL) {
            this.initializeClient();
        } else {
            console.log('⚠️ Skipping Redis initialization - no REDIS_URL configured');
        }
    }

    initializeClient() {
        this.client = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            retry_strategy: (options) => {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    this.connectionFailed = true;
                    return new Error('Redis server refused connection');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    this.connectionFailed = true;
                    return new Error('Retry time exhausted');
                }
                return Math.min(options.attempt * 100, 3000);
            }
        });
        
        this.client.on('error', (err) => {
            console.error('Redis error:', err);
            this.connectionFailed = true;
            this.connected = false;
        });
        
        this.client.on('connect', () => {
            console.log('✅ Redis connected');
            this.connected = true;
            this.connectionFailed = false;
        });
    }

    async connect() {
        if (!this.client) {
            console.log('⚠️ Redis not available during build time');
            return;
        }
        
        try {
            await this.client.connect();
            this.connected = true;
        } catch (error) {
            console.error('Failed to connect to Redis:', error.message);
            this.connectionFailed = true;
            this.connected = false;
        }
    }

    isAvailable() {
        return this.connected && !this.connectionFailed;
    }

    // Cache user data for fast bot responses
    async cacheUser(userDid, userData, ttl = 3600) {
        if (!this.isAvailable()) return;
        try {
            await this.client.setEx(`user:${userDid}`, ttl, JSON.stringify(userData));
        } catch (error) {
            console.error('Redis cache error:', error.message);
        }
    }

    async getCachedUser(userDid) {
        if (!this.isAvailable()) return null;
        try {
            const cached = await this.client.get(`user:${userDid}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Redis get error:', error.message);
            return null;
        }
    }

    // Cache daily claim status
    async setClaimed(userDid, date = new Date().toISOString().split('T')[0]) {
        if (!this.isAvailable()) return;
        try {
            await this.client.setEx(`claimed:${userDid}:${date}`, 86400, 'true');
        } catch (error) {
            console.error('Redis setClaimed error:', error.message);
        }
    }

    async hasClaimed(userDid, date = new Date().toISOString().split('T')[0]) {
        if (!this.isAvailable()) return false;
        try {
            return await this.client.exists(`claimed:${userDid}:${date}`);
        } catch (error) {
            console.error('Redis hasClaimed error:', error.message);
            return false;
        }
    }

    // Cache featured objects
    async cacheFeaturedObjects(objects, ttl = 300) {
        if (!this.isAvailable()) return;
        try {
            await this.client.setEx('featured:objects', ttl, JSON.stringify(objects));
        } catch (error) {
            console.error('Redis cacheFeaturedObjects error:', error.message);
        }
    }

    async getFeaturedObjects() {
        if (!this.isAvailable()) return null;
        try {
            const cached = await this.client.get('featured:objects');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Redis getFeaturedObjects error:', error.message);
            return null;
        }
    }

    // Real-time stats
    async incrementStat(key) {
        if (!this.isAvailable()) return 0;
        try {
            return await this.client.incr(`stats:${key}`);
        } catch (error) {
            console.error('Redis incrementStat error:', error.message);
            return 0;
        }
    }

    async getStats() {
        if (!this.isAvailable()) return {};
        try {
            const keys = await this.client.keys('stats:*');
            const stats = {};
            for (const key of keys) {
                const value = await this.client.get(key);
                stats[key.replace('stats:', '')] = parseInt(value);
            }
            return stats;
        } catch (error) {
            console.error('Redis getStats error:', error.message);
            return {};
        }
    }

    async close() {
        if (!this.client) return;
        try {
            await this.client.quit();
        } catch (error) {
            console.error('Redis close error:', error.message);
        }
    }
}

module.exports = new RedisManager();
