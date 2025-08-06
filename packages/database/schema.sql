-- Etcetera Exchange Database Schema
-- A whimsical object exchange system for Bluesky

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Object rarities enum
CREATE TYPE rarity_level AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique');

-- Users table - Bluesky users who interact with the bot
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bluesky_did VARCHAR(255) UNIQUE NOT NULL,
    bluesky_handle VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    last_daily_claim TIMESTAMPTZ,
    total_objects_received INTEGER DEFAULT 0,
    total_objects_given INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Objects table - The master catalog of all possible objects
CREATE TABLE objects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    rarity rarity_level NOT NULL DEFAULT 'common',
    is_unique BOOLEAN DEFAULT FALSE,
    max_quantity INTEGER, -- NULL means unlimited, otherwise max copies that can exist
    current_quantity INTEGER DEFAULT 0, -- How many currently exist
    emoji VARCHAR(10), -- Optional emoji representation
    tags TEXT[], -- Array of tags for categorization
    generated_by VARCHAR(50) DEFAULT 'gemini', -- Track generation source
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique objects can only have 1 copy
    CONSTRAINT unique_object_quantity CHECK (
        (is_unique = TRUE AND max_quantity = 1) OR is_unique = FALSE
    )
);

-- User inventory - What objects each user owns
CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    acquired_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure each user-object combination is unique
    UNIQUE(user_id, object_id),
    
    -- Ensure positive quantities
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Daily gift claims - Track who has claimed their daily random object
CREATE TABLE daily_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- One claim per user per day
    UNIQUE(user_id, claim_date)
);

-- Gift transactions - Track when users gift objects to each other
CREATE TABLE gift_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_id UUID NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    bluesky_post_uri VARCHAR(500), -- The Bluesky post that initiated this gift
    message TEXT, -- Optional gift message
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure positive quantities
    CONSTRAINT positive_gift_quantity CHECK (quantity > 0),
    
    -- Can't gift to yourself
    CONSTRAINT no_self_gifts CHECK (sender_user_id != receiver_user_id)
);

-- Bot interactions - Log all bot mentions and responses
CREATE TABLE bot_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    bluesky_post_uri VARCHAR(500) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'daily_claim', 'gift_request', 'unknown', etc.
    user_message TEXT,
    bot_response TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_bluesky_did ON users(bluesky_did);
CREATE INDEX idx_users_handle ON users(bluesky_handle);
CREATE INDEX idx_users_last_daily_claim ON users(last_daily_claim);

CREATE INDEX idx_objects_rarity ON objects(rarity);
CREATE INDEX idx_objects_is_unique ON objects(is_unique);
CREATE INDEX idx_objects_tags ON objects USING GIN(tags);

CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_object_id ON user_inventory(object_id);

CREATE INDEX idx_daily_claims_user_id ON daily_claims(user_id);
CREATE INDEX idx_daily_claims_date ON daily_claims(claim_date);

CREATE INDEX idx_gift_transactions_sender ON gift_transactions(sender_user_id);
CREATE INDEX idx_gift_transactions_receiver ON gift_transactions(receiver_user_id);
CREATE INDEX idx_gift_transactions_created_at ON gift_transactions(created_at);

CREATE INDEX idx_bot_interactions_user_id ON bot_interactions(user_id);
CREATE INDEX idx_bot_interactions_type ON bot_interactions(interaction_type);
CREATE INDEX idx_bot_interactions_processed_at ON bot_interactions(processed_at);

-- Triggers to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update receiver stats
        UPDATE users 
        SET total_objects_received = total_objects_received + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.receiver_user_id;
        
        -- Update sender stats
        UPDATE users 
        SET total_objects_given = total_objects_given + NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.sender_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON gift_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update object quantities
CREATE OR REPLACE FUNCTION update_object_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE objects 
        SET current_quantity = current_quantity + NEW.quantity
        WHERE id = NEW.object_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE objects 
        SET current_quantity = current_quantity + (NEW.quantity - OLD.quantity)
        WHERE id = NEW.object_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE objects 
        SET current_quantity = current_quantity - OLD.quantity
        WHERE id = OLD.object_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_object_quantity
    AFTER INSERT OR UPDATE OR DELETE ON user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_object_quantity();

-- Views for common queries
CREATE VIEW user_inventory_view AS
SELECT 
    ui.user_id,
    ui.object_id,
    ui.quantity,
    ui.acquired_at,
    o.name,
    o.description,
    o.image_url,
    o.rarity,
    o.emoji,
    o.tags,
    u.bluesky_handle
FROM user_inventory ui
JOIN objects o ON ui.object_id = o.id
JOIN users u ON ui.user_id = u.id;

CREATE VIEW daily_leaderboard AS
SELECT 
    u.bluesky_handle,
    u.display_name,
    COUNT(dc.id) as objects_claimed_today,
    u.total_objects_received,
    u.total_objects_given
FROM users u
LEFT JOIN daily_claims dc ON u.id = dc.user_id AND dc.claim_date = CURRENT_DATE
GROUP BY u.id, u.bluesky_handle, u.display_name, u.total_objects_received, u.total_objects_given
ORDER BY objects_claimed_today DESC, u.total_objects_received DESC;

-- Seed some example rarities and weights for random selection
COMMENT ON TYPE rarity_level IS 'Object rarity levels with approximate weights: common(40%), uncommon(25%), rare(20%), epic(10%), legendary(4%), mythic(0.9%), unique(0.1%)';