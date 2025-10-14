"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type {
  UserProfile,
  MealPlan,
  WorkoutPlan,
  OnboardingData,
  UserContextType,
} from '@/types'
// import { calculateAllMetrics } from '@/lib/calculations'
import { createClient } from '@/lib/supabase/client'

const UserContext = createContext<UserContextType | undefined>(undefined)

// Enhanced UserProvider with auth state synchronization
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [user] = useState<UserProfile | null>(null)
  const [mealPlan] = useState<MealPlan | null>(null)
  const [workoutPlan] = useState<WorkoutPlan | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)

  const supabase = createClient()

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth session error:', error)
          setAuthUser(null)
          setIsLoading(false)
          return
        }

        setAuthUser(session?.user ?? null)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth initialization failed:', error)
        setAuthUser(null)
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, !!session)
      setAuthUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Enhanced auth sync logic can be added here if needed
  // For now, this is a simplified working version

  const updateOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }, [])

  const completeOnboarding = useCallback(async () => {
    // Implementation would go here - similar to user-context.tsx
    console.log('Completing onboarding...', onboardingData)
  }, [onboardingData])

  const updateUser = useCallback(async (profile: Partial<UserProfile>) => {
    // Implementation would go here - similar to user-context.tsx
    console.log('Updating user...', profile)
  }, [])

  const generateMealPlan = useCallback(async () => {
    // Implementation would go here
    console.log('Generating meal plan...')
  }, [])

  const generateWorkoutPlan = useCallback(async () => {
    // Implementation would go here
    console.log('Generating workout plan...')
  }, [])

  const refreshAuthState = useCallback(async () => {
    // Implementation would go here
    console.log('Refreshing auth state...')
  }, [])

  const value: UserContextType = {
    authUser,
    user,
    mealPlan,
    workoutPlan,
    onboardingData,
    updateOnboardingData,
    completeOnboarding,
    updateUser,
    generateMealPlan,
    generateWorkoutPlan,
    refreshAuthState,
    isLoading,
    error,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
