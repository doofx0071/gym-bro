import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get date from query params, or default to today
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const checkDate = dateParam || new Date().toISOString().split('T')[0];
    
    // Query for completed session on the specified date (any plan)
    // This allows checking any date, not just today
    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('session_date', checkDate)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Failed to check session:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Return the most recent completed session for today (if any)
    const completedToday = sessions && sessions.length > 0 ? sessions[0] : null;

    return NextResponse.json({
      success: true,
      completed: !!completedToday,
      session: completedToday,
    });
  } catch (error) {
    console.error('Check session error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
