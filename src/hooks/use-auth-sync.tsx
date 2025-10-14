"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useUser } from '@/contexts/user-context'

/**
 * Forces a refresh of the user context after successful authentication
 * This helps resolve timing issues where auth state might not sync immediately
 */
export function useAuthSync() {
  const { authUser, user, refreshAuthState } = useUser()

  return useCallback(async () => {
    if (authUser && !user) {
      console.log('🔄 Forcing auth context refresh due to authUser exists but user context empty')
      
      // Force refresh user context
      if (refreshAuthState) {
        await refreshAuthState()
      }
      
      // Add a small delay to ensure the context updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('🔄 User context after refresh:', user ? 'Updated✅' : 'Still null❌')
      
      if (!user && authUser) {
        console.warn('⚠️ Auth context sync failed - session exists but user context not updated')
      }
    }
  }, [authUser, user, refreshAuthState])
}

/**
 * Enhanced hook to get user with automatic state sync
 * This will automatically refresh the user context if needed
 */
export function useUserWithSync() {
  const { user, authUser, refreshAuthState } = useUser()
  const hasTriedRefresh = useRef(false)
  
  // Refresh auth context automatically if session exists but user context is empty
  useEffect(() => {
    if (authUser && !user && !hasTriedRefresh.current && refreshAuthState) {
      hasTriedRefresh.current = true
      refreshAuthState().catch(console.error)
    }
    
    // Reset flag when user changes
    if (user) {
      hasTriedRefresh.current = false
    }
  }, [authUser, user, refreshAuthState])
  
  // Also add a periodic sync to ensure consistency
  useEffect(() => {
    const interval = setInterval(async () => {
      if (authUser && !user && refreshAuthState) {
        await refreshAuthState().catch(console.error)
      }
    }, 30000) // Check every 30 seconds
    
    return () => {
      clearInterval(interval)
      hasTriedRefresh.current = false
    }
  }, [authUser, user, refreshAuthState])
  
  return { user, authUser }
}

// Export types for convenience
export type { UserContextType } from '@/types'
