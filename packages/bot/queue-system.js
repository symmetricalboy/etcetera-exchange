const Queue = require('bull');
const Redis = require('redis');

class BotQueue {
    constructor() {
        // Use Redis for queue backing store
        this.mentionQueue = new Queue('mention processing', {
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD
            },
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                }
            }
        });

        this.setupProcessors();
    }

    setupProcessors() {
        // Process up to 5 mentions concurrently
        this.mentionQueue.process('mention', 5, async (job) => {
            const { mentionData, priority } = job.data;
            
            try {
                // Import here to avoid circular dependencies
                const { EtceteraBot } = require('./index.js');
                const bot = new EtceteraBot();
                
                await bot.handleMention(mentionData);
                
                return { success: true, processedAt: new Date() };
            } catch (error) {
                console.error(`Failed to process mention job ${job.id}:`, error);
                throw error;
            }
        });

        // Monitor queue health
        this.mentionQueue.on('completed', (job, result) => {
            console.log(`✅ Processed mention job ${job.id}`);
        });

        this.mentionQueue.on('failed', (job, err) => {
            console.error(`❌ Mention job ${job.id} failed:`, err.message);
        });

        this.mentionQueue.on('stalled', (job) => {
            console.warn(`⚠️ Mention job ${job.id} stalled`);
        });
    }

    // Add mention to queue with priority
    async queueMention(mentionData, priority = 'normal') {
        const priorityValue = {
            high: 1,      // Daily claims, gifts
            normal: 5,    // Regular mentions  
            low: 10       // Help requests, info
        }[priority] || 5;

        return await this.mentionQueue.add('mention', {
            mentionData,
            priority
        }, {
            priority: priorityValue,
            delay: priority === 'low' ? 5000 : 0 // Delay low priority by 5s
        });
    }

    // Get queue statistics
    async getQueueStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.mentionQueue.getWaiting(),
            this.mentionQueue.getActive(), 
            this.mentionQueue.getCompleted(),
            this.mentionQueue.getFailed(),
            this.mentionQueue.getDelayed()
        ]);

        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            delayed: delayed.length,
            total: waiting.length + active.length + delayed.length
        };
    }

    // Graceful shutdown
    async close() {
        await this.mentionQueue.close();
    }

    // Priority detection based on message content
    detectPriority(mentionText) {
        const highPriorityKeywords = ['daily', 'claim', 'gift', 'give', 'send'];
        const lowPriorityKeywords = ['help', 'what', 'how', 'info'];
        
        const text = mentionText.toLowerCase();
        
        if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
            return 'high';
        }
        
        if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
            return 'low';
        }
        
        return 'normal';
    }
}

module.exports = BotQueue;
