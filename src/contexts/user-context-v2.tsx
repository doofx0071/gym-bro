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
import { calculateAllMetrics } from '@/lib/calculations'
import { createClient } from '@/lib/supabase/client'

// Enhanced UserProvider with auth state synchronization
export function UserProvider({ children }: { children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  // Auto-refresh auth context every 5 seconds
  
  // Enhanced auth state synchronization logic
  const { authUser, setAuthUser } = useAuthSync()
  
  const [
    data,
    subscription,
  ] 
    //  console.log('📊 Auth state changed:', { hasSession: !!data?.session })
  ] = supabase.auth.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔐 Auth state callback data:', { hasSession: !!data?.session, hasAuthSession })
      const newUser = session?.user ?? null
      const oldUser = authUser
      
      // Handle authentication state synchronization
      if (newUser && !oldUser) {
        console.log('🔄 User logged in, but user context not updated')
        
        // Refresh user context
        try {
          const { userProfile } = await supabase
            .from('user_profiles')
            .select('*') 
            .eq('auth_user_id', newUser.id)
            .single()
          } finally {
            setUser(session?.user || null)
            console.log('✅ User context from database:', !!session?.user ? 'Updated' : 'Missing user data')
          }
        }
        const authUserSession = session?.session?.session || null
        if (authUserSession) {
          console.log('🔐 Creating refreshed auth session context')
          router.refresh('/')
        }
      }
    }
  }, [data.subscription, supabase.auth, authUser, user, isLoading])
  return (
    <UserProvider value={value}>
      {children}
    </UserProvider>
  )
}
```

Also let me update the imports to match what the export pattern in the auth-form component:
<tool_call>Edit
<arg_key>file_path</arg_key>
<arg_value>C:\Users\crist\documents\doof codings\gym-bro\src\components\auth-form.tsx
