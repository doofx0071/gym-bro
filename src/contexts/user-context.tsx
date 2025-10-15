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

const UserContext = createContext<UserContextType | undefined>(undefined)

const STORAGE_KEYS = {
  USER: 'gym-bro-user',
  MEAL_PLAN: 'gym-bro-meal-plan',
  WORKOUT_PLAN: 'gym-bro-workout-plan',
  ONBOARDING: 'gym-bro-onboarding',
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      // Only trigger loading for actual auth changes, not visibility changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setAuthUser(session?.user ?? null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Load data from database on mount
  useEffect(() => {
    if (!authUser) {
      // Clear data if no auth user
      setUser(null)
      setMealPlan(null)
      setWorkoutPlan(null)
      setOnboardingData({})
      setIsLoading(false)
      return
    }

    // Don't reload if we already have user data - simplified check
    if (user) {
      setIsLoading(false)
      return
    }

    // Prevent multiple concurrent requests
    let isCancelled = false

    const loadUserData = async () => {
      if (isCancelled) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Load user profile from database - use maybeSingle to handle missing profiles
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            created_at,
            updated_at,
            height,
            weight,
            age,
            gender,
            fitness_level,
            primary_goal,
            activity_level,
            dietary_preference,
            allergies,
            meals_per_day,
            preferred_units,
            bmr,
            tdee,
            target_calories,
            macros_protein,
            macros_carbs,
            macros_fats
          `)
          .eq('auth_user_id', authUser.id)
          .maybeSingle()

        if (isCancelled) return

        if (profileError) {
          // Log detailed error info for debugging
          console.error('Database error:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          })
          
          // Handle gracefully - don't crash the app
          setError(`Database error: ${profileError.message}`)
          setUser(null)
          setIsLoading(false)
          return
        }

        // Handle the case where no profile exists (profileData is null)
        if (!profileData) {
          console.log('No profile found, user needs onboarding')
          // Load onboarding data from localStorage if exists
          const storedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING)
          if (storedOnboarding) {
            setOnboardingData(JSON.parse(storedOnboarding))
          }
          setUser(null)
          setIsLoading(false)
          return
        }

        if (profileData && !isCancelled) {
          const userProfile: UserProfile = {
            id: profileData.id,
            createdAt: new Date(profileData.created_at),
            updatedAt: new Date(profileData.updated_at),
            height: profileData.height,
            weight: profileData.weight,
            age: profileData.age,
            gender: profileData.gender,
            fitnessLevel: profileData.fitness_level,
            primaryGoal: profileData.primary_goal,
            activityLevel: profileData.activity_level,
            dietaryPreference: profileData.dietary_preference,
            allergies: profileData.allergies,
            mealsPerDay: profileData.meals_per_day,
            preferredUnits: profileData.preferred_units,
            bmr: profileData.bmr,
            tdee: profileData.tdee,
            targetCalories: profileData.target_calories,
            macros: {
              protein: profileData.macros_protein,
              carbs: profileData.macros_carbs,
              fats: profileData.macros_fats,
            },
          }
          setUser(userProfile)

          // Load active meal plan and workout plan
          if (!isCancelled) {
            // Load most recent completed meal plan
            const { data: mealPlanData } = await supabase
              .from('meal_plans')
              .select('id, title, calories, status, plan, plan_data, macros')
              .eq('user_id', profileData.id)
              .eq('status', 'completed')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (mealPlanData && !isCancelled) {
              // Extract days from either plan_data.days or plan column
              let days: unknown[] = []
              if (mealPlanData.plan_data && typeof mealPlanData.plan_data === 'object' && 'days' in mealPlanData.plan_data) {
                const planData = mealPlanData.plan_data as { days: unknown }
                days = Array.isArray(planData.days) ? planData.days : []
              } else if (mealPlanData.plan) {
                days = Array.isArray(mealPlanData.plan) ? mealPlanData.plan : []
              }

              setMealPlan({
                id: mealPlanData.id,
                title: mealPlanData.title,
                dailyCalories: mealPlanData.calories,
                status: mealPlanData.status,
                days: days,
                macros: mealPlanData.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 }
              } as unknown as MealPlan)
            }

            // Load most recent completed workout plan
            const { data: workoutPlanData } = await supabase
              .from('workout_plans')
              .select('id, title, days_per_week, status, schedule, plan_data')
              .eq('user_id', profileData.id)
              .eq('status', 'completed')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (workoutPlanData && !isCancelled) {
              // Extract schedule from either plan_data.schedule or schedule column
              let schedule: unknown[] = []
              if (workoutPlanData.plan_data && typeof workoutPlanData.plan_data === 'object' && 'schedule' in workoutPlanData.plan_data) {
                const planData = workoutPlanData.plan_data as { schedule: unknown }
                schedule = Array.isArray(planData.schedule) ? planData.schedule : []
              } else if (workoutPlanData.schedule) {
                schedule = Array.isArray(workoutPlanData.schedule) ? workoutPlanData.schedule : []
              }

              setWorkoutPlan({
                id: workoutPlanData.id,
                title: workoutPlanData.title,
                daysPerWeek: workoutPlanData.days_per_week,
                status: workoutPlanData.status,
                schedule: schedule
              } as unknown as WorkoutPlan)
            }
          }
        }
        
        if (!isCancelled) {
          setIsLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Unexpected error loading user data:', err)
          setError('Failed to load user data')
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    loadUserData()

    // Cleanup function to cancel request if component unmounts or authUser changes
    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, supabase])

  // Save onboarding data to localStorage (temporary until completed)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(onboardingData))
  }, [onboardingData])

  const updateOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }, [])

  const refreshAuthState = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Auth refresh error:', error)
        setAuthUser(null)
      } else {
        setAuthUser(session?.user ?? null)
      }
    } catch (error) {
      console.error('Auth refresh failed:', error)
      setAuthUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const completeOnboarding = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!onboardingData.height || !onboardingData.weight || !onboardingData.age ||
          !onboardingData.gender || !onboardingData.fitnessLevel ||
          !onboardingData.primaryGoal || !onboardingData.activityLevel) {
        throw new Error('Missing required onboarding data')
      }

      if (!authUser) {
        throw new Error('No authenticated user found')
      }

      // Calculate metrics
      const metrics = calculateAllMetrics(
        onboardingData.weight,
        onboardingData.height,
        onboardingData.age,
        onboardingData.gender,
        onboardingData.activityLevel,
        onboardingData.primaryGoal
      )

      // Save to Supabase (upsert to handle existing profiles)
      const { data: profileData, error: dbError } = await supabase
        .from('user_profiles')
        .upsert({
          auth_user_id: authUser.id,
          height: onboardingData.height,
          weight: onboardingData.weight,
          age: onboardingData.age,
          gender: onboardingData.gender,
          fitness_level: onboardingData.fitnessLevel,
          primary_goal: onboardingData.primaryGoal,
          activity_level: onboardingData.activityLevel,
          dietary_preference: onboardingData.dietaryPreference,
          allergies: onboardingData.allergies,
          meals_per_day: onboardingData.mealsPerDay || 3,
          preferred_units: onboardingData.preferredUnits || 'metric',
          bmr: metrics.bmr,
          tdee: metrics.tdee,
          target_calories: metrics.targetCalories,
          macros_protein: metrics.macros.protein,
          macros_carbs: metrics.macros.carbs,
          macros_fats: metrics.macros.fats,
        }, {
          onConflict: 'auth_user_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      // Create user profile object
      const newUser: UserProfile = {
        id: profileData.id,
        createdAt: new Date(profileData.created_at),
        updatedAt: new Date(profileData.updated_at),
        height: profileData.height,
        weight: profileData.weight,
        age: profileData.age,
        gender: profileData.gender,
        fitnessLevel: profileData.fitness_level,
        primaryGoal: profileData.primary_goal,
        activityLevel: profileData.activity_level,
        dietaryPreference: profileData.dietary_preference,
        allergies: profileData.allergies,
        mealsPerDay: profileData.meals_per_day,
        preferredUnits: profileData.preferred_units,
        bmr: profileData.bmr,
        tdee: profileData.tdee,
        targetCalories: profileData.target_calories,
        macros: {
          protein: profileData.macros_protein,
          carbs: profileData.macros_carbs,
          fats: profileData.macros_fats,
        },
      }

      setUser(newUser)

      // Clear onboarding data
      setOnboardingData({})
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [onboardingData, authUser, supabase])

  const updateUser = useCallback(async (profile: Partial<UserProfile>) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error('No user profile found')
      }

      // If physical metrics or goals changed, recalculate
      const needsRecalculation =
        profile.height !== undefined ||
        profile.weight !== undefined ||
        profile.age !== undefined ||
        profile.gender !== undefined ||
        profile.activityLevel !== undefined ||
        profile.primaryGoal !== undefined

      let updatedUser = {
        ...user,
        ...profile,
        updatedAt: new Date(),
      }

      if (needsRecalculation) {
        const metrics = calculateAllMetrics(
          updatedUser.weight,
          updatedUser.height,
          updatedUser.age,
          updatedUser.gender,
          updatedUser.activityLevel,
          updatedUser.primaryGoal
        )
        updatedUser = { ...updatedUser, ...metrics }
      }

      // Update in database
      const updateData: Record<string, string | number | string[] | undefined> = {
        height: updatedUser.height,
        weight: updatedUser.weight,
        age: updatedUser.age,
        gender: updatedUser.gender,
        fitness_level: updatedUser.fitnessLevel,
        primary_goal: updatedUser.primaryGoal,
        activity_level: updatedUser.activityLevel,
        dietary_preference: updatedUser.dietaryPreference,
        allergies: updatedUser.allergies,
        meals_per_day: updatedUser.mealsPerDay,
        preferred_units: updatedUser.preferredUnits,
      }

      if (needsRecalculation) {
        updateData.bmr = updatedUser.bmr
        updateData.tdee = updatedUser.tdee
        updateData.target_calories = updatedUser.targetCalories
        updateData.macros_protein = updatedUser.macros.protein
        updateData.macros_carbs = updatedUser.macros.carbs
        updateData.macros_fats = updatedUser.macros.fats
      }

      const { error: dbError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      setUser(updatedUser)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const generateMealPlan = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error('No user profile found')
      }

      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userProfile: user }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate meal plan')
      }

      const data = await response.json()
      setMealPlan(data.mealPlan)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate meal plan'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const generateWorkoutPlan = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error('No user profile found')
      }

      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userProfile: user }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate workout plan')
      }

      const data = await response.json()
      setWorkoutPlan(data.workoutPlan)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate workout plan'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

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

