const { BskyAgent } = require('@atproto/api');
const { genai } = require('google-genai');
const Database = require('@etcetera/database');
const winston = require('winston');
const cron = require('cron');
require('dotenv').config();

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
        this.geminiClient = genai.Client();
        this.botDid = null;
        this.isRunning = false;
        this.lastCheckTime = new Date();
        
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
        
        // Poll for mentions every 30 seconds
        setInterval(async () => {
            try {
                await this.checkForMentions();
            } catch (error) {
                logger.error('Error checking mentions:', error);
            }
        }, 30000);
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
                       !notif.isRead;
            });

            if (newMentions.length > 0) {
                logger.info(`📬 Found ${newMentions.length} new mentions`);
                
                for (const mention of newMentions) {
                    await this.handleMention(mention);
                }
                
                // Mark notifications as read
                await this.agent.updateSeen({ seenAt: new Date().toISOString() });
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

            // Get or create user in database
            const user = await Database.createOrUpdateUser(
                authorDid,
                authorHandle,
                mention.author.displayName,
                mention.author.avatar
            );

            // Use Gemini to understand the user's intent
            const intent = await this.parseUserIntent(userMessage, authorHandle);
            
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

    async parseUserIntent(message, userHandle) {
        try {
            const prompt = `Analyze this message from ${userHandle} to the etcetera.exchange bot and determine their intent:

"${message}"

Possible intents:
1. "daily_claim" - User wants their daily random object (words like "daily", "random", "object", "gift", "give me", "claim")
2. "gift_request" - User wants to gift an object to someone else (mentions giving/sending something to another user, includes @handles)
3. "inventory_check" - User wants to see what they own (words like "inventory", "collection", "what do I have", "my objects")
4. "help" - User needs help or information about the bot
5. "unknown" - Unclear intent or just casual conversation

If it's a gift_request, try to extract:
- recipient_handle: The @handle of who they want to gift to
- object_description: What object they want to gift (if specified)

Return JSON:
{"type": "intent_type", "recipient_handle": "@handle", "object_description": "description", "confidence": 0.8}`;

            const response = await this.geminiClient.models.generate_content({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    response_mime_type: "application/json",
                    temperature: 0.3
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

    async handleHelpRequest(user) {
        return await this.generateResponse(`Hello ${user.bluesky_handle}! I'm the etcetera.exchange bot! 🤖✨

Here's what I can do:
• Give you one random object per day (just mention me!)
• Help you gift objects to friends (mention me + their @handle)
• Track your growing collection

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
            const response = await this.geminiClient.models.generate_content({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.8,
                    max_output_tokens: 300
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
            const response = await this.geminiClient.models.generate_content({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.8,
                    max_output_tokens: 300
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