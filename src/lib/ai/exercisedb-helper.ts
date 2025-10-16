/**
 * ExerciseDB Helper for AI Workout Generation
 * Fetches real exercises from ExerciseDB and prepares them for AI prompts
 */

import { getAllExercises, getExercisesByEquipment } from '@/lib/apis/exercisedb'
import type { Exercise } from '@/types/exercise'

export interface ExerciseForAI {
  id: string
  name: string
  equipment: string[]
  bodyParts: string[]
  targetMuscles: string[]
  secondaryMuscles: string[]
}

/**
 * Fetch exercises from ExerciseDB filtered by equipment
 */
export async function fetchExercisesForWorkout(params: {
  equipment?: string[]
  limit?: number
}): Promise<ExerciseForAI[]> {
  const { equipment = [], limit = 100 } = params

  try {
    let exercises: Exercise[] = []

    // If equipment is specified, fetch exercises for each equipment type
    if (equipment.length > 0) {
      const exercisePromises = equipment.map(async (equip) => {
        try {
          return await getExercisesByEquipment({ equipment: equip, limit: 30 })
        } catch (error) {
          console.error(`Failed to fetch exercises for ${equip}:`, error)
          return []
        }
      })

      const results = await Promise.all(exercisePromises)
      exercises = results.flat()

      // Remove duplicates by exerciseId
      const uniqueExercises = Array.from(
        new Map(exercises.map((ex) => [ex.exerciseId, ex])).values()
      )
      exercises = uniqueExercises.slice(0, limit)
    } else {
      // If no equipment specified, fetch general exercises
      exercises = await getAllExercises({ limit })
    }

    // Transform to simpler format for AI
    return exercises.map((ex) => ({
      id: ex.exerciseId,
      name: ex.name,
      equipment: ex.equipments || [],
      bodyParts: ex.bodyParts || [],
      targetMuscles: ex.targetMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
    }))
  } catch (error) {
    console.error('Failed to fetch exercises from ExerciseDB:', error)
    // Return empty array on error - AI will generate names as fallback
    return []
  }
}

/**
 * Group exercises by muscle group for easier AI selection
 */
export function groupExercisesByMuscle(exercises: ExerciseForAI[]): Record<string, ExerciseForAI[]> {
  const grouped: Record<string, ExerciseForAI[]> = {}

  exercises.forEach((exercise) => {
    // Group by target muscles
    exercise.targetMuscles.forEach((muscle) => {
      if (!grouped[muscle]) {
        grouped[muscle] = []
      }
      grouped[muscle].push(exercise)
    })

    // Also group by body parts
    exercise.bodyParts.forEach((bodyPart) => {
      if (!grouped[bodyPart]) {
        grouped[bodyPart] = []
      }
      if (!grouped[bodyPart].some((ex) => ex.id === exercise.id)) {
        grouped[bodyPart].push(exercise)
      }
    })
  })

  return grouped
}

/**
 * Format exercises for AI prompt
 */
export function formatExercisesForAI(exercises: ExerciseForAI[]): string {
  const grouped = groupExercisesByMuscle(exercises)

  let formatted = '**Available Exercises from ExerciseDB:**\n\n'

  // List exercises by muscle group
  Object.entries(grouped)
    .slice(0, 15) // Limit to avoid token overflow
    .forEach(([muscleGroup, exs]) => {
      formatted += `${muscleGroup.toUpperCase()}:\n`
      exs.slice(0, 8).forEach((ex) => {
        formatted += `- ID: ${ex.id} | ${ex.name} | Equipment: ${ex.equipment.join(', ')}\n`
      })
      formatted += '\n'
    })

  formatted += `\n**IMPORTANT**: When creating exercises, use the exercise ID from above (e.g., "exerciseId": "0001").
If you cannot find a suitable exercise ID, you may create a custom exercise with "exerciseId": null and provide the name.`

  return formatted
}

/**
 * Sample exercises for quick AI prompt (when full list is too large)
 */
export function getSampleExercisesByCategory(): string {
  return `
**Sample Exercises by Category** (Use these IDs or search for similar):

CHEST:
- ID: 0001 | Barbell Bench Press | Equipment: barbell, bench
- ID: 0072 | Dumbbell Fly | Equipment: dumbbells, bench  
- ID: 0662 | Push-ups | Equipment: bodyweight

BACK:
- ID: 0027 | Barbell Bent Over Row | Equipment: barbell
- ID: 0194 | Pull-ups | Equipment: pull-up bar
- ID: 0329 | Dumbbell Row | Equipment: dumbbells, bench

LEGS:
- ID: 0043 | Barbell Squat | Equipment: barbell, squat rack
- ID: 0355 | Dumbbell Lunges | Equipment: dumbbells
- ID: 0589 | Bodyweight Squats | Equipment: bodyweight

SHOULDERS:
- ID: 0089 | Barbell Overhead Press | Equipment: barbell
- ID: 0293 | Dumbbell Lateral Raise | Equipment: dumbbells
- ID: 0434 | Pike Push-ups | Equipment: bodyweight

ARMS:
- ID: 0134 | Barbell Curl | Equipment: barbell
- ID: 0229 | Dumbbell Hammer Curl | Equipment: dumbbells
- ID: 0543 | Diamond Push-ups | Equipment: bodyweight

**Instructions**: Reference exercises by their ID (e.g., "exerciseId": "0001"). The frontend will fetch full details including GIFs.
If no suitable exercise ID exists, set "exerciseId": null and provide a descriptive "name".
`
}
