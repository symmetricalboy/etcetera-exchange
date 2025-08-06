#!/usr/bin/env node

/**
 * Test script to verify bot and web database operations don't block each other
 */

const Database = require('./index.js');

async function testConcurrentOperations() {
    console.log('🧪 Testing concurrent database operations...\n');

    // Simulate multiple bot operations
    const botOperations = Array.from({ length: 5 }, async (_, i) => {
        const start = Date.now();
        try {
            // Simulate a bot query (user lookup)
            await Database.query('SELECT COUNT(*) FROM users');
            const duration = Date.now() - start;
            console.log(`✅ Bot operation ${i + 1} completed in ${duration}ms`);
            return { success: true, duration, type: 'bot' };
        } catch (error) {
            const duration = Date.now() - start;
            console.log(`❌ Bot operation ${i + 1} failed after ${duration}ms: ${error.message}`);
            return { success: false, duration, type: 'bot', error: error.message };
        }
    });

    // Simulate multiple web operations  
    const webOperations = Array.from({ length: 3 }, async (_, i) => {
        const start = Date.now();
        try {
            // Simulate the featured objects query
            await Database.webQuery(`
                SELECT * FROM objects 
                WHERE rarity = 'common' 
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            const duration = Date.now() - start;
            console.log(`🌐 Web operation ${i + 1} completed in ${duration}ms`);
            return { success: true, duration, type: 'web' };
        } catch (error) {
            const duration = Date.now() - start;
            console.log(`❌ Web operation ${i + 1} failed after ${duration}ms: ${error.message}`);
            return { success: false, duration, type: 'web', error: error.message };
        }
    });

    // Run all operations concurrently
    console.log('🚀 Running operations concurrently...\n');
    const allOperations = [...botOperations, ...webOperations];
    const results = await Promise.all(allOperations);

    // Analyze results
    console.log('\n📊 Results Summary:');
    
    const botResults = results.filter(r => r.type === 'bot');
    const webResults = results.filter(r => r.type === 'web');
    
    const botSuccess = botResults.filter(r => r.success).length;
    const webSuccess = webResults.filter(r => r.success).length;
    
    const avgBotTime = botResults.reduce((sum, r) => sum + r.duration, 0) / botResults.length;
    const avgWebTime = webResults.reduce((sum, r) => sum + r.duration, 0) / webResults.length;
    
    console.log(`Bot operations: ${botSuccess}/${botResults.length} successful (avg: ${Math.round(avgBotTime)}ms)`);
    console.log(`Web operations: ${webSuccess}/${webResults.length} successful (avg: ${Math.round(avgWebTime)}ms)`);
    
    if (botSuccess === botResults.length && webSuccess === webResults.length) {
        console.log('\n🎉 SUCCESS: All operations completed without blocking!');
        
        if (avgBotTime < 1000 && avgWebTime < 2000) {
            console.log('✨ Performance looks great!');
        } else {
            console.log('⚠️ Performance could be improved (consider scaling)');
        }
    } else {
        console.log('\n⚠️ Some operations failed - check connection pool settings');
    }
    
    await Database.close();
}

// Run the test
if (require.main === module) {
    testConcurrentOperations().catch(error => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
}

module.exports = { testConcurrentOperations };
