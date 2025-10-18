import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { CompleteSessionRequest, CompleteSessionResponse } from '@/lib/types/workout-tracking';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
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

    // Get user_profile id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const body = (await req.json()) as CompleteSessionRequest;

    // Verify session belongs to user
    const { data: existingSession } = await supabase
      .from('workout_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', profile.id)
      .single();

    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update session with completion data
    const { data: session, error } = await supabase
      .from('workout_sessions')
      .update({
        completed_at: new Date().toISOString(),
        is_completed: true,
        duration_min: body.duration_min || null,
        notes: body.notes || null,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Failed to complete session:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const response: CompleteSessionResponse = {
      success: true,
      session,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Session completion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
