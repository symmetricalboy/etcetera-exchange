const { EtceteraBot } = require('./index');
const Database = require('@etcetera/database');
require('dotenv').config();

// Test script for the bot functionality
async function testBot() {
    console.log('🧪 Testing Etcetera Bot functionality...');
    
    try {
        // Test database connection
        console.log('\n📊 Testing database connection...');
        const testQuery = await Database.query('SELECT COUNT(*) FROM objects');
        const objectCount = parseInt(testQuery.rows[0].count);
        console.log(`✅ Database connected. Objects in database: ${objectCount}`);
        
        if (objectCount === 0) {
            console.log('⚠️  No objects in database. Run object generation first:');
            console.log('   cd ../scripts && npm run generate:objects');
            return;
        }

        // Test random object selection
        console.log('\n🎲 Testing random object selection...');
        const randomObject = await Database.getRandomObject(true);
        if (randomObject) {
            console.log(`✅ Random object: ${randomObject.name} (${randomObject.rarity})`);
            console.log(`   "${randomObject.description}"`);
        } else {
            console.log('❌ Failed to get random object');
        }

        // Test user creation
        console.log('\n👤 Testing user operations...');
        const testUser = await Database.createOrUpdateUser(
            'did:test:123',
            'testuser.bsky.social',
            'Test User',
            null
        );
        console.log(`✅ Created/updated test user: ${testUser.bluesky_handle}`);

        // Test daily claim check
        console.log('\n📅 Testing daily claim functionality...');
        const canClaim = await Database.canClaimDaily(testUser.id);
        console.log(`✅ Can claim daily: ${canClaim}`);

        if (canClaim && randomObject) {
            console.log('   Simulating daily claim...');
            await Database.claimDailyObject(testUser.id, randomObject.id);
            console.log('   ✅ Daily claim successful');
            
            // Check inventory
            const inventory = await Database.getUserInventory(testUser.id);
            console.log(`   📦 User inventory: ${inventory.length} items`);
            
            if (inventory.length > 0) {
                console.log(`   Latest item: ${inventory[0].name}`);
            }
        }

        // Test intent parsing (requires Gemini API)
        if (process.env.GEMINI_API_KEY) {
            console.log('\n🧠 Testing intent parsing...');
            const bot = new EtceteraBot();
            
            const testMessages = [
                "Hey bot, give me my daily object!",
                "I want to send my magical sword to @alice.bsky.social",
                "What's in my inventory?",
                "Help me understand how this works"
            ];

            for (const message of testMessages) {
                try {
                    const intent = await bot.parseUserIntent(message, 'testuser.bsky.social');
                    console.log(`   "${message.slice(0, 30)}..." → ${intent.type} (${intent.confidence})`);
                } catch (error) {
                    console.log(`   ❌ Intent parsing failed: ${error.message}`);
                }
            }
        } else {
            console.log('\n⚠️  Skipping intent parsing test (no GEMINI_API_KEY)');
        }

        console.log('\n🎉 Bot testing complete!');
        
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await Database.query('DELETE FROM users WHERE bluesky_did = $1', ['did:test:123']);
        console.log('✅ Test cleanup complete');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await Database.close();
    }
}

if (require.main === module) {
    testBot();
}

module.exports = { testBot };