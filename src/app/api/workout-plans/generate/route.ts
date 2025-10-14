import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWorkoutPlan } from '@/lib/ai'
import { GenerateWorkoutPlanInputSchema } from '@/lib/validation/plans'
import { getWeekStartDate } from '@/lib/utils/date'
import type { UserProfile } from '@/types'
import type { WorkoutPlanInsert, GenerateWorkoutPlanInput } from '@/types/plans'

// Utility to map camelCase fields to snake_case database columns
function mapWorkoutPlanToDbFormat(workoutPlan: Record<string, unknown>) {
  const { daysPerWeek, schedule, ...rest } = workoutPlan
  return {
    ...rest,
    days_per_week: daysPerWeek,
    plan_data: { schedule: schedule || [] }, // Wrap schedule in plan_data object
    split: workoutPlan.split || 'full-body' // Use valid split value as default
  }
}

// Background generation function
async function generateWorkoutPlanInBackground(
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
        split: input.split || 'full-body',
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
        // Mark as failed
        await supabase
          .from('workout_plans')
          .update({ 
            status: 'failed', 
            error: 'Failed to save generated plan',
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
    // Mark as failed with exception error
    const errorMessage = error instanceof Error ? error.message : 'AI generation failed'
    
    await supabase
      .from('workout_plans')
      .update({ 
        status: 'failed', 
        error: errorMessage,
        updated_at: new Date()
      })
      .eq('id', planId)

    console.error('Background AI generation error:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const inputValidation = GenerateWorkoutPlanInputSchema.safeParse(body)
    
    if (!inputValidation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: inputValidation.error.issues 
      }, { status: 400 })
    }

    const input = inputValidation.data

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
      .eq('auth_user_id', authUser.id)
      .single()

    if (profileError || !userProfileData) {
      return NextResponse.json({ 
        error: 'User profile not found. Please complete onboarding first.' 
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

    const weekStartDate = getWeekStartDate()
    
    // Check if a plan already exists for this week
    const { data: existingPlan } = await supabase
      .from('workout_plans')
      .select('id, status')
      .eq('user_id', userProfile.id)
      .eq('week_start_date', weekStartDate.toISOString().split('T')[0])
      .single()
    
    let planId: string
    
    // If there's an existing plan (including failed ones), update it instead of creating new
    if (existingPlan) {
      const { error: updateError } = await supabase
        .from('workout_plans')
        .update({ 
          status: 'generating',
          started_at: new Date(),
          completed_at: null,
          error: null,
          updated_at: new Date(),
          title: input.title || 'Personalized Workout Plan',
          focus: input.focus || 'general',
          split: input.split || 'full-body',
          preferences: input
        })
        .eq('id', existingPlan.id)
      
      if (updateError) {
        console.error('Failed to update existing workout plan:', updateError)
        return NextResponse.json({ 
          error: 'Failed to restart workout plan generation' 
        }, { status: 500 })
      }
      
      // Use existing plan ID
      planId = existingPlan.id
    } else {
      // Create initial workout plan record with generating status
      const workoutPlanInsert: WorkoutPlanInsert = {
        user_id: userProfile.id,
        title: input.title || 'Personalized Workout Plan',
        focus: input.focus || 'general',
        split: input.split || 'full-body',
        daysPerWeek: input.daysPerWeek || 3,
        schedule: [],
        preferences: input,
        status: 'generating',
        prompt: JSON.stringify({ input, userProfile: userProfile.id }),
        started_at: new Date(),
        week_start_date: weekStartDate
      }

      const { data: workoutPlanRecord, error: insertError } = await supabase
        .from('workout_plans')
        .insert(mapWorkoutPlanToDbFormat(workoutPlanInsert))
        .select('id')
        .single()

      if (insertError || !workoutPlanRecord) {
        console.error('Failed to create workout plan record:', insertError)
        return NextResponse.json({ 
          error: 'Failed to create workout plan' 
        }, { status: 500 })
      }

      planId = workoutPlanRecord.id
    }

    // Return immediately and generate in background
    // Trigger background generation (fire and forget)
    generateWorkoutPlanInBackground(planId, input, userProfile).catch(error => {
      console.error('Background workout plan generation failed:', error)
    })

    return NextResponse.json({ 
      id: planId,
      status: 'generating'
    }, { status: 200 })

  } catch (error) {
    console.error('Workout plan generation API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}