/**
 * ExerciseDB API Types
 * Based on ExerciseDB v2.2 API structure
 * Documentation: https://edb-docs.up.railway.app/
 */

// Raw API Response (API now returns arrays!)
export interface RawExerciseFromAPI {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];        // API returns ["upper back"]
  bodyParts: string[];            // API returns ["back"]
  equipments: string[];           // API returns ["body weight"]
  secondaryMuscles: string[];     // API returns ["biceps", "forearms"]
  instructions: string[];         // API returns ["Step:1 ...", "Step:2 ..."]
}

// Transformed Exercise (arrays for easier use)
export interface Exercise {
  exerciseId: string;             // e.g., "VPPtusI"
  name: string;
  gifUrl: string;                 // GIF URL - ALWAYS included in V1!
  targetMuscles: string[];        // Primary muscles: ["upper back"]
  bodyParts: string[];            // Body parts: ["back"]
  equipments: string[];           // Equipment: ["body weight"]
  secondaryMuscles: string[];     // Secondary muscles
  instructions: string[];         // Step-by-step instructions
}

// V1 API Response Structure (raw from API)
export interface RawExerciseAPIResponse {
  success: boolean;
  metadata: {
    totalPages: number;
    totalExercises: number;
    currentPage: number;
    previousPage: string | null;
    nextPage: string | null;
  };
  data: RawExerciseFromAPI[];
}

// Processed API Response (transformed for use)
export interface ExerciseAPIResponse {
  success: boolean;
  metadata: {
    totalPages: number;
    totalExercises: number;
    currentPage: number;
    previousPage: string | null;
    nextPage: string | null;
  };
  data: Exercise[];
}

export interface ExerciseSearchParams {
  limit?: number;
  offset?: number;
}

export interface ExercisesByBodyPartParams {
  bodyPart: string;
  limit?: number;
  offset?: number;
}

export interface ExercisesByTargetParams {
  target: string;
  limit?: number;
  offset?: number;
}

export interface ExercisesByEquipmentParams {
  equipment: string;
  limit?: number;
  offset?: number;
}

// Workout plan related types
export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number | string; // Can be "8-10" or just 10
  restPeriod?: number; // Rest period in seconds
  notes?: string;
}

export interface WorkoutDay {
  day: number;
  dayLabel: string; // "Chest & Shoulders Day", "Pull Day", etc.
  targetMuscleGroups: string[];
  exercises: WorkoutExercise[];
  estimatedDuration?: number; // In minutes
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  splitType: 'full_body' | 'upper_lower' | 'ppl' | 'bro_split' | 'custom';
  daysPerWeek: number;
  workoutDays: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}
