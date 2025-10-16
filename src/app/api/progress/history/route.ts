import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { GetHistoryResponse } from '@/lib/types/workout-tracking';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const exerciseId = req.nextUrl.searchParams.get('exercise_id');
    if (!exerciseId) {
      return NextResponse.json(
        { success: false, error: 'Missing exercise_id' },
        { status: 400 }
      );
    }

    // Get last 10 sessions containing this exercise
    const { data: rows, error } = await supabase
      .from('workout_set_logs')
      .select(`
        session_id,
        exercise_id,
        exercise_name,
        set_number,
        reps,
        weight_kg,
        rpe,
        created_at,
        workout_sessions!inner(session_date)
      `)
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Group by session_date
    interface WorkoutSessionData {
      session_date: string;
    }
    
    interface SetLogWithSession {
      session_id: string;
      exercise_id: string;
      exercise_name: string;
      set_number: number;
      reps: number;
      weight_kg: number | null;
      rpe: number | null;
      created_at: string;
      workout_sessions: WorkoutSessionData;
    }
    
    const byDate = new Map<string, Array<{ set_number: number; reps: number; weight_kg: number | null; rpe: number | null }>>();
    for (const r of rows ?? []) {
      const row = r as unknown as SetLogWithSession;
      const date = row.workout_sessions.session_date;
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push({
        set_number: r.set_number,
        reps: r.reps,
        weight_kg: r.weight_kg,
        rpe: r.rpe,
      });
    }

    // Compute simple PRs
    let max_weight_kg: number | null = null;
    let max_reps: number | null = null;
    let max_volume: number | null = null;

    for (const r of rows ?? []) {
      const w = r.weight_kg ?? 0;
      const reps = r.reps ?? 0;
      const vol = w * reps;
      if (max_weight_kg === null || w > max_weight_kg) max_weight_kg = w;
      if (max_reps === null || reps > max_reps) max_reps = reps;
      if (max_volume === null || vol > max_volume) max_volume = vol;
    }

    const history = {
      exercise_id: exerciseId,
      exercise_name: rows?.[0]?.exercise_name ?? '',
      recent_sessions: Array.from(byDate.entries()).slice(0, 10).map(([session_date, sets]) => ({
        session_date,
        sets,
      })),
      personal_records: { max_weight_kg, max_reps, max_volume },
    };

    const response: GetHistoryResponse = { success: true, history };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
