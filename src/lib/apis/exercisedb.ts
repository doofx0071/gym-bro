/**
 * ExerciseDB V1 API Service (Self-hosted)
 * GitHub: https://github.com/ExerciseDB/exercisedb-api
 * Docs: Your Vercel deployment /docs
 */

import type {
  Exercise,
  ExerciseAPIResponse,
  ExerciseSearchParams,
  ExercisesByBodyPartParams,
  ExercisesByTargetParams,
  ExercisesByEquipmentParams,
} from '@/types/exercise';

const BASE_URL = process.env.NEXT_PUBLIC_EXERCISEDB_API_URL || 'https://gym-bro-exercisedb-api-v1.vercel.app/api/v1';

// No API key needed for self-hosted V1!

/**
 * Get all exercises (paginated)
 * V1 API: /exercises?limit=X&offset=Y
 */
export async function getAllExercises(params?: ExerciseSearchParams): Promise<Exercise[]> {
  const { limit = 10, offset = 0 } = params || {};

  const response = await fetch(
    `${BASE_URL}/exercises?limit=${limit}&offset=${offset}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.statusText}`);
  }

  const json: ExerciseAPIResponse = await response.json();
  return json.data;
}

/**
 * Get a single exercise by ID
 * V1 API: /exercises/{exerciseId}
 * Returns data as an object (not array)
 */
export async function getExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(
    `${BASE_URL}/exercises/${id}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch exercise: ${response.statusText}`);
  }

  const json = await response.json();
  return json.data as Exercise; // V1 returns data as object for single exercise
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

  const json: ExerciseAPIResponse = await response.json();
  return json.data;
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

  const json: ExerciseAPIResponse = await response.json();
  return json.data;
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

  const json: ExerciseAPIResponse = await response.json();
  return json.data;
}

/**
 * Search exercises by name
 * V1 API: /exercises/search?name=X
 */
export async function searchExercisesByName(name: string): Promise<Exercise[]> {
  const response = await fetch(
    `${BASE_URL}/exercises/search?name=${encodeURIComponent(name)}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Failed to search exercises: ${response.statusText}`);
  }

  const json: ExerciseAPIResponse = await response.json();
  return json.data;
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
