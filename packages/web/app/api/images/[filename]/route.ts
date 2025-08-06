import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    // Security: Only allow certain file extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const hasValidExtension = allowedExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext)
    )
    
    if (!hasValidExtension) {
      return new Response('Invalid file type', { status: 400 })
    }

    // Look for image in multiple possible locations
    const possiblePaths = [
      join(process.cwd(), 'public', 'images', filename),
      join(process.cwd(), 'packages', 'web', 'public', 'images', filename),
      join(process.cwd(), 'packages', 'scripts', 'generated-images', filename),
      join(process.cwd(), 'generated-images', filename),
    ]

    let imagePath: string | null = null
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        imagePath = path
        break
      }
    }

    if (!imagePath) {
      // Return a placeholder image or 404
      return new Response('Image not found', { status: 404 })
    }

    const imageBuffer = await readFile(imagePath)
    
    // Determine content type based on file extension
    const ext = filename.toLowerCase().split('.').pop()
    const contentType = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg', 
      'png': 'image/png',
      'webp': 'image/webp'
    }[ext!] || 'image/jpeg'

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': imageBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
