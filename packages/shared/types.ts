// Shared types for etcetera.exchange

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'unique';

export interface User {
    id: string;
    bluesky_did: string;
    bluesky_handle: string;
    display_name?: string;
    avatar_url?: string;
    last_daily_claim?: Date;
    total_objects_received: number;
    total_objects_given: number;
    created_at: Date;
    updated_at: Date;
}

export interface GameObject {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    rarity: RarityLevel;
    is_unique: boolean;
    max_quantity?: number;
    current_quantity: number;
    emoji?: string;
    tags: string[];
    generated_by: string;
    created_at: Date;
}

export interface UserInventoryItem {
    id: string;
    user_id: string;
    object_id: string;
    quantity: number;
    acquired_at: Date;
    // Joined fields from objects table
    name?: string;
    description?: string;
    image_url?: string;
    rarity?: RarityLevel;
    emoji?: string;
    tags?: string[];
}

export interface DailyClaim {
    id: string;
    user_id: string;
    object_id: string;
    claimed_at: Date;
    claim_date: Date;
}

export interface GiftTransaction {
    id: string;
    sender_user_id: string;
    receiver_user_id: string;
    object_id: string;
    quantity: number;
    bluesky_post_uri?: string;
    message?: string;
    created_at: Date;
}

export interface BotInteraction {
    id: string;
    user_id?: string;
    bluesky_post_uri: string;
    interaction_type: InteractionType;
    user_message?: string;
    bot_response?: string;
    success: boolean;
    error_message?: string;
    processed_at: Date;
}

export type InteractionType = 
    | 'daily_claim'
    | 'gift_request'
    | 'inventory_check'
    | 'help'
    | 'unknown'
    | 'error';

export interface BotIntent {
    type: InteractionType;
    recipient_handle?: string;
    object_description?: string;
    confidence: number;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

// Web app specific types
export interface UserSession {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

export interface InventoryFilter {
    rarity?: RarityLevel[];
    search?: string;
    tags?: string[];
    sortBy?: 'acquired_at' | 'name' | 'rarity';
    sortOrder?: 'asc' | 'desc';
}

export interface GiftRequest {
    recipient_handle: string;
    object_id: string;
    quantity: number;
    message?: string;
}

// Utility types
export interface RarityInfo {
    name: RarityLevel;
    weight: number;
    color: string;
    description: string;
    emoji: string;
}

export const RARITY_INFO: Record<RarityLevel, RarityInfo> = {
    common: {
        name: 'common',
        weight: 40,
        color: '#6B7280',
        description: 'Everyday objects with whimsical properties',
        emoji: '📦'
    },
    uncommon: {
        name: 'uncommon',
        weight: 25,
        color: '#10B981',
        description: 'Quirky objects with unusual features',
        emoji: '🎁'
    },
    rare: {
        name: 'rare',
        weight: 20,
        color: '#3B82F6',
        description: 'Magical items from a cozy fantasy world',
        emoji: '✨'
    },
    epic: {
        name: 'epic',
        weight: 10,
        color: '#8B5CF6',
        description: 'Powerful magical objects',
        emoji: '🔮'
    },
    legendary: {
        name: 'legendary',
        weight: 4,
        color: '#F59E0B',
        description: 'Extraordinary items with incredible properties',
        emoji: '⭐'
    },
    mythic: {
        name: 'mythic',
        weight: 0.9,
        color: '#EF4444',
        description: 'Reality-bending objects of immense wonder',
        emoji: '🌟'
    },
    unique: {
        name: 'unique',
        weight: 0.1,
        color: '#EC4899',
        description: 'One-of-a-kind items that defy all logic',
        emoji: '💫'
    }
};

// Validation schemas using Zod
export const ObjectSchema = {
    name: (name: string) => name.length >= 1 && name.length <= 255,
    description: (desc: string) => desc.length >= 10 && desc.length <= 1000,
    rarity: (rarity: string): rarity is RarityLevel => 
        ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique'].includes(rarity),
    tags: (tags: string[]) => tags.every(tag => tag.length <= 50) && tags.length <= 10
};

// Helper functions
export function getRarityInfo(rarity: RarityLevel): RarityInfo {
    return RARITY_INFO[rarity];
}

export function formatRarity(rarity: RarityLevel): string {
    const info = getRarityInfo(rarity);
    return `${info.emoji} ${info.name.charAt(0).toUpperCase() + info.name.slice(1)}`;
}

export function calculateObjectValue(rarity: RarityLevel, isUnique: boolean): number {
    const baseValue = RARITY_INFO[rarity].weight;
    return isUnique ? baseValue * 10 : baseValue;
}

export function isValidBlueskyHandle(handle: string): boolean {
    // Basic validation for Bluesky handles
    const handleRegex = /^[a-zA-Z0-9.-]+\.(bsky\.social|[a-zA-Z0-9.-]+)$/;
    return handleRegex.test(handle);
}

export function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

export function getNextDailyClaimTime(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow;
}