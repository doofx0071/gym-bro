// Types for Phase 5 Progress Tracking MVP

export interface WorkoutSession {
  id: string;
  user_id: string;
  session_date: string; // ISO date string
  plan_label: string | null;
  duration_min: number | null;
  notes: string | null;
  completed_at: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface WorkoutSetLog {
  id: string;
  session_id: string;
  exercise_id: string; // ExerciseDB V1 exerciseId
  exercise_name: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null; // Rate of Perceived Exertion (0-10)
  completed: boolean;
  created_at: string;
}

export interface CreateSessionRequest {
  session_date?: string; // defaults to today
  plan_label?: string;
  notes?: string;
}

export interface CreateSessionResponse {
  success: boolean;
  session: WorkoutSession;
}

export interface LogSetRequest {
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  rpe?: number;
  completed?: boolean;
}

export interface LogSetResponse {
  success: boolean;
  set_log: WorkoutSetLog;
}

export interface ExerciseHistory {
  exercise_id: string;
  exercise_name: string;
  recent_sessions: {
    session_date: string;
    sets: Array<{
      set_number: number;
      reps: number | null;
      weight_kg: number | null;
      rpe: number | null;
    }>;
  }[];
  personal_records: {
    max_weight_kg: number | null;
    max_reps: number | null;
    max_volume: number | null; // weight * reps
  };
}

export interface GetHistoryResponse {
  success: boolean;
  history: ExerciseHistory;
}

export interface CompleteSessionRequest {
  duration_min?: number;
  notes?: string;
}

export interface CompleteSessionResponse {
  success: boolean;
  session: WorkoutSession;
}
