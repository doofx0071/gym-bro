// Plan Status Types
export type PlanStatus = 'generating' | 'completed' | 'failed'

// Enhanced Meal Plan Types
export interface MacroNutrition {
  protein: number  // grams
  carbs: number    // grams
  fats: number     // grams
  calories: number
}

export interface GroceryItem {
  name: string
  category: string // e.g., "Proteins", "Vegetables", "Pantry"
  quantity: string // e.g., "2 lbs", "1 bunch", "3 items"
  notes?: string
}

export interface USDAValidation {
  fdcId?: number
  verified: boolean
  actualCalories?: number
  actualProtein?: number
  actualCarbs?: number
  actualFat?: number
  confidence: 'high' | 'medium' | 'low'
}

export interface MealDetail {
  name: string
  timeOfDay: string // e.g., "Breakfast", "Lunch", "Dinner", "Snack 1"
  calories: number
  macros: MacroNutrition
  ingredients: string[]
  instructions: string[]
  prepTime: number // minutes
  notes?: string
  usdaValidation?: USDAValidation // USDA nutrition verification data
}

export interface DayMeals {
  dayIndex: number // 0-6 (Monday-Sunday)
  dayLabel: string // e.g., "Monday", "Tuesday"
  meals: MealDetail[]
  totalCalories: number
  totalMacros: MacroNutrition
}

export interface MealPlanData {
  id: string
  user_id: string
  title: string
  goal: string // e.g., "Weight Loss", "Muscle Gain"
  calories: number
  macros: MacroNutrition
  days: DayMeals[]
  groceryList: GroceryItem[]
  preferences: Record<string, unknown>
  status: PlanStatus
  week_start_date: Date
  model?: string | null
  prompt?: string | null
  error?: string | null
  validation_status?: 'pending' | 'validated' | 'failed' // USDA validation status
  validation_confidence?: number // 0-100 percentage
  created_at: Date
  updated_at: Date
  started_at?: Date
  completed_at?: Date
}

// Enhanced Workout Plan Types
export type BlockType = 'warmup' | 'main' | 'accessory' | 'cooldown'

export interface ExerciseDetail {
  exerciseId?: string | null // ExerciseDB ID for fetching GIFs and details (null if custom exercise)
  name: string
  sets: number
  reps: string // e.g., "8-12", "AMRAP", "30 seconds"
  restSeconds: number
  rpe?: number // Rate of Perceived Exertion (1-10)
  tempo?: string // e.g., "3-1-2-1"
  equipment?: string[]
  notes?: string
  muscleGroups?: string[]
}

export interface WorkoutBlock {
  type: BlockType
  name: string // e.g., "Dynamic Warmup", "Compound Movements"
  exercises: ExerciseDetail[]
  totalTime?: number // estimated minutes
}

export interface WorkoutDay {
  dayIndex: number // 0-6 (Monday-Sunday)
  dayLabel: string // e.g., "Monday - Push Day"
  isRestDay: boolean
  blocks: WorkoutBlock[]
  totalTime?: number // estimated minutes
  focus?: string // e.g., "Upper Body", "Legs"
}

export interface WorkoutPlanData {
  id: string
  user_id: string
  title: string
  focus?: string // e.g., "Strength", "Hypertrophy", "Endurance"
  split?: 'full-body' | 'upper-lower' | 'push-pull-legs' | 'bro-split' | 'custom'
  daysPerWeek: number
  schedule: WorkoutDay[]
  preferences: Record<string, unknown>
  status: PlanStatus
  week_start_date: Date
  model?: string | null
  prompt?: string | null
  error?: string | null
  created_at: Date
  updated_at: Date
  started_at?: Date
  completed_at?: Date
}

// Request Input Types
export interface MacroGoals {
  protein?: number // grams
  carbs?: number // grams
  fats?: number // grams
}

export interface GenerateMealPlanInput {
  title?: string
  goal?: string
  targetCalories?: number
  macroGoals?: MacroGoals
  dietaryPreferences?: string[]
  allergies?: string[]
  mealsPerDay?: number
  cuisinePreferences?: string[]
  cookingTime?: 'quick' | 'moderate' | 'elaborate'
  cookingSkill?: 'beginner' | 'intermediate' | 'advanced'
  budget?: 'low' | 'moderate' | 'high'
  mealPrepFriendly?: boolean
}

export interface CustomSplitDay {
  dayNumber: number
  label: string
  muscleGroups: string[]
}

export interface GenerateWorkoutPlanInput {
  title?: string
  daysPerWeek?: number
  sessionLength?: number // minutes
  focus?: 'strength' | 'hypertrophy' | 'endurance' | 'general'
  split?: 'full-body' | 'upper-lower' | 'push-pull-legs' | 'bro-split' | 'custom'
  equipment?: string[] // e.g., ['dumbbells', 'barbell', 'bodyweight']
  injuries?: string[]
  experience?: 'beginner' | 'intermediate' | 'advanced'
  customSplitConfig?: CustomSplitDay[] // For custom split type
}

// Response Payload Types (for AI generation)
export interface MealPlanPayload {
  title: string
  goal: string
  calories: number
  macros: MacroNutrition
  days: DayMeals[]
  groceryList: GroceryItem[]
}

export interface WorkoutPlanPayload {
  title: string
  focus?: string
  daysPerWeek: number
  schedule: WorkoutDay[]
}

// Database Insert Types (without auto-generated fields)
export type MealPlanInsert = Omit<MealPlanData, 'id' | 'created_at' | 'updated_at'>
export type WorkoutPlanInsert = Omit<WorkoutPlanData, 'id' | 'created_at' | 'updated_at'>

// Database Update Types
export type MealPlanUpdate = Partial<Omit<MealPlanData, 'id' | 'user_id' | 'created_at'>>
export type WorkoutPlanUpdate = Partial<Omit<WorkoutPlanData, 'id' | 'user_id' | 'created_at'>>

// List View Types (for displaying in lists)
export interface MealPlanSummary {
  id: string
  title: string
  goal: string
  calories: number
  status: PlanStatus
  created_at: Date
  error?: string | null
}

export interface WorkoutPlanSummary {
  id: string
  title: string
  focus?: string
  daysPerWeek: number
  status: PlanStatus
  created_at: Date
  error?: string | null
}