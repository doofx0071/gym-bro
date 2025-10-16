/**
 * Alternative Exercise Suggestions
 * Finds similar exercises based on target muscles, equipment, and body parts
 */

import type { Exercise } from '@/types/exercise'

export interface AlternativeExerciseParams {
  targetMuscles?: string[]
  bodyParts?: string[]
  equipments?: string[]
  excludeId?: string
  limit?: number
}

/**
 * Calculate similarity score between two exercises
 */
function calculateSimilarity(
  exercise: Exercise,
  targetMuscles: string[] = [],
  bodyParts: string[] = [],
  equipments: string[] = []
): number {
  let score = 0

  // Target muscle match (most important) - 50 points max
  if (exercise.targetMuscles && targetMuscles.length > 0) {
    const matchingMuscles = exercise.targetMuscles.filter(m => 
      targetMuscles.some(tm => tm.toLowerCase() === m.toLowerCase())
    ).length
    score += (matchingMuscles / targetMuscles.length) * 50
  }

  // Body part match - 30 points max
  if (exercise.bodyParts && bodyParts.length > 0) {
    const matchingParts = exercise.bodyParts.filter(p => 
      bodyParts.some(bp => bp.toLowerCase() === p.toLowerCase())
    ).length
    score += (matchingParts / bodyParts.length) * 30
  }

  // Equipment match - 20 points max
  if (exercise.equipments && equipments.length > 0) {
    const matchingEquipment = exercise.equipments.filter(e => 
      equipments.some(eq => eq.toLowerCase() === e.toLowerCase())
    ).length
    score += (matchingEquipment / equipments.length) * 20
  }

  return score
}

/**
 * Find alternative exercises
 */
export function findAlternatives(
  exercises: Exercise[],
  params: AlternativeExerciseParams
): Exercise[] {
  const { targetMuscles = [], bodyParts = [], equipments = [], excludeId, limit = 5 } = params

  // Filter out the current exercise
  const candidates = exercises.filter(ex => ex.exerciseId !== excludeId)

  // Calculate similarity scores
  const scored = candidates.map(exercise => ({
    exercise,
    score: calculateSimilarity(exercise, targetMuscles, bodyParts, equipments)
  }))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Filter to only include exercises with reasonable similarity (score > 20)
  const similar = scored.filter(s => s.score > 20)

  // Return top matches
  return similar.slice(0, limit).map(s => s.exercise)
}

/**
 * Get alternatives for a specific exercise by ID
 */
export async function getAlternativesForExercise(
  exerciseId: string,
  allExercises: Exercise[],
  limit: number = 5
): Promise<Exercise[]> {
  // Find the target exercise
  const targetExercise = allExercises.find(ex => ex.exerciseId === exerciseId)
  
  if (!targetExercise) {
    return []
  }

  // Find alternatives based on target exercise properties
  return findAlternatives(allExercises, {
    targetMuscles: targetExercise.targetMuscles,
    bodyParts: targetExercise.bodyParts,
    equipments: targetExercise.equipments,
    excludeId: exerciseId,
    limit
  })
}
