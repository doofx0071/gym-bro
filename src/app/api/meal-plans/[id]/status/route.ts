import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to verify ownership
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get plan status
    const { data: plan, error } = await supabase
      .from('meal_plans')
      .select('id, title, status, error, started_at, completed_at, updated_at')
      .eq('id', resolvedParams.id)
      .eq('user_id', userProfile.id)
      .single()

    if (error || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Calculate progress based on status and timing
    let progress = 0
    if (plan.status === 'generating') {
      // Estimate progress based on time elapsed (assuming 30-60 seconds for generation)
      if (plan.started_at) {
        const elapsed = Date.now() - new Date(plan.started_at).getTime()
        const estimatedTotal = 45000 // 45 seconds estimated
        progress = Math.min(90, Math.floor((elapsed / estimatedTotal) * 100))
      }
    } else if (plan.status === 'completed') {
      progress = 100
    } else if (plan.status === 'failed') {
      progress = 0
    }

    return NextResponse.json({
      id: plan.id,
      title: plan.title,
      status: plan.status,
      progress,
      error: plan.error,
      started_at: plan.started_at,
      completed_at: plan.completed_at,
      updated_at: plan.updated_at
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}