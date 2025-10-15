import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMealPlan } from '@/lib/ai'
import type { UserProfile } from '@/types'
import type { GenerateMealPlanInput } from '@/types/plans'

// Utility to map camelCase fields to snake_case database columns
function mapMealPlanToDbFormat(mealPlan: Record<string, unknown>) {
  const { groceryList, days, ...rest } = mealPlan
  return {
    ...rest,
    grocery_list: groceryList,
    daily_calories: mealPlan.calories,
    plan_data: { days: days || [] },
    plan: days || []
  }
}

// Background generation function
async function regenerateMealPlanInBackground(
  planId: string,
  input: GenerateMealPlanInput,
  userProfile: UserProfile
) {
  const supabase = await createClient()
  
  try {
    // Generate meal plan using AI
    const aiResult = await generateMealPlan(input, userProfile)
    
    if (aiResult.success) {
      // Update the meal plan record with the generated data
      const updateData = {
        title: aiResult.data.title,
        goal: aiResult.data.goal,
        calories: aiResult.data.calories,
        macros: aiResult.data.macros,
        days: aiResult.data.days,
        groceryList: [],
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date(),
        model: 'mistral'
      }
      
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update(mapMealPlanToDbFormat(updateData))
        .eq('id', planId)

      if (updateError) {
        console.error('Failed to update meal plan:', updateError)
        await supabase
          .from('meal_plans')
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
        .from('meal_plans')
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
      .from('meal_plans')
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
      .from('meal_plans')
      .select('id, user_id, preferences, title, goal, calories')
      .eq('id', planId)
      .single()

    if (planError || !existingPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
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
    const input: GenerateMealPlanInput = existingPlan.preferences || {
      title: existingPlan.title,
      goal: existingPlan.goal,
      targetCalories: existingPlan.calories
    }

    // Update plan status to generating
    const { error: updateError } = await supabase
      .from('meal_plans')
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
    regenerateMealPlanInBackground(planId, input, userProfile).catch(error => {
      console.error('Background meal plan regeneration failed:', error)
    })

    return NextResponse.json({ 
      id: planId,
      status: 'generating'
    }, { status: 200 })

  } catch (error) {
    console.error('Meal plan regeneration API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
