import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the existing plan to verify ownership
    const { data: existingPlan, error: planError } = await supabase
      .from('meal_plans')
      .select('id, user_id')
      .eq('id', planId)
      .single()

    if (planError || !existingPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    // Verify the plan belongs to the authenticated user's profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single()

    if (!userProfile || existingPlan.user_id !== userProfile.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this plan' }, { status: 403 })
    }

    // Delete the plan
    const { error: deleteError } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', planId)

    if (deleteError) {
      console.error('Failed to delete meal plan:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete meal plan' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Meal plan deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Meal plan deletion API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
