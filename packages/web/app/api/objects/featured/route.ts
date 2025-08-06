import { NextRequest, NextResponse } from 'next/server'
import Database from '@etcetera/database'

// Cache for featured objects (5 minute cache)
let featuredObjectsCache: {
  data: any[],
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now()
    if (featuredObjectsCache && (now - featuredObjectsCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        objects: featuredObjectsCache.data,
        total: featuredObjectsCache.data.length,
        cached: true
      })
    }

    // More efficient query using TABLESAMPLE for randomness
    const query = `
      WITH object_counts AS (
        SELECT rarity, COUNT(*) as count 
        FROM objects 
        GROUP BY rarity
      ),
      rarity_samples AS (
        -- Get 2 common objects
        (SELECT * FROM objects WHERE rarity = 'common' 
         ORDER BY created_at DESC LIMIT 100) -- Get recent objects for better variety
        UNION ALL
        -- Get 2 uncommon objects  
        (SELECT * FROM objects WHERE rarity = 'uncommon' 
         ORDER BY created_at DESC LIMIT 50)
        UNION ALL
        -- Get 1 rare object
        (SELECT * FROM objects WHERE rarity = 'rare' 
         ORDER BY created_at DESC LIMIT 25)
        UNION ALL
        -- Get 1 epic or higher rarity object
        (SELECT * FROM objects WHERE rarity IN ('epic', 'legendary', 'mythic', 'unique') 
         ORDER BY created_at DESC LIMIT 20)
      )
      SELECT * FROM rarity_samples
      ORDER BY rarity DESC, created_at DESC
      LIMIT 8
    `
    
    const result = await Database.webQuery(query)
    const objects = result.rows

    // Update cache
    featuredObjectsCache = {
      data: objects,
      timestamp: now
    }

    return NextResponse.json({
      success: true,
      objects,
      total: objects.length
    })
  } catch (error) {
    console.error('Error fetching featured objects:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch featured objects',
        objects: []
      },
      { status: 500 }
    )
  }
}

// Cache invalidation endpoint (for when new objects are added)
export async function DELETE(request: NextRequest) {
  try {
    featuredObjectsCache = null
    return NextResponse.json({ success: true, message: 'Cache cleared' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}