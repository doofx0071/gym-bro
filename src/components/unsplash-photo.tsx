'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface UnsplashPhotoData {
  imageUrl: string
  photographerName: string
  photographerUsername: string
  downloadLocation: string
}

interface UnsplashPhotoProps {
  className?: string
  alt?: string
}

export function UnsplashPhoto({ className = '', alt = 'Gym' }: UnsplashPhotoProps) {
  const [photoData, setPhotoData] = useState<UnsplashPhotoData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPhoto = async () => {
      // Check if we already have a photo in sessionStorage
      const cachedData = sessionStorage.getItem('auth_gym_photo_data')
      if (cachedData) {
        setPhotoData(JSON.parse(cachedData))
        setIsLoading(false)
        return
      }

      // Fetch new photo only if not cached
      try {
        const keywords = ['gym', 'gym bro', 'fitness', 'workout', 'bodybuilding']
        const keyword = keywords[Math.floor(Math.random() * keywords.length)]
        const response = await fetch(`/api/unsplash?keyword=${encodeURIComponent(keyword)}`)
        const data = await response.json()
        
        if (data.imageUrl) {
          const newPhotoData: UnsplashPhotoData = {
            imageUrl: data.imageUrl,
            photographerName: data.photographerName || 'Unknown',
            photographerUsername: data.photographerUsername || 'unsplash',
            downloadLocation: data.downloadLocation || '',
          }
          
          setPhotoData(newPhotoData)
          // Cache the photo data in sessionStorage
          sessionStorage.setItem('auth_gym_photo_data', JSON.stringify(newPhotoData))
        }
      } catch (error) {
        console.error('Error fetching photo:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhoto()
  }, [])

  // Trigger download event when photo is displayed
  useEffect(() => {
    if (photoData?.downloadLocation) {
      // Trigger download endpoint via our proxy as per Unsplash API guidelines
      fetch('/api/unsplash/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadLocation: photoData.downloadLocation }),
      }).catch(err =>
        console.error('Error triggering download:', err)
      )
    }
  }, [photoData])

  if (isLoading || !photoData) {
    return (
      <div className={`bg-muted relative ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  const unsplashUrl = `https://unsplash.com/@${photoData.photographerUsername}?utm_source=gym_bro&utm_medium=referral`
  const unsplashHomeUrl = 'https://unsplash.com/?utm_source=gym_bro&utm_medium=referral'

  return (
    <div className={`bg-muted relative ${className}`}>
      <img
        src={photoData.imageUrl}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.7]"
      />
      
      {/* Attribution overlay - Required by Unsplash API */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <p className="text-xs text-white/90">
          Photo by{' '}
          <a
            href={unsplashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white cursor-pointer"
          >
            {photoData.photographerName}
          </a>
          {' '}on{' '}
          <a
            href={unsplashHomeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white cursor-pointer"
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  )
}

