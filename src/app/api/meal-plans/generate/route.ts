import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMealPlan } from '@/lib/ai'
import { GenerateMealPlanInputSchema } from '@/lib/validation/plans'
import { getWeekStartDate } from '@/lib/utils/date'
import type { UserProfile } from '@/types'
import type { MealPlanInsert, GenerateMealPlanInput } from '@/types/plans'

// Utility to map camelCase fields to snake_case database columns
function mapMealPlanToDbFormat(mealPlan: Record<string, unknown>) {
  const { groceryList, days, ...rest } = mealPlan
  return {
    ...rest,
    grocery_list: groceryList,
    daily_calories: mealPlan.calories, // Map calories to daily_calories
    plan_data: { days: days || [] }, // Wrap days in plan_data object
    plan: days || [] // Keep the original days field as plan for backward compatibility
  }
}

// Background generation function
async function generateMealPlanInBackground(
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
        groceryList: [], // Always empty - we don't need grocery lists
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
        // Mark as failed
        await supabase
          .from('meal_plans')
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
        .from('meal_plans')
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
      .from('meal_plans')
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
    const inputValidation = GenerateMealPlanInputSchema.safeParse(body)
    
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
      .from('meal_plans')
      .select('id, status')
      .eq('user_id', userProfile.id)
      .eq('week_start_date', weekStartDate.toISOString().split('T')[0])
      .single()
    
    let planId: string
    
    // If there's an existing plan (including failed ones), update it instead of creating new
    if (existingPlan) {
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update({ 
          status: 'generating',
          started_at: new Date(),
          completed_at: null,
          error: null,
          updated_at: new Date(),
          title: input.title || 'Personalized Meal Plan',
          goal: input.goal || 'General Health',
          preferences: input
        })
        .eq('id', existingPlan.id)
      
      if (updateError) {
        console.error('Failed to update existing meal plan:', updateError)
        return NextResponse.json({ 
          error: 'Failed to restart meal plan generation' 
        }, { status: 500 })
      }
      
      // Use existing plan ID
      planId = existingPlan.id
    } else {
      // Create initial meal plan record with generating status
      const mealPlanInsert: MealPlanInsert = {
        user_id: userProfile.id,
        title: input.title || 'Personalized Meal Plan',
        goal: input.goal || 'General Health',
        calories: input.targetCalories || userProfile.targetCalories,
        macros: {
          ...userProfile.macros,
          calories: userProfile.targetCalories
        },
        days: [],
        groceryList: [],
        preferences: input,
        status: 'generating',
        prompt: JSON.stringify({ input, userProfile: userProfile.id }),
        started_at: new Date(),
        week_start_date: weekStartDate
      }

      const { data: mealPlanRecord, error: insertError } = await supabase
        .from('meal_plans')
        .insert(mapMealPlanToDbFormat(mealPlanInsert))
        .select('id')
        .single()

      if (insertError || !mealPlanRecord) {
        console.error('Failed to create meal plan record:', insertError)
        return NextResponse.json({ 
          error: 'Failed to create meal plan' 
        }, { status: 500 })
      }
      
      planId = mealPlanRecord.id
    }

    // Return immediately and generate in background
    // Trigger background generation (fire and forget)
    generateMealPlanInBackground(planId, input, userProfile).catch(error => {
      console.error('Background meal plan generation failed:', error)
    })

    return NextResponse.json({ 
      id: planId,
      status: 'generating'
    }, { status: 200 })

  } catch (error) {
    console.error('Meal plan generation API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}