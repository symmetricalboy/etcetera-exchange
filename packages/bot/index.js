const { BskyAgent } = require('@atproto/api');
const { GoogleGenAI } = require('@google/genai');
const Database = require('@etcetera/database');
const winston = require('winston');
const cron = require('cron');
require('dotenv').config({ path: '../../.env' });

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'bot-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'bot-combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

class EtceteraBot {
    constructor() {
        this.agent = new BskyAgent({ service: 'https://bsky.social' });
        this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        this.botDid = null;
        this.isRunning = false;
        this.lastCheckTime = new Date();
        this.recentResponses = new Map(); // Track recent responses to prevent loops
        this.cooldownPeriod = 60000; // 1 minute cooldown
        
        // Bot personality and responses
        this.botPersonality = `You are the whimsical etcetera.exchange bot! You distribute magical and mundane objects to Bluesky users. 

Your personality:
- Cheerful and slightly mysterious
- Speaks with gentle enthusiasm
- Uses occasional emojis (but not too many)
- Makes whimsical observations about the objects you give
- Sometimes comments on the strange nature of your existence as an object-distributing entity

Response guidelines:
- Keep responses conversational and warm
- When giving objects, describe them with wonder
- For gifts, acknowledge the generosity of the giver
- If someone can't claim today, be understanding but encouraging
- Always end posts with a subtle invitation to visit etcetera.exchange to see their collection`;
    }

    async initialize() {
        try {
            logger.info('🤖 Initializing Etcetera Bot...');
            
            // Login to Bluesky
            await this.agent.login({
                identifier: process.env.BLUESKY_IDENTIFIER,
                password: process.env.BLUESKY_PASSWORD,
            });
            
            this.botDid = this.agent.session?.did;
            logger.info(`✅ Bot logged in successfully as ${this.botDid}`);
            
            // Set up mention monitoring
            this.startMentionMonitoring();
            
            // Set up daily reset job (runs at midnight UTC)
            this.setupDailyReset();
            
            this.isRunning = true;
            logger.info('🚀 Bot is now running and monitoring mentions!');
            
        } catch (error) {
            logger.error('❌ Failed to initialize bot:', error);
            throw error;
        }
    }

    async startMentionMonitoring() {
        logger.info('👂 Starting mention monitoring...');
        
        // Check for any missed mentions from the last 24 hours on startup
        setTimeout(async () => {
            try {
                await this.checkMissedMentions();
            } catch (error) {
                logger.error('Error checking missed mentions:', error);
            }
        }, 5000); // Wait 5 seconds after startup
        
        // Poll for mentions every 30 seconds
        setInterval(async () => {
            try {
                await this.checkForMentions();
            } catch (error) {
                logger.error('Error checking mentions:', error);
            }
        }, 30000);
        
        // Check for missed mentions every hour
        setInterval(async () => {
            try {
                await this.checkMissedMentions();
            } catch (error) {
                logger.error('Error checking missed mentions:', error);
            }
        }, 3600000); // 1 hour
    }

    async checkMissedMentions() {
        try {
            logger.info('🔍 Checking for missed mentions from the last 24 hours...');
            
            // Get mentions from the last 24 hours
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const response = await this.agent.listNotifications({
                limit: 100,
                cursor: undefined
            });

            const recentMentions = response.data.notifications.filter(notif => {
                return notif.reason === 'mention' && 
                       new Date(notif.indexedAt) > twentyFourHoursAgo &&
                       !this.isReplyToBotPost(notif);
            });

            if (recentMentions.length === 0) {
                logger.info('✅ No recent mentions found');
                return;
            }

            logger.info(`🔍 Found ${recentMentions.length} mentions from last 24 hours, checking which ones need processing...`);

            // Check which mentions we haven't processed yet
            const unprocessedMentions = [];
            for (const mention of recentMentions) {
                const alreadyProcessed = await this.hasProcessedMention(mention.uri);
                if (!alreadyProcessed && !this.isInCooldown(mention.author.did)) {
                    unprocessedMentions.push(mention);
                }
            }

            if (unprocessedMentions.length > 0) {
                logger.info(`📦 Found ${unprocessedMentions.length} unprocessed mentions, handling them now...`);
                
                for (const mention of unprocessedMentions) {
                    try {
                        await this.handleMention(mention);
                        // Small delay between processing to avoid rate limits
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        logger.error(`Error processing missed mention from ${mention.author.handle}:`, error);
                    }
                }
            } else {
                logger.info('✅ All recent mentions have been processed');
            }
            
        } catch (error) {
            logger.error('Error in checkMissedMentions:', error);
        }
    }

    async hasProcessedMention(postUri) {
        try {
            // Check if we have a logged interaction for this post URI
            const query = 'SELECT COUNT(*) FROM bot_interactions WHERE bluesky_post_uri = $1';
            const result = await Database.query(query, [postUri]);
            return parseInt(result.rows[0].count) > 0;
        } catch (error) {
            // If database is down, assume we haven't processed it to be safe
            logger.debug('Could not check if mention was processed (assuming not processed):', error.message);
            return false;
        }
    }

    async checkForMentions() {
        try {
            // Get notifications (mentions, replies, etc.)
            const response = await this.agent.listNotifications({
                limit: 50,
                cursor: undefined
            });

            const newMentions = response.data.notifications.filter(notif => {
                return notif.reason === 'mention' && 
                       new Date(notif.indexedAt) > this.lastCheckTime &&
                       !notif.isRead &&
                       !this.isReplyToBotPost(notif) &&
                       !this.isInCooldown(notif.author.did);
            });

            if (newMentions.length > 0) {
                logger.info(`📬 Found ${newMentions.length} new mentions (after filtering)`);
                
                for (const mention of newMentions) {
                    await this.handleMention(mention);
                }
                
                // Mark notifications as read (skip if not available)
                try {
                    if (this.agent.api?.app?.bsky?.notification?.updateSeen) {
                        await this.agent.api.app.bsky.notification.updateSeen({ seenAt: new Date().toISOString() });
                    }
                } catch (e) {
                    logger.debug('Could not mark notifications as seen:', e.message);
                }
            }

            this.lastCheckTime = new Date();
            
        } catch (error) {
            logger.error('Error in checkForMentions:', error);
        }
    }

    async handleMention(mention) {
        try {
            logger.info(`🗣️  Processing mention from ${mention.author.handle}`);
            
            const post = mention.record;
            const userMessage = post.text;
            const authorDid = mention.author.did;
            const authorHandle = mention.author.handle;
            const postUri = mention.uri;

            // Set cooldown for this user
            this.setCooldown(authorDid);

            // Get or create user in database
            let user;
            try {
                user = await Database.createOrUpdateUser(
                    authorDid,
                    authorHandle,
                    mention.author.displayName,
                    mention.author.avatar
                );
            } catch (dbError) {
                logger.error('Database error, proceeding without user data:', dbError.message);
                // Create a temporary user object to continue processing
                user = {
                    did: authorDid,
                    handle: authorHandle,
                    display_name: mention.author.displayName,
                    last_active: new Date()
                };
            }

            // Use Gemini to understand the user's intent
            const intent = await this.parseUserIntent(userMessage, authorHandle);
            
            // Skip responding to purely conversational mentions
            if (intent.type === 'unknown' && intent.confidence < 0.5) {
                logger.info(`🤷 Skipping low-confidence mention from ${authorHandle}: "${userMessage}"`);
                return;
            }
            
            let response = '';
            let success = true;
            let errorMessage = null;

            try {
                switch (intent.type) {
                    case 'daily_claim':
                        response = await this.handleDailyClaim(user);
                        break;
                    case 'gift_request':
                        response = await this.handleGiftRequest(user, intent, postUri);
                        break;
                    case 'inventory_check':
                        response = await this.handleInventoryCheck(user);
                        break;
                    case 'backlog_check':
                        response = await this.handleBacklogCheck(user);
                        break;
                    case 'help':
                        response = await this.handleHelpRequest(user);
                        break;
                    default:
                        response = await this.handleUnknownRequest(user, userMessage);
                }
            } catch (error) {
                success = false;
                errorMessage = error.message;
                response = await this.generateErrorResponse(error, userMessage);
                logger.error(`Error handling ${intent.type}:`, error);
            }

            // Log the interaction
            await Database.logInteraction(
                user.id,
                postUri,
                intent.type,
                userMessage,
                response,
                success,
                errorMessage
            );

            // Reply to the post
            await this.reply(postUri, response);
            
        } catch (error) {
            logger.error('Error handling mention:', error);
        }
    }

    isReplyToBotPost(notification) {
        try {
            // Check if this mention is a reply to one of the bot's posts
            const post = notification.record;
            if (post.reply && post.reply.parent) {
                const parentUri = post.reply.parent.uri;
                // Check if the parent post is from the bot
                const uriParts = parentUri.split('/');
                const parentDid = uriParts[2];
                return parentDid === this.botDid;
            }
            return false;
        } catch (error) {
            logger.debug('Error checking if reply to bot post:', error);
            return false;
        }
    }

    isInCooldown(userDid) {
        const lastResponse = this.recentResponses.get(userDid);
        if (!lastResponse) return false;
        
        const timeSinceLastResponse = Date.now() - lastResponse;
        return timeSinceLastResponse < this.cooldownPeriod;
    }

    setCooldown(userDid) {
        this.recentResponses.set(userDid, Date.now());
        
        // Clean up old entries to prevent memory leaks
        const cutoff = Date.now() - (this.cooldownPeriod * 2);
        for (const [did, timestamp] of this.recentResponses.entries()) {
            if (timestamp < cutoff) {
                this.recentResponses.delete(did);
            }
        }
    }

    async parseUserIntent(message, userHandle) {
        try {
            const prompt = `Analyze this message from ${userHandle} to the etcetera.exchange bot and determine their intent:

"${message}"

Possible intents:
1. "daily_claim" - User explicitly wants their daily random object (clear requests like "give me an object", "daily claim", "I want something", "please give me one of your finest thingies")
2. "gift_request" - User wants to gift an object to someone else (mentions giving/sending something to another user, includes @handles)  
3. "inventory_check" - User wants to see what they own (words like "inventory", "collection", "what do I have", "my objects")
4. "backlog_check" - User wants to check for missed mentions (words like "backlog", "missed mentions", "check backlog", "did you miss anything")
5. "help" - User needs help or information about the bot
6. "unknown" - Unclear intent, casual conversation, emotional reactions, or general chatter

IMPORTANT: 
- Excited reactions like "yayayayay", "awesome!", "thank you!" should be "unknown" with low confidence
- Complaints or feedback about bot behavior should be "unknown" with low confidence  
- Only classify as "daily_claim" if there's a clear REQUEST for an object, not just mentioning the bot
- Conversations about the bot's behavior or problems should be "unknown"

Be conservative - when in doubt, use "unknown" with low confidence.

If it's a gift_request, try to extract:
- recipient_handle: The @handle of who they want to gift to
- object_description: What object they want to gift (if specified)

Return JSON:
{"type": "intent_type", "recipient_handle": "@handle", "object_description": "description", "confidence": 0.8}`;

            const response = await this.geminiClient.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.2
                }
            });

            return JSON.parse(response.text);
            
        } catch (error) {
            logger.error('Error parsing user intent:', error);
            return { type: 'unknown', confidence: 0 };
        }
    }

    async handleDailyClaim(user) {
        const canClaim = await Database.canClaimDaily(user.id);
        
        if (!canClaim) {
            return await this.generateResponse(`Oh dear ${user.bluesky_handle}! You've already claimed your daily object today! ✨ Come back tomorrow at midnight UTC for another wonderful surprise. In the meantime, visit etcetera.exchange to admire your collection! 🎁`);
        }

        // Get a random object (excluding unique ones that are already claimed)
        const randomObject = await Database.getRandomObject(true);
        
        if (!randomObject) {
            return await this.generateResponse(`Oh my! I seem to have run out of objects to give. This is quite unprecedented! 😅 Please let my creators know - they'll need to generate more magical items for me to distribute!`);
        }

        // Give the object to the user
        await Database.claimDailyObject(user.id, randomObject.id);

        return await this.generateObjectGiftResponse(user, randomObject, 'daily');
    }

    async handleGiftRequest(user, intent, postUri) {
        if (!intent.recipient_handle) {
            return await this.generateResponse(`I'd love to help you gift something! But I need to know who you'd like to give it to. Try mentioning their @handle in your message! 🎁`);
        }

        // Clean up the handle (remove @ if present)
        const recipientHandle = intent.recipient_handle.replace('@', '');
        
        // Get recipient user
        const recipient = await Database.getUserByHandle(recipientHandle);
        if (!recipient) {
            return await this.generateResponse(`Hmm, I don't think ${recipientHandle} has interacted with me yet! They'll need to claim their first daily object before they can receive gifts. 📦`);
        }

        // Get user's inventory
        const inventory = await Database.getUserInventory(user.id);
        if (inventory.length === 0) {
            return await this.generateResponse(`Oh dear! You don't have any objects to gift yet. Claim your daily object first, then you can spread the joy! ✨`);
        }

        // If they specified an object, try to find it
        let objectToGift = null;
        if (intent.object_description) {
            objectToGift = inventory.find(item => 
                item.name.toLowerCase().includes(intent.object_description.toLowerCase()) ||
                item.description.toLowerCase().includes(intent.object_description.toLowerCase())
            );
        }

        // If no specific object or not found, pick the first one
        if (!objectToGift) {
            objectToGift = inventory[0];
        }

        // Perform the gift
        await Database.giftObject(
            user.id,
            recipient.id,
            objectToGift.object_id,
            1,
            postUri,
            `Gift from ${user.bluesky_handle}`
        );

        return await this.generateGiftResponse(user, recipient, objectToGift);
    }

    async handleInventoryCheck(user) {
        const inventory = await Database.getUserInventory(user.id);
        
        if (inventory.length === 0) {
            return await this.generateResponse(`Your collection is empty at the moment! Claim your daily object to start building your magnificent hoard. ✨ Visit etcetera.exchange to see your future treasures!`);
        }

        const totalObjects = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const rareItems = inventory.filter(item => ['legendary', 'mythic', 'unique'].includes(item.rarity));
        
        let response = `You have ${totalObjects} objects in your collection! 📦`;
        
        if (rareItems.length > 0) {
            response += ` Including ${rareItems.length} rare treasures! ✨`;
        }
        
        response += ` Visit etcetera.exchange to see your full magnificent hoard!`;
        
        return await this.generateResponse(response);
    }

    async handleBacklogCheck(user) {
        logger.info(`🔍 ${user.bluesky_handle} requested a backlog check`);
        
        // Trigger the missed mentions check
        setTimeout(async () => {
            try {
                await this.checkMissedMentions();
            } catch (error) {
                logger.error('Error in requested backlog check:', error);
            }
        }, 1000);

        return await this.generateResponse(`🔍 Certainly! I'm checking for any mentions I might have missed in the last 24 hours. If I find any unprocessed mentions, I'll handle them right away! ✨`);
    }

    async handleHelpRequest(user) {
        return await this.generateResponse(`Hello ${user.bluesky_handle}! I'm the etcetera.exchange bot! 🤖✨

Here's what I can do:
• Give you one random object per day (just mention me!)
• Help you gift objects to friends (mention me + their @handle)
• Track your growing collection
• Check for missed mentions (ask me to "check backlog")

Visit etcetera.exchange to see all your objects and gift them through the web interface! The magic never ends! 🎁`);
    }

    async handleUnknownRequest(user, message) {
        const responses = [
            `Hello ${user.bluesky_handle}! I distribute whimsical objects to wonderful people like you. Mention me anytime for your daily surprise! ✨`,
            `*rustles through my infinite bag of curiosities* Did you want your daily object, ${user.bluesky_handle}? Just ask! 🎁`,
            `Greetings! I'm here to share the joy of random objects. What can I do for you today? ✨`,
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async generateObjectGiftResponse(user, object, giftType) {
        const prompt = `${this.botPersonality}

Generate a delightful response for giving this object to ${user.bluesky_handle}:

Object: ${object.name}
Description: ${object.description}
Rarity: ${object.rarity}
Gift Type: ${giftType === 'daily' ? 'daily random object' : 'special gift'}

Write a warm, whimsical response (under 200 characters) that:
- Announces the gift with enthusiasm
- Describes the object charmingly  
- Mentions their collection at etcetera.exchange
- Includes the object's emoji if available: ${object.emoji || ''}

Be creative and magical!`;

        try {
            const response = await this.geminiClient.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt,
                config: {
                    temperature: 0.8,
                    maxOutputTokens: 300
                }
            });

            return response.text.trim();
        } catch (error) {
            logger.error('Error generating object gift response:', error);
            return `🎁 ${user.bluesky_handle}, you've received: ${object.emoji || '✨'} ${object.name}! ${object.description} Visit etcetera.exchange to see your growing collection!`;
        }
    }

    async generateGiftResponse(sender, recipient, object) {
        const prompt = `${this.botPersonality}

Generate a heartwarming response for this gift transaction:

Sender: ${sender.bluesky_handle}
Recipient: ${recipient.bluesky_handle}  
Object: ${object.name}
Description: ${object.description}
Emoji: ${object.emoji || ''}

Write a warm response (under 200 characters) that:
- Celebrates the generosity
- Describes the object being transferred
- Mentions both users fondly
- Encourages visiting etcetera.exchange

Be joyful and community-minded!`;

        try {
            const response = await this.geminiClient.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt,
                config: {
                    temperature: 0.8,
                    maxOutputTokens: 300
                }
            });

            return response.text.trim();
        } catch (error) {
            logger.error('Error generating gift response:', error);
            return `🎁 How wonderful! ${sender.bluesky_handle} has gifted ${object.emoji || '✨'} ${object.name} to ${recipient.bluesky_handle}! Such generosity! Visit etcetera.exchange to see your collections! 💫`;
        }
    }

    async generateResponse(text) {
        // Simple response - already formatted
        return text;
    }

    async generateErrorResponse(error, userMessage) {
        const responses = [
            "Oh dear! Something went awry in my magical mechanisms. Please try again in a moment! ✨",
            "My apologies! I seem to have dropped something in my infinite bag of objects. Give me a moment to reorganize! 🎒",
            "Whoops! Even magical bots have hiccups sometimes. Please try again! 😅",
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async reply(postUri, text) {
        try {
            // Parse the post URI to get the components needed for a reply
            const uriParts = postUri.split('/');
            const did = uriParts[2];
            const rkey = uriParts[4];

            const replyRef = {
                root: {
                    uri: postUri,
                    cid: await this.getPostCid(postUri)
                },
                parent: {
                    uri: postUri,
                    cid: await this.getPostCid(postUri)
                }
            };

            await this.agent.post({
                text: text,
                reply: replyRef
            });

            logger.info(`✅ Replied to ${postUri}`);
            
        } catch (error) {
            logger.error('Error posting reply:', error);
            // Try posting without reply context as fallback
            try {
                await this.agent.post({ text: text });
                logger.info('✅ Posted as standalone (fallback)');
            } catch (fallbackError) {
                logger.error('Error with fallback post:', fallbackError);
            }
        }
    }

    async getPostCid(uri) {
        try {
            const uriParts = uri.split('/');
            const did = uriParts[2];
            const rkey = uriParts[4];
            
            const response = await this.agent.com.atproto.repo.getRecord({
                repo: did,
                collection: 'app.bsky.feed.post',
                rkey: rkey
            });
            
            return response.data.cid;
        } catch (error) {
            logger.error('Error getting post CID:', error);
            return '';
        }
    }

    setupDailyReset() {
        // Reset daily claims at midnight UTC
        const job = new cron.CronJob('0 0 * * *', () => {
            logger.info('🌅 Daily reset - new objects available for claiming!');
        }, null, true, 'UTC');

        logger.info('⏰ Daily reset job scheduled for midnight UTC');
    }

    async shutdown() {
        logger.info('🛑 Shutting down bot...');
        this.isRunning = false;
        await Database.close();
        logger.info('✅ Bot shutdown complete');
    }
}

// Start the bot
async function main() {
    const bot = new EtceteraBot();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        await bot.shutdown();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await bot.shutdown();
        process.exit(0);
    });

    try {
        await bot.initialize();
    } catch (error) {
        logger.error('Failed to start bot:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { EtceteraBot };