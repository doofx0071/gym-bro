import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { LogSetRequest, LogSetResponse } from '@/lib/types/workout-tracking';

export async function POST(req: NextRequest) {
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

    const body = (await req.json()) as LogSetRequest;

    // Verify session belongs to user (RLS will handle this, but validate first)
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('id', body.session_id)
      .single();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data: setLog, error } = await supabase
      .from('workout_set_logs')
      .insert({
        session_id: body.session_id,
        exercise_id: body.exercise_id,
        exercise_name: body.exercise_name,
        set_number: body.set_number,
        reps: body.reps || null,
        weight_kg: body.weight_kg || null,
        rpe: body.rpe || null,
        completed: body.completed !== undefined ? body.completed : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log set:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const response: LogSetResponse = {
      success: true,
      set_log: setLog,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Set logging error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
