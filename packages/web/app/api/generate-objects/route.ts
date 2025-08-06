import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

// Only allow this endpoint in development or with proper authentication
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - in production you'd want proper authentication
    const authHeader = request.headers.get('authorization')
    const isDev = process.env.NODE_ENV === 'development'
    
    if (!isDev && authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { count = 10, rarity = 'mixed' } = await request.json()

    // Validate inputs
    if (count > 100) {
      return NextResponse.json(
        { error: 'Cannot generate more than 100 objects at once' },
        { status: 400 }
      )
    }

    const validRarities = ['mixed', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique']
    if (!validRarities.includes(rarity)) {
      return NextResponse.json(
        { error: 'Invalid rarity specified' },
        { status: 400 }
      )
    }

    // Execute the generation script
    const scriptsDir = path.join(process.cwd(), 'packages', 'scripts')
    const command = rarity === 'mixed' 
      ? `node generate-objects.js --count=${count}`
      : `node generate-objects.js --count=${count} --rarity=${rarity}`

    console.log(`🎲 Generating ${count} objects (${rarity})...`)
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: scriptsDir,
      timeout: 300000 // 5 minute timeout
    })

    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${count} objects`,
      details: stdout,
    })

  } catch (error) {
    console.error('Error generating objects:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate objects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check generation status or get info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/generate-objects',
    description: 'Generate new objects using AI',
    methods: ['POST'],
    parameters: {
      count: 'Number of objects to generate (1-100, default: 10)',
      rarity: 'Rarity type (mixed, common, uncommon, rare, epic, legendary, mythic, unique, default: mixed)'
    },
    example: {
      count: 10,
      rarity: 'mixed'
    }
  })
}
