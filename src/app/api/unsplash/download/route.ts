import { NextRequest, NextResponse } from 'next/server'

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

/**
 * Proxy endpoint to trigger Unsplash download tracking
 * This is required by Unsplash API guidelines when a photo is "used"
 */
export async function POST(request: NextRequest) {
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: 'Unsplash API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { downloadLocation } = await request.json()

    if (!downloadLocation) {
      return NextResponse.json(
        { error: 'Download location is required' },
        { status: 400 }
      )
    }

    // Trigger the download endpoint as required by Unsplash API
    const response = await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    })

    if (!response.ok) {
      throw new Error(`Unsplash download trigger failed: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error triggering Unsplash download:', error)
    return NextResponse.json(
      { error: 'Failed to trigger download' },
      { status: 500 }
    )
  }
}

