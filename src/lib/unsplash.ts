/**
 * Fetch random gym/fitness images from Unsplash API
 */

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

const GYM_KEYWORDS = ['gym', 'gym bro', 'fitness', 'workout', 'bodybuilding', 'weightlifting', 'muscle', 'training']

export async function getRandomGymImage(): Promise<string> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not found, using placeholder')
    return '/placeholder.svg'
  }

  try {
    // Randomly select a keyword
    const keyword = GYM_KEYWORDS[Math.floor(Math.random() * GYM_KEYWORDS.length)]
    const page = Math.floor(Math.random() * 10) + 1 // Random page 1-10
    const orientation = 'portrait' // Better for split layout

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&page=${page}&per_page=30&orientation=${orientation}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      // Randomly select an image from results
      const randomIndex = Math.floor(Math.random() * data.results.length)
      return data.results[randomIndex].urls.regular
    }

    // Fallback to placeholder if no results
    return '/placeholder.svg'
  } catch (error) {
    console.error('Error fetching Unsplash image:', error)
    return '/placeholder.svg'
  }
}

/**
 * Client-side version for dynamic image loading
 */
export async function getRandomGymImageClient(): Promise<string> {
  const keyword = GYM_KEYWORDS[Math.floor(Math.random() * GYM_KEYWORDS.length)]
  
  try {
    const response = await fetch(`/api/unsplash?keyword=${encodeURIComponent(keyword)}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    const data = await response.json()
    return data.imageUrl || '/placeholder.svg'
  } catch (error) {
    console.error('Error fetching image:', error)
    return '/placeholder.svg'
  }
}

