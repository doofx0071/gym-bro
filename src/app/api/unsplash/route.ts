import { NextRequest, NextResponse } from 'next/server'

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyword = searchParams.get('keyword') || 'gym'

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      {
        error: 'Unsplash API key not configured',
        imageUrl: '/placeholder.svg',
        photographerName: '',
        photographerUsername: '',
        downloadLocation: '',
      },
      { status: 500 }
    )
  }

  try {
    const page = Math.floor(Math.random() * 10) + 1
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&page=${page}&per_page=30&orientation=portrait`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.results.length)
      const photo = data.results[randomIndex]

      // Return all required data for Unsplash API compliance
      return NextResponse.json({
        imageUrl: photo.urls.regular, // Hotlinked URL as required
        photographerName: photo.user.name,
        photographerUsername: photo.user.username,
        downloadLocation: photo.links.download_location, // For triggering download
      })
    }

    return NextResponse.json({
      imageUrl: '/placeholder.svg',
      photographerName: '',
      photographerUsername: '',
      downloadLocation: '',
    })
  } catch (error) {
    console.error('Error fetching from Unsplash:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch image',
        imageUrl: '/placeholder.svg',
        photographerName: '',
        photographerUsername: '',
        downloadLocation: '',
      },
      { status: 500 }
    )
  }
}

