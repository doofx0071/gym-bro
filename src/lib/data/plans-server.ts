import { createClient } from '@/lib/supabase/server'
import { 
  MealPlanDataSchema, 
  WorkoutPlanDataSchema 
} from '@/lib/validation/plans'
import type { 
  MealPlanSummary, 
  WorkoutPlanSummary, 
  MealPlanData, 
  WorkoutPlanData,
  PlanStatus,
  DayMeals,
  GroceryItem,
  WorkoutDay,
  MacroNutrition
} from '@/types/plans'

// Error types for better error handling
export interface DataResult<T> {
  data: T | null
  error: string | null
}

export interface DataListResult<T> {
  data: T[]
  error: string | null
}

// Helper to transform database row to typed data
function transformMealPlanRow(row: Record<string, unknown>): MealPlanData {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    goal: row.goal as string,
    calories: row.calories as number,
    macros: (row.macros as MacroNutrition) || { protein: 0, carbs: 0, fats: 0, calories: 0 },
    days: (row.days as DayMeals[]) || [],
    groceryList: (row.grocery_list as GroceryItem[]) || [],
    preferences: (row.preferences as Record<string, unknown>) || {},
    status: row.status as PlanStatus,
    week_start_date: new Date(row.week_start_date as string),
    model: row.model as string | undefined,
    prompt: row.prompt as string | undefined,
    error: row.error as string | undefined,
    created_at: new Date(row.created_at as string),
    updated_at: new Date(row.updated_at as string),
    started_at: row.started_at ? new Date(row.started_at as string) : undefined,
    completed_at: row.completed_at ? new Date(row.completed_at as string) : undefined
  }
}

function transformWorkoutPlanRow(row: Record<string, unknown>): WorkoutPlanData {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    focus: row.focus as string | undefined,
    daysPerWeek: row.days_per_week as number,
    schedule: (row.schedule as WorkoutDay[]) || [],
    preferences: (row.preferences as Record<string, unknown>) || {},
    status: row.status as PlanStatus,
    week_start_date: new Date(row.week_start_date as string),
    model: row.model as string | undefined,
    prompt: row.prompt as string | undefined,
    error: row.error as string | undefined,
    created_at: new Date(row.created_at as string),
    updated_at: new Date(row.updated_at as string),
    started_at: row.started_at ? new Date(row.started_at as string) : undefined,
    completed_at: row.completed_at ? new Date(row.completed_at as string) : undefined
  }
}

// Server-side data access functions
export async function getMealPlansForUser(userId: string): Promise<DataListResult<MealPlanSummary>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('meal_plans')
      .select('id, title, goal, calories, status, created_at, error')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch meal plans:', error)
      return { data: [], error: 'Failed to fetch meal plans' }
    }

    if (!data) {
      return { data: [], error: null }
    }

    // Transform and validate data
    const summaries: MealPlanSummary[] = data.map(row => ({
      id: row.id,
      title: row.title,
      goal: row.goal,
      calories: row.calories,
      status: row.status,
      created_at: new Date(row.created_at),
      error: row.error
    }))

    return { data: summaries, error: null }
  } catch (error) {
    console.error('Error fetching meal plans:', error)
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getMealPlanById(planId: string, userId: string): Promise<DataResult<MealPlanData>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        id, user_id, title, goal, calories, macros,
        days, grocery_list, preferences, status, week_start_date, model, prompt, error,
        created_at, updated_at, started_at, completed_at
      `)
      .eq('id', planId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch meal plan:', error)
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Meal plan not found' }
      }
      return { data: null, error: 'Failed to fetch meal plan' }
    }

    if (!data) {
      return { data: null, error: 'Meal plan not found' }
    }

    const mealPlan = transformMealPlanRow(data)
    
    // Validate the data structure
    const validation = MealPlanDataSchema.safeParse(mealPlan)
    if (!validation.success) {
      console.error('Invalid meal plan data:', validation.error)
      return { data: null, error: 'Invalid meal plan data' }
    }

    return { data: validation.data, error: null }
  } catch (error) {
    console.error('Error fetching meal plan:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getWorkoutPlansForUser(userId: string): Promise<DataListResult<WorkoutPlanSummary>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('workout_plans')
      .select('id, title, focus, days_per_week, status, created_at, error')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch workout plans:', error)
      return { data: [], error: 'Failed to fetch workout plans' }
    }

    if (!data) {
      return { data: [], error: null }
    }

    // Transform and validate data
    const summaries: WorkoutPlanSummary[] = data.map(row => ({
      id: row.id,
      title: row.title,
      focus: row.focus,
      daysPerWeek: row.days_per_week,
      status: row.status,
      created_at: new Date(row.created_at),
      error: row.error
    }))

    return { data: summaries, error: null }
  } catch (error) {
    console.error('Error fetching workout plans:', error)
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getWorkoutPlanById(planId: string, userId: string): Promise<DataResult<WorkoutPlanData>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        id, user_id, title, focus, days_per_week, schedule,
        preferences, status, week_start_date, model, prompt, error,
        created_at, updated_at, started_at, completed_at
      `)
      .eq('id', planId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch workout plan:', error)
      if (error.code === 'PGRST116') {
        return { data: null, error: 'Workout plan not found' }
      }
      return { data: null, error: 'Failed to fetch workout plan' }
    }

    if (!data) {
      return { data: null, error: 'Workout plan not found' }
    }

    const workoutPlan = transformWorkoutPlanRow(data)
    
    // Validate the data structure
    const validation = WorkoutPlanDataSchema.safeParse(workoutPlan)
    if (!validation.success) {
      console.error('Invalid workout plan data:', validation.error)
      return { data: null, error: 'Invalid workout plan data' }
    }

    return { data: validation.data, error: null }
  } catch (error) {
    console.error('Error fetching workout plan:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}