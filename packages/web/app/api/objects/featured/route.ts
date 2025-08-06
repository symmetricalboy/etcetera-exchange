import { NextRequest, NextResponse } from 'next/server'
import Database from '@etcetera/database/scalable-database'

export async function GET(request: NextRequest) {
  try {
    // Initialize Redis if not already done
    await Database.initialize()
    
    // Use Redis-cached featured objects
    const result = await Database.getFeaturedObjects()
    const objects = result.rows

    return NextResponse.json({
      success: true,
      objects,
      total: objects.length,
      cached: result.fromCache || false
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