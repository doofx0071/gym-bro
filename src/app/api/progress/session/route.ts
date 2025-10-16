import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateSessionRequest, CreateSessionResponse } from '@/lib/types/workout-tracking';

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

    // Get user_profile id (our tables reference user_profiles, not auth.users)
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

    const body = (await req.json()) as CreateSessionRequest;

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: profile.id,
        session_date: body.session_date || new Date().toISOString().split('T')[0],
        plan_label: body.plan_label || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create session:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const response: CreateSessionResponse = {
      success: true,
      session,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
