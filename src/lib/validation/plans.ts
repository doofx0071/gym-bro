import { z } from 'zod'
import type {
  MacroNutrition,
  GroceryItem,
  MealDetail,
  DayMeals,
  MealPlanData,
  ExerciseDetail,
  WorkoutBlock,
  WorkoutDay,
  WorkoutPlanData,
  GenerateMealPlanInput,
  GenerateWorkoutPlanInput,
  MealPlanPayload,
  WorkoutPlanPayload,
  MealPlanSummary,
  WorkoutPlanSummary
} from '@/types/plans'

// Base schemas
export const PlanStatusSchema = z.enum(['generating', 'completed', 'failed'])

export const MacroNutritionSchema = z.object({
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
  calories: z.number().min(0)
}) satisfies z.ZodType<MacroNutrition>

export const GroceryItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  quantity: z.string().min(1),
  notes: z.string().optional()
}) satisfies z.ZodType<GroceryItem>

// Meal Plan Schemas
export const MealDetailSchema = z.object({
  name: z.string().min(1),
  timeOfDay: z.string().min(1),
  calories: z.number().min(0),
  macros: MacroNutritionSchema,
  ingredients: z.array(z.string().min(1)),
  instructions: z.array(z.string().min(1)),
  prepTime: z.number().min(0),
  notes: z.string().optional()
}) satisfies z.ZodType<MealDetail>

export const DayMealsSchema = z.object({
  dayIndex: z.number().min(0).max(6),
  dayLabel: z.string().min(1),
  meals: z.array(MealDetailSchema),
  totalCalories: z.number().min(0),
  totalMacros: MacroNutritionSchema
}) satisfies z.ZodType<DayMeals>

export const MealPlanDataSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),
  calories: z.number().min(0),
  macros: MacroNutritionSchema,
  days: z.array(DayMealsSchema),
  groceryList: z.array(GroceryItemSchema),
  preferences: z.record(z.string(), z.unknown()),
  status: PlanStatusSchema,
  week_start_date: z.date(),
  model: z.string().optional().nullable(),
  prompt: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  started_at: z.date().optional(),
  completed_at: z.date().optional()
}) satisfies z.ZodType<MealPlanData>

// Workout Plan Schemas
export const BlockTypeSchema = z.enum(['warmup', 'main', 'accessory', 'cooldown'])

export const ExerciseDetailSchema = z.object({
  name: z.string().min(1),
  sets: z.number().min(1),
  reps: z.string().min(1),
  restSeconds: z.number().min(0),
  rpe: z.number().min(1).max(10).optional(),
  tempo: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  notes: z.string().optional(),
  muscleGroups: z.array(z.string()).optional()
}) satisfies z.ZodType<ExerciseDetail>

export const WorkoutBlockSchema = z.object({
  type: BlockTypeSchema,
  name: z.string().min(1),
  exercises: z.array(ExerciseDetailSchema),
  totalTime: z.number().min(0).optional()
}) satisfies z.ZodType<WorkoutBlock>

export const WorkoutDaySchema = z.object({
  dayIndex: z.number().min(0).max(6),
  dayLabel: z.string().min(1),
  isRestDay: z.boolean(),
  blocks: z.array(WorkoutBlockSchema),
  totalTime: z.number().min(0).optional(),
  focus: z.string().optional()
}) satisfies z.ZodType<WorkoutDay>

export const WorkoutPlanDataSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  title: z.string().min(1),
  focus: z.string().optional(),
  split: z.enum(['full-body', 'upper-lower', 'push-pull-legs', 'custom']).optional(),
  daysPerWeek: z.number().min(1).max(7),
  schedule: z.array(WorkoutDaySchema),
  preferences: z.record(z.string(), z.unknown()),
  status: PlanStatusSchema,
  week_start_date: z.date(),
  model: z.string().optional().nullable(),
  prompt: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  started_at: z.date().optional(),
  completed_at: z.date().optional()
}) satisfies z.ZodType<WorkoutPlanData>

// Input Schemas for API requests
export const GenerateMealPlanInputSchema = z.object({
  title: z.string().min(1).optional(),
  goal: z.string().min(1).optional(),
  targetCalories: z.number().min(800).max(5000).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  mealsPerDay: z.number().min(2).max(6).optional(),
  cuisinePreferences: z.array(z.string()).optional(),
  cookingTime: z.enum(['quick', 'moderate', 'elaborate']).optional(),
  budget: z.enum(['low', 'moderate', 'high']).optional(),
  mealPrepFriendly: z.boolean().optional()
}) satisfies z.ZodType<GenerateMealPlanInput>

