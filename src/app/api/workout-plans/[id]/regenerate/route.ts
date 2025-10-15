import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWorkoutPlan } from '@/lib/ai'
import type { UserProfile } from '@/types'
import type { GenerateWorkoutPlanInput } from '@/types/plans'

// Utility to map camelCase fields to snake_case database columns
function mapWorkoutPlanToDbFormat(workoutPlan: Record<string, unknown>) {
  const { schedule, daysPerWeek, ...rest } = workoutPlan
  return {
    ...rest,
    days_per_week: daysPerWeek,
    plan_data: { schedule: schedule || [] },
    schedule: schedule || []
  }
}

// Background generation function
async function regenerateWorkoutPlanInBackground(
  planId: string,
  input: GenerateWorkoutPlanInput,
  userProfile: UserProfile
) {
  const supabase = await createClient()
  
  try {
    // Generate workout plan using AI
    const aiResult = await generateWorkoutPlan(input, userProfile)
    
    if (aiResult.success) {
      // Update the workout plan record with the generated data
      const updateData = {
        title: aiResult.data.title,
        focus: aiResult.data.focus,
        daysPerWeek: aiResult.data.daysPerWeek,
        schedule: aiResult.data.schedule,
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date(),
        model: 'mistral'
      }
      
      const { error: updateError } = await supabase
        .from('workout_plans')
        .update(mapWorkoutPlanToDbFormat(updateData))
        .eq('id', planId)

      if (updateError) {
        console.error('Failed to update workout plan:', updateError)
        await supabase
          .from('workout_plans')
          .update({ 
            status: 'failed', 
            error: 'Failed to save regenerated plan',
            updated_at: new Date()
          })
          .eq('id', planId)
      }
    } else {
      // Mark as failed with AI error
      await supabase
        .from('workout_plans')
        .update({ 
          status: 'failed', 
          error: aiResult.error,
          updated_at: new Date()
        })
        .eq('id', planId)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'AI generation failed'
    
    await supabase
      .from('workout_plans')
      .update({ 
        status: 'failed', 
        error: errorMessage,
        updated_at: new Date()
      })
      .eq('id', planId)

    console.error('Background AI regeneration error:', error)
  }
}

export async function POST(
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

    // Get the existing plan
    const { data: existingPlan, error: planError } = await supabase
      .from('workout_plans')
      .select('id, user_id, preferences, title, focus, days_per_week')
      .eq('id', planId)
      .single()

    if (planError || !existingPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    // Get user profile
    const { data: userProfileData, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        height, weight, age, gender,
        fitness_level, primary_goal, activity_level,
        dietary_preference, allergies, meals_per_day,
        bmr, tdee, target_calories,
        macros_protein, macros_carbs, macros_fats,
        preferred_units
      `)
      .eq('id', existingPlan.user_id)
      .single()

    if (profileError || !userProfileData) {
      return NextResponse.json({ 
        error: 'User profile not found' 
      }, { status: 400 })
    }

    // Transform database row to UserProfile type
    const userProfile: UserProfile = {
      id: userProfileData.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      height: userProfileData.height,
      weight: userProfileData.weight,
      age: userProfileData.age,
      gender: userProfileData.gender,
      fitnessLevel: userProfileData.fitness_level,
      primaryGoal: userProfileData.primary_goal,
      activityLevel: userProfileData.activity_level,
      dietaryPreference: userProfileData.dietary_preference,
      allergies: userProfileData.allergies,
      mealsPerDay: userProfileData.meals_per_day || 3,
      bmr: userProfileData.bmr,
      tdee: userProfileData.tdee,
      targetCalories: userProfileData.target_calories,
      macros: {
        protein: userProfileData.macros_protein,
        carbs: userProfileData.macros_carbs,
        fats: userProfileData.macros_fats
      },
      preferredUnits: userProfileData.preferred_units || 'metric'
    }

    // Use existing preferences or defaults
    const input: GenerateWorkoutPlanInput = existingPlan.preferences || {
      title: existingPlan.title,
      focus: existingPlan.focus as 'strength' | 'hypertrophy' | 'endurance' | 'general',
      daysPerWeek: existingPlan.days_per_week
    }

    // Update plan status to generating
    const { error: updateError } = await supabase
      .from('workout_plans')
      .update({ 
        status: 'generating',
        started_at: new Date(),
        completed_at: null,
        error: null,
        updated_at: new Date()
      })
      .eq('id', planId)
    
    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to start regeneration' 
      }, { status: 500 })
    }

    // Trigger background generation
    regenerateWorkoutPlanInBackground(planId, input, userProfile).catch(error => {
      console.error('Background workout plan regeneration failed:', error)
    })

    return NextResponse.json({ 
      id: planId,
      status: 'generating'
    }, { status: 200 })

  } catch (error) {
    console.error('Workout plan regeneration API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
