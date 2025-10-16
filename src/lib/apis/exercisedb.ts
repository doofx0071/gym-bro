/**
 * ExerciseDB V1 API Service (Self-hosted)
 * GitHub: https://github.com/ExerciseDB/exercisedb-api
 * Docs: Your Vercel deployment /docs
 */

import type {
  Exercise,
  RawExerciseFromAPI,
  RawExerciseAPIResponse,
  ExerciseSearchParams,
  ExercisesByBodyPartParams,
  ExercisesByTargetParams,
  ExercisesByEquipmentParams,
} from '@/types/exercise';

const BASE_URL = process.env.NEXT_PUBLIC_EXERCISEDB_API_URL || 'https://gym-bro-exercisedb-api-v1.vercel.app/api/v1';

// No API key needed for self-hosted V1!

/**
 * Transform raw API response to typed Exercise
 * API now returns arrays, we just need to clean up instructions
 */
function transformExercise(raw: RawExerciseFromAPI): Exercise {
  return {
    exerciseId: raw.exerciseId,
    name: raw.name,
    gifUrl: raw.gifUrl,
    // API already returns arrays, pass through as-is
    targetMuscles: raw.targetMuscles || [],
    bodyParts: raw.bodyParts || [],
    equipments: raw.equipments || [],
    secondaryMuscles: raw.secondaryMuscles || [],
    // Clean up "Step:X" prefix from each instruction
    instructions: (raw.instructions || []).map(instruction => 
      instruction.replace(/^Step[:\s]*\d+[:\s]*/i, '').trim()
    ),
  };
}

// Circuit breaker to prevent repeated failed requests
const circuitBreaker = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  threshold: 3, // Open circuit after 3 failures
  timeout: 60000, // Reset after 1 minute
  
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.isOpen = true;
      console.warn('ExerciseDB circuit breaker opened due to repeated failures');
    }
  },
  
  recordSuccess() {
    this.failureCount = 0;
    this.isOpen = false;
  },
  
  shouldAllowRequest(): boolean {
    if (!this.isOpen) return true;
    
    // Auto-reset after timeout
    if (Date.now() - this.lastFailureTime > this.timeout) {
      console.log('ExerciseDB circuit breaker reset');
      this.isOpen = false;
      this.failureCount = 0;
      return true;
    }
    
    return false;
  }
};

// Simple in-memory cache for failed requests
const failedRequestCache = new Set<string>();

/**
 * Reset circuit breaker and clear failed request cache
 * Call this when you want to give the API another chance
 */
export function resetCircuitBreaker() {
  circuitBreaker.isOpen = false;
  circuitBreaker.failureCount = 0;
  failedRequestCache.clear();
  console.log('Circuit breaker and cache reset');
}

/**
 * Get all exercises (paginated)
 * V1 API: /exercises?limit=X&offset=Y
 */
export async function getAllExercises(params?: ExerciseSearchParams): Promise<Exercise[]> {
  const { limit = 10, offset = 0 } = params || {};

  // Allow single-page fetches (offset 0) for alternatives even when circuit breaker is open
  const isSinglePageFetch = offset === 0 && limit <= 200;
  
  // Check circuit breaker (but allow single-page fetches)
  if (!isSinglePageFetch && !circuitBreaker.shouldAllowRequest()) {
    return [];
  }

  // Don't check failed cache for pagination - let each page request try
  // Only prevent repeated failures on the same page within a short time
  // if (failedRequestCache.has(cacheKey)) {
  //   return [];
  // }

  try {
    // Try with query params first, fallback to base endpoint if that fails
    let url = `${BASE_URL}/exercises?limit=${limit}&offset=${offset}`;
    let response = await fetch(url, { cache: 'no-store' });
    
    // If query params fail and this is a single-page fetch, try without params
    if (!response.ok && isSinglePageFetch) {
      url = `${BASE_URL}/exercises`;
      response = await fetch(url, { cache: 'no-store' });
    }

    if (!response.ok) {
      circuitBreaker.recordFailure();
      // Don't cache pagination failures - each page should try independently
      return [];
    }

    const json: RawExerciseAPIResponse = await response.json();
    circuitBreaker.recordSuccess();
    
    // Transform raw data to typed Exercise objects
    const transformedExercises = json.data.map(transformExercise);
    
    // No need to slice - API already returned the correct page
    return transformedExercises;
  } catch (error) {
    console.error('[getAllExercises] Exception:', error);
    circuitBreaker.recordFailure();
    return [];
  }
}

/**
 * Get a single exercise by ID
 * V1 API: /exercises/{exerciseId}
 * Returns data as an object (not array)
 */
export async function getExerciseById(id: string): Promise<Exercise> {
  const cacheKey = `exercise-${id}`;

  // Check if this request previously failed
  if (failedRequestCache.has(cacheKey)) {
    throw new Error(`Exercise ${id} previously failed to load`);
  }

  try {
    const response = await fetch(
      `${BASE_URL}/exercises/${id}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      failedRequestCache.add(cacheKey);
      throw new Error(`Failed to fetch exercise: ${response.statusText}`);
    }

    const json = await response.json();
    const rawExercise = json.data as RawExerciseFromAPI;
    return transformExercise(rawExercise);
  } catch (error) {
    failedRequestCache.add(cacheKey);
    throw error;
  }
}

/**
 * Get exercises by body part
 * V1 API: /bodyparts/{bodyPartName}/exercises
 */
export async function getExercisesByBodyPart(
  params: ExercisesByBodyPartParams
): Promise<Exercise[]> {
  const { bodyPart, limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${BASE_URL}/bodyparts/${bodyPart}/exercises?limit=${limit}&offset=${offset}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.statusText}`);
  }

  const json: RawExerciseAPIResponse = await response.json();
  return json.data.map(transformExercise);
}

/**
 * Get exercises by target muscle
 * V1 API: /muscles/{muscleName}/exercises
 */
export async function getExercisesByTarget(
  params: ExercisesByTargetParams
): Promise<Exercise[]> {
  const { target, limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${BASE_URL}/muscles/${target}/exercises?limit=${limit}&offset=${offset}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.statusText}`);
  }

  const json: RawExerciseAPIResponse = await response.json();
  return json.data.map(transformExercise);
}

/**
 * Get exercises by equipment
 * V1 API: /equipments/{equipmentName}/exercises
 */
export async function getExercisesByEquipment(
  params: ExercisesByEquipmentParams
): Promise<Exercise[]> {
  const { equipment, limit = 20, offset = 0 } = params;

  const response = await fetch(
    `${BASE_URL}/equipments/${equipment}/exercises?limit=${limit}&offset=${offset}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.statusText}`);
  }

  const json: RawExerciseAPIResponse = await response.json();
  return json.data.map(transformExercise);
}

/**
 * Search exercises by name
 * V1 API: /exercises/search?name=X
 * 
 * DISABLED: Self-hosted API does not support pagination endpoint
 */
export async function searchExercisesByName(_name: string): Promise<Exercise[]> {
  // Return empty - pagination endpoint not supported by self-hosted API
  return [];
}

/**
 * Resolve exercise by name
 * 
 * DISABLED: Self-hosted API does not support pagination/search endpoint
 */
export async function resolveExerciseByName(_name: string): Promise<Exercise | null> {
  // Return null - search functionality not supported by self-hosted API
  return null;
}

/**
 * Get exercise with retry logic (exponential backoff)
 */
export async function getExerciseWithRetry(
  id: string,
  maxRetries: number = 3
): Promise<Exercise> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getExerciseById(id);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff: 2^attempt seconds
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Fetch multiple exercises by IDs
 */
export async function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  const exercises = await Promise.all(
    ids.map((id) => getExerciseById(id).catch(() => null))
  );

  // Filter out failed fetches
  return exercises.filter((exercise): exercise is Exercise => exercise !== null);
}