export const GenerateWorkoutPlanInputSchema = z.object({
  title: z.string().min(1).optional(),
  daysPerWeek: z.number().min(1).max(7).optional(),
  sessionLength: z.number().min(15).max(180).optional(), // 15 mins to 3 hours
  focus: z.enum(['strength', 'hypertrophy', 'endurance', 'general']).optional(),
  split: z.enum(['full-body', 'upper-lower', 'push-pull-legs', 'custom']).optional(),
  equipment: z.array(z.string()).optional(),
  injuries: z.array(z.string()).optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional()
}) satisfies z.ZodType<GenerateWorkoutPlanInput>

// Payload schemas for AI generation responses
export const MealPlanPayloadSchema = z.object({
  title: z.string().min(1),
  goal: z.string().min(1),
  calories: z.number().min(0),
  macros: MacroNutritionSchema,
  days: z.array(DayMealsSchema),
  groceryList: z.array(GroceryItemSchema)
}) satisfies z.ZodType<MealPlanPayload>

export const WorkoutPlanPayloadSchema = z.object({
  title: z.string().min(1),
  focus: z.string().optional(),
  daysPerWeek: z.number().min(1).max(7),
  schedule: z.array(WorkoutDaySchema)
}) satisfies z.ZodType<WorkoutPlanPayload>

// Summary schemas for list views
export const MealPlanSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),
  calories: z.number().min(0),
  status: PlanStatusSchema,
  created_at: z.date(),
  error: z.string().optional().nullable()
}) satisfies z.ZodType<MealPlanSummary>

export const WorkoutPlanSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  focus: z.string().optional(),
  daysPerWeek: z.number().min(1).max(7),
  status: PlanStatusSchema,
  created_at: z.date(),
  error: z.string().optional().nullable()
}) satisfies z.ZodType<WorkoutPlanSummary>

// Helper function to repair common JSON issues
function repairJsonString(jsonString: string): string {
  let repaired = jsonString
  
  // Fix double-escaped quotes first (\\" -> \")
  repaired = repaired.replace(/\\\\\"/g, '\\"')
  
  // Fix triple-escaped quotes (\\\" -> \")
  repaired = repaired.replace(/\\\\\\\\\"/g, '\\"')
  
  // Fix unescaped newlines in strings
  repaired = repaired.replace(/"([^"]*?)\n([^"]*?)"/g, '"$1\\n$2"')
  
  // Fix trailing commas
  repaired = repaired.replace(/,\s*([\]\}])/g, '$1')
  
  // Remove any trailing text after final closing brace
  const lastBrace = repaired.lastIndexOf('}')
  if (lastBrace !== -1) {
    repaired = repaired.substring(0, lastBrace + 1)
  }
  
  return repaired
}

// Helper function to safely parse JSON strings
export function parseJsonWithSchema<T>(
  jsonString: string,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
  const attempts = [
    jsonString,
    repairJsonString(jsonString)
  ]
  
  for (let i = 0; i < attempts.length; i++) {
    try {
      const parsed = JSON.parse(attempts[i])
      const result = schema.safeParse(parsed)
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        // If it's the last attempt, return validation error
        if (i === attempts.length - 1) {
          return { 
            success: false, 
            error: `Validation error: ${result.error.issues.map(i => i.message).join(', ')}` 
          }
        }
      }
    } catch (error) {
      // If it's the last attempt, return parse error
      if (i === attempts.length - 1) {
        return { 
          success: false, 
          error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }
      }
    }
  }
  
  return { success: false, error: 'All JSON repair attempts failed' }
}

// Helper function to validate AI response and clean up common issues
export function validateAndCleanAIResponse<T>(
  response: string,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
  // Remove markdown code fences if present
  let cleaned = response.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }
  
  // Try to fix common JSON issues
  cleaned = cleaned.trim()
  
  // Try to extract JSON from response if it contains other text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Fix common JSON formatting issues
  cleaned = cleaned
    // Fix trailing commas before closing brackets/braces
    .replace(/,\s*([\]\}])/g, '$1')
    // Fix double-escaped quotes (\\" -> \")
    .replace(/\\\\\"/g, '\\"')
    // Remove any trailing text after the last closing brace
    .replace(/\}[^\}]*$/, '}')
  
  // Try to find the complete JSON object
  let braceCount = 0
  let jsonEnd = -1
  
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      braceCount++
    } else if (cleaned[i] === '}') {
      braceCount--
      if (braceCount === 0) {
        jsonEnd = i
        break
      }
    }
  }
  
  if (jsonEnd !== -1) {
    cleaned = cleaned.substring(0, jsonEnd + 1)
  }
  
  return parseJsonWithSchema(cleaned, schema)
}
