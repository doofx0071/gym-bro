/**
 * USDA Meal Plan Validation Service
 * 
 * Validates AI-generated meal plans against USDA FoodData Central API
 * to ensure accurate nutrition information and provide verification badges.
 */

import { usdaApi } from '@/lib/apis/usda'
import type { MealPlanPayload, MealDetail, USDAValidation, DayMeals } from '@/types/plans'

/**
 * Extracts ingredient names from ingredient strings
 * Example: "2 cups rice" -> "rice"
 */
function extractIngredientName(ingredientString: string): string {
  // Remove quantities and common units
  const cleaned = ingredientString
    .replace(/^\d+(\.\d+)?\s*(cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l|piece|pieces|slice|slices)?\s+/i, '')
    .replace(/^\d+\/\d+\s+/, '') // Remove fractions like "1/2"
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .trim()
  
  // Take first word or two (usually the main ingredient)
  const words = cleaned.split(/[\s,]+/)
  return words.slice(0, 2).join(' ')
}

/**
 * Validates a single meal's ingredients against USDA database
 */
async function validateMeal(meal: MealDetail): Promise<USDAValidation> {
  try {
    // Try to search for the meal name in USDA
    const mealResults = await usdaApi.searchFoods({
      query: meal.name,
      dataType: ['SR Legacy', 'Foundation'],
      pageSize: 1
    })

    if (mealResults.foods && mealResults.foods.length > 0) {
      const food = mealResults.foods[0]
      const macros = usdaApi.extractMacros(food)
      
      // Calculate confidence based on how close the USDA data matches AI data
      const caloriesDiff = Math.abs(macros.calories - meal.calories)
      const proteinDiff = Math.abs(macros.protein - meal.macros.protein)
      
      let confidence: 'high' | 'medium' | 'low' = 'low'
      if (caloriesDiff < meal.calories * 0.1 && proteinDiff < meal.macros.protein * 0.15) {
        confidence = 'high'
      } else if (caloriesDiff < meal.calories * 0.25) {
        confidence = 'medium'
      }

      return {
        fdcId: food.fdcId,
        verified: true,
        actualCalories: macros.calories,
        actualProtein: macros.protein,
        actualCarbs: macros.carbs,
        actualFat: macros.fats,
        confidence
      }
    }

    // If direct meal search fails, try validating main ingredients
    if (meal.ingredients.length > 0) {
      const mainIngredient = extractIngredientName(meal.ingredients[0])
      const ingredientResults = await usdaApi.searchFoods({
        query: mainIngredient,
        dataType: ['SR Legacy', 'Foundation'],
        pageSize: 1
      })

      if (ingredientResults.foods && ingredientResults.foods.length > 0) {
        const food = ingredientResults.foods[0]
        const macros = usdaApi.extractMacros(food)
        
        return {
          fdcId: food.fdcId,
          verified: true,
          actualCalories: macros.calories,
          actualProtein: macros.protein,
          actualCarbs: macros.carbs,
          actualFat: macros.fats,
          confidence: 'medium' // Medium confidence for ingredient-based validation
        }
      }
    }

    // No match found
    return {
      verified: false,
      confidence: 'low'
    }
  } catch (error) {
    console.error(`USDA validation error for meal "${meal.name}":`, error)
    return {
      verified: false,
      confidence: 'low'
    }
  }
}

/**
 * Validates an entire meal plan by validating each meal
 * Returns the updated meal plan with USDA validation data
 */
export async function validateMealPlan(mealPlan: MealPlanPayload): Promise<{
  validatedPlan: MealPlanPayload
  overallConfidence: number
  validatedCount: number
  totalMeals: number
}> {
  const validatedDays: DayMeals[] = []
  let totalMeals = 0
  let validatedCount = 0
  let totalConfidence = 0

  for (const day of mealPlan.days) {
    const validatedMeals: MealDetail[] = []
    
    for (const meal of day.meals) {
      totalMeals++
      
      // Validate meal against USDA
      const validation = await validateMeal(meal)
      
      // Track validation stats
      if (validation.verified) {
        validatedCount++
        
        // Convert confidence to numeric for averaging
        const confidenceValue = validation.confidence === 'high' ? 100 :
                               validation.confidence === 'medium' ? 60 : 20
        totalConfidence += confidenceValue
      } else {
        totalConfidence += 20 // Low confidence
      }
      
      // Add validation data to meal
      validatedMeals.push({
        ...meal,
        usdaValidation: validation
      })
      
      // Add small delay to avoid rate limiting (50ms between requests)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    validatedDays.push({
      ...day,
      meals: validatedMeals
    })
  }

  const overallConfidence = totalMeals > 0 ? Math.round(totalConfidence / totalMeals) : 0

  return {
    validatedPlan: {
      ...mealPlan,
      days: validatedDays
    },
    overallConfidence,
    validatedCount,
    totalMeals
  }
}

/**
 * Quick validation check for a single day (used for dashboard previews)
 */
export async function validateDayMeals(day: DayMeals): Promise<DayMeals> {
  const validatedMeals: MealDetail[] = []
  
  for (const meal of day.meals) {
    const validation = await validateMeal(meal)
    validatedMeals.push({
      ...meal,
      usdaValidation: validation
    })
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  return {
    ...day,
    meals: validatedMeals
  }
}
