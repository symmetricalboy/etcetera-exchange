const Redis = require('redis');

class RedisManager {
    constructor() {
        this.client = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            retry_strategy: (options) => {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    return new Error('Redis server refused connection');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    return new Error('Retry time exhausted');
                }
                return Math.min(options.attempt * 100, 3000);
            }
        });
        
        this.client.on('error', (err) => console.error('Redis error:', err));
        this.client.on('connect', () => console.log('✅ Redis connected'));
    }

    async connect() {
        await this.client.connect();
    }

    // Cache user data for fast bot responses
    async cacheUser(userDid, userData, ttl = 3600) {
        await this.client.setEx(`user:${userDid}`, ttl, JSON.stringify(userData));
    }

    async getCachedUser(userDid) {
        const cached = await this.client.get(`user:${userDid}`);
        return cached ? JSON.parse(cached) : null;
    }

    // Cache daily claim status
    async setClaimed(userDid, date = new Date().toISOString().split('T')[0]) {
        await this.client.setEx(`claimed:${userDid}:${date}`, 86400, 'true');
    }

    async hasClaimed(userDid, date = new Date().toISOString().split('T')[0]) {
        return await this.client.exists(`claimed:${userDid}:${date}`);
    }

    // Cache featured objects
    async cacheFeaturedObjects(objects, ttl = 300) {
        await this.client.setEx('featured:objects', ttl, JSON.stringify(objects));
    }

    async getFeaturedObjects() {
        const cached = await this.client.get('featured:objects');
        return cached ? JSON.parse(cached) : null;
    }

    // Real-time stats
    async incrementStat(key) {
        return await this.client.incr(`stats:${key}`);
    }

    async getStats() {
        const keys = await this.client.keys('stats:*');
        const stats = {};
        for (const key of keys) {
            const value = await this.client.get(key);
            stats[key.replace('stats:', '')] = parseInt(value);
        }
        return stats;
    }

    async close() {
        await this.client.quit();
    }
}

module.exports = new RedisManager();
