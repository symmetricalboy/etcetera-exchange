const { Pool } = require('pg');
require('dotenv').config();

// Create separate pools for different use cases
const botPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 15, // Priority pool for bot operations
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 5000, // Longer timeout for bot operations
});

const webPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10, // Smaller pool for web queries
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 2000,
});

// Backward compatibility - default to bot pool
const pool = botPool;

// Database utility functions
class Database {
    static async query(text, params, useWebPool = false) {
        const selectedPool = useWebPool ? webPool : botPool;
        const client = await selectedPool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }

    static async webQuery(text, params) {
        return this.query(text, params, true);
    }

    static async transaction(callback, useWebPool = false) {
        const selectedPool = useWebPool ? webPool : botPool;
        const client = await selectedPool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // User operations
    static async createOrUpdateUser(blueskyDid, blueskyHandle, displayName = null, avatarUrl = null) {
        const query = `
            INSERT INTO users (bluesky_did, bluesky_handle, display_name, avatar_url)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (bluesky_did) 
            DO UPDATE SET 
                bluesky_handle = EXCLUDED.bluesky_handle,
                display_name = EXCLUDED.display_name,
                avatar_url = EXCLUDED.avatar_url,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const result = await this.query(query, [blueskyDid, blueskyHandle, displayName, avatarUrl]);
        return result.rows[0];
    }

    static async getUserByDid(blueskyDid) {
        const query = 'SELECT * FROM users WHERE bluesky_did = $1';
        const result = await this.query(query, [blueskyDid]);
        return result.rows[0];
    }

    static async getUserByHandle(blueskyHandle) {
        const query = 'SELECT * FROM users WHERE bluesky_handle = $1';
        const result = await this.query(query, [blueskyHandle]);
        return result.rows[0];
    }

    // Daily claim operations
    static async canClaimDaily(userId) {
        const query = `
            SELECT COUNT(*) FROM daily_claims 
            WHERE user_id = $1 AND claim_date = CURRENT_DATE
        `;
        const result = await this.query(query, [userId]);
        return parseInt(result.rows[0].count) === 0;
    }

    static async claimDailyObject(userId, objectId) {
        return this.transaction(async (client) => {
            // Record the claim
            await client.query(`
                INSERT INTO daily_claims (user_id, object_id)
                VALUES ($1, $2)
            `, [userId, objectId]);

            // Add to user inventory
            await client.query(`
                INSERT INTO user_inventory (user_id, object_id, quantity)
                VALUES ($1, $2, 1)
                ON CONFLICT (user_id, object_id)
                DO UPDATE SET quantity = user_inventory.quantity + 1
            `, [userId, objectId]);

            // Update user's last claim time
            await client.query(`
                UPDATE users 
                SET last_daily_claim = CURRENT_TIMESTAMP,
                    total_objects_received = total_objects_received + 1
                WHERE id = $1
            `, [userId]);

            return true;
        });
    }

    // Object operations
    static async getRandomObject(excludeUnique = false) {
        const rarityWeights = {
            'common': 40,
            'uncommon': 25,
            'rare': 20,
            'epic': 10,
            'legendary': 4,
            'mythic': 0.9,
            'unique': 0.1
        };

        // Generate random number and determine rarity
        const rand = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity = 'common';

        for (const [rarity, weight] of Object.entries(rarityWeights)) {
            if (excludeUnique && rarity === 'unique') continue;
            cumulative += weight;
            if (rand <= cumulative) {
                selectedRarity = rarity;
                break;
            }
        }

        // Get random object of selected rarity
        let query = `
            SELECT * FROM objects 
            WHERE rarity = $1
        `;
        let params = [selectedRarity];

        if (excludeUnique) {
            query += ` AND is_unique = FALSE`;
        }

        if (selectedRarity === 'unique') {
            query += ` AND current_quantity = 0`; // Only unclaimed unique objects
        }

        query += ` ORDER BY RANDOM() LIMIT 1`;

        const result = await this.query(query, params);
        return result.rows[0];
    }

    static async addObject(name, description, imageUrl, rarity = 'common', isUnique = false, emoji = null, tags = []) {
        const query = `
            INSERT INTO objects (name, description, image_url, rarity, is_unique, max_quantity, emoji, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const maxQuantity = isUnique ? 1 : null;
        const result = await this.query(query, [name, description, imageUrl, rarity, isUnique, maxQuantity, emoji, tags]);
        return result.rows[0];
    }

    // Inventory operations
    static async getUserInventory(userId) {
        const query = `
            SELECT * FROM user_inventory_view
            WHERE user_id = $1
            ORDER BY acquired_at DESC
        `;
        const result = await this.query(query, [userId]);
        return result.rows;
    }

    static async getUserObjectQuantity(userId, objectId) {
        const query = `
            SELECT quantity FROM user_inventory
            WHERE user_id = $1 AND object_id = $2
        `;
        const result = await this.query(query, [userId, objectId]);
        return result.rows[0]?.quantity || 0;
    }

    // Gift operations
    static async giftObject(senderUserId, receiverUserId, objectId, quantity = 1, blueskyPostUri = null, message = null) {
        return this.transaction(async (client) => {
            // Check if sender has enough of the object
            const senderQuantity = await this.getUserObjectQuantity(senderUserId, objectId);
            if (senderQuantity < quantity) {
                throw new Error('Insufficient quantity to gift');
            }

            // Remove from sender
            if (senderQuantity === quantity) {
                await client.query(`
                    DELETE FROM user_inventory
                    WHERE user_id = $1 AND object_id = $2
                `, [senderUserId, objectId]);
            } else {
                await client.query(`
                    UPDATE user_inventory
                    SET quantity = quantity - $3
                    WHERE user_id = $1 AND object_id = $2
                `, [senderUserId, objectId, quantity]);
            }

            // Add to receiver
            await client.query(`
                INSERT INTO user_inventory (user_id, object_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, object_id)
                DO UPDATE SET quantity = user_inventory.quantity + $3
            `, [receiverUserId, objectId, quantity]);

            // Record the transaction
            await client.query(`
                INSERT INTO gift_transactions (sender_user_id, receiver_user_id, object_id, quantity, bluesky_post_uri, message)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [senderUserId, receiverUserId, objectId, quantity, blueskyPostUri, message]);

            return true;
        });
    }

    // Bot interaction logging
    static async logInteraction(userId, blueskyPostUri, interactionType, userMessage, botResponse, success = true, errorMessage = null) {
        const query = `
            INSERT INTO bot_interactions (user_id, bluesky_post_uri, interaction_type, user_message, bot_response, success, error_message)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const result = await this.query(query, [userId, blueskyPostUri, interactionType, userMessage, botResponse, success, errorMessage]);
        return result.rows[0];
    }

    static async close() {
        await Promise.all([
            botPool.end(),
            webPool.end()
        ]);
    }
}

module.exports = Database;