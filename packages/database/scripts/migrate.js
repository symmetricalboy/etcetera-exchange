const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Executing schema migration...');
        await client.query(schema);
        
        console.log('✅ Database migration completed successfully!');
        
        // Check if we have any objects in the database
        const result = await client.query('SELECT COUNT(*) FROM objects');
        const objectCount = parseInt(result.rows[0].count);
        
        if (objectCount === 0) {
            console.log('⚠️  No objects found in database. Run the object generation script to populate with random objects.');
        } else {
            console.log(`📦 Database contains ${objectCount} objects`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    migrate();
}

module.exports = { migrate };