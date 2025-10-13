// User Profile Types
import type { User } from '@supabase/supabase-js'

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say'

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

export type PrimaryGoal = 
  | 'weight-loss' 
  | 'muscle-gain' 
  | 'maintenance' 
  | 'athletic' 
  | 'general'

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly-active' 
  | 'moderately-active' 
  | 'very-active' 
  | 'extremely-active'

export type DietaryPreference = 
  | 'none' 
  | 'vegetarian' 
  | 'vegan' 
  | 'pescatarian' 
  | 'keto' 
  | 'paleo'

export type Units = 'metric' | 'imperial'

export interface MacroBreakdown {
  protein: number  // grams
  carbs: number    // grams
  fats: number     // grams
}

export interface UserProfile {
  id: string
  createdAt: Date
  updatedAt: Date
  
  // Physical Metrics (always stored in metric)
  height: number              // cm
  weight: number              // kg
  age: number
  gender: Gender
  
  // Fitness Profile
  fitnessLevel: FitnessLevel
  primaryGoal: PrimaryGoal
  activityLevel: ActivityLevel
  
  // Dietary Information
  dietaryPreference?: DietaryPreference
  allergies?: string[]
  mealsPerDay: number         // 3-6
  
  // Calculated Metrics
  bmr: number                 // Basal Metabolic Rate
  tdee: number                // Total Daily Energy Expenditure
  targetCalories: number      // Goal-adjusted calories
  macros: MacroBreakdown
  
  // Preferences
  preferredUnits: Units
}

// Meal Plan Types

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Ingredient {
  name: string
  amount: number
  unit: string
}

export interface Meal {
  id: string
  type: MealType
  name: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  prepTime: number            // minutes
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
}

export interface DayMealPlan {
  dayOfWeek: number           // 0-6 (Sunday-Saturday)
  date: Date
  meals: Meal[]
  totalCalories: number
  totalMacros: MacroBreakdown
}

export interface MealPlan {
  id: string
  userId: string
  createdAt: Date
  weekStartDate: Date
  
  dailyCalories: number
  macros: MacroBreakdown
  
  days: DayMealPlan[]
}

// Workout Plan Types

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type WorkoutSplit = 'full-body' | 'upper-lower' | 'ppl' | 'custom'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  muscleGroup: string[]       // e.g., ['chest', 'triceps']
  sets: number
  reps: string                // e.g., "8-12" or "AMRAP"
  restPeriod: number          // seconds
  notes: string
  difficulty: Difficulty
  equipment: string[]         // e.g., ['barbell', 'bench']
}

export interface DayWorkout {
  dayOfWeek: number           // 0-6
  date: Date
  name: string                // e.g., "Push Day", "Leg Day"
  exercises: Exercise[]
  estimatedDuration: number   // minutes
  restDay: boolean
}

export interface WorkoutPlan {
  id: string
  userId: string
  createdAt: Date
  weekStartDate: Date
  
  split: WorkoutSplit
  daysPerWeek: number
  
  days: DayWorkout[]
}

// Onboarding State Types

export interface OnboardingData {
  // Step 1: Physical Metrics
  height?: number
  weight?: number
  age?: number
  gender?: Gender
  
  // Step 2: Fitness Goals
  fitnessLevel?: FitnessLevel
  primaryGoal?: PrimaryGoal
  
  // Step 3: Activity Level
  activityLevel?: ActivityLevel
  
  // Step 4: Dietary Preferences
  dietaryPreference?: DietaryPreference
  allergies?: string[]
  mealsPerDay?: number
  
  // Preferences
  preferredUnits?: Units
}

// Context Types

export interface UserContextType {
  // Auth user from Supabase
  authUser: User | null // Supabase User type
  user: UserProfile | null
  mealPlan: MealPlan | null
  workoutPlan: WorkoutPlan | null
  onboardingData: OnboardingData

  // Actions
  updateOnboardingData: (data: Partial<OnboardingData>) => void
  completeOnboarding: () => Promise<void>
  updateUser: (profile: Partial<UserProfile>) => Promise<void>
  generateMealPlan: () => Promise<void>
  generateWorkoutPlan: () => Promise<void>
  refreshAuthState: () => Promise<void>

  // State
  isLoading: boolean
  error: string | null
}

// API Response Types

export interface CalculateMetricsRequest {
  height: number
  weight: number
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  goal: PrimaryGoal
}

export interface CalculateMetricsResponse {
  bmr: number
  tdee: number
  targetCalories: number
  macros: MacroBreakdown
}

export interface GenerateMealPlanRequest {
  userId: string
  userProfile: UserProfile
}

export interface GenerateMealPlanResponse {
  success: boolean
  mealPlan: MealPlan
}

export interface GenerateWorkoutPlanRequest {
  userId: string
  userProfile: UserProfile
}

export interface GenerateWorkoutPlanResponse {
  success: boolean
  workoutPlan: WorkoutPlan
}

