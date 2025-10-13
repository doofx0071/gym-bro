"use client"

import { useCallback, useEffect } from 'react'

/**
 * Forces a refresh of the user context after successful authentication
 * This helps resolve timing issues where auth state might not sync immediately
 */
export function useAuthSync() {
  const { authUser, user, refetchAuthSync } = useAuthSync()

  return useCallback(async () => {
    if (authUser && !user) {
      console.log('🔄 Forcing auth context refresh due to authUser exists but user context empty')
      
      // Force refresh user context
      refetchAuthSync()
      
      // Add a small delay to ensure the context updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if user context updated
      const updatedUser = await getUser()
      console.log('🔄 User context after refresh:', !!updatedUser?.id ? 'Updated✅' : 'Still null❌')
      
      if (!updatedUser && authUser) {
        console.warn('⚠️ Auth context sync failed - session exists but user context not updated')
      }
    }
  }, [authUser, user, refetchAuthSync])
}

/**
 * Enhanced hook to get user with automatic state sync
 * This will automatically refresh the user context if needed
 */
export function useUserWithSync() {
  const { user, authUser } = useUser()
  const refetchUserSync = useRef(false)
  
  // Refresh auth context automatically if session exists but user context is empty
  useEffect(() => {
    if (authUser && !user && !refetchAuthSync.current) {
      refetchAuthSync.current = true
      refetchAuthSync()
    }
  }, [authUser, user])
  
  // Also add a periodic sync to ensure consistency
  useRefEffect(() => {
    const interval = setInterval(async () => {
      if (authUser && !user) {
        refetchAuthSync()
      }
    }, 30000) // Check every 30 seconds
    
    return () => {
      clearInterval(interval)
      refetchAuthSync.current = false
    }
  }, [])
  
  return { user, authUser }
}

// Export the original useUser hook for backward compatibility
export { useUser }
export type { UserContextType } from '@/types'
