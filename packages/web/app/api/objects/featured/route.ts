import { NextRequest, NextResponse } from 'next/server'
import Database from '@etcetera/database'

export async function GET(request: NextRequest) {
  try {
    // Get random featured objects across different rarities
    const query = `
      WITH rarity_samples AS (
        -- Get 2 common objects
        (SELECT * FROM objects WHERE rarity = 'common' ORDER BY RANDOM() LIMIT 2)
        UNION ALL
        -- Get 2 uncommon objects  
        (SELECT * FROM objects WHERE rarity = 'uncommon' ORDER BY RANDOM() LIMIT 2)
        UNION ALL
        -- Get 1 rare object
        (SELECT * FROM objects WHERE rarity = 'rare' ORDER BY RANDOM() LIMIT 1)
        UNION ALL
        -- Get 1 epic or higher rarity object
        (SELECT * FROM objects WHERE rarity IN ('epic', 'legendary', 'mythic', 'unique') ORDER BY RANDOM() LIMIT 1)
      )
      SELECT * FROM rarity_samples
      ORDER BY RANDOM()
      LIMIT 8
    `
    
    const result = await Database.query(query)
    const objects = result.rows

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