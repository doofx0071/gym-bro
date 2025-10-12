import type { 
  Gender, 
  ActivityLevel, 
  PrimaryGoal, 
  MacroBreakdown 
} from '@/types'

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * BMR is the number of calories your body needs at rest
 * 
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @param age - Age in years
 * @param gender - Gender
 * @returns BMR in calories/day
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  // Mifflin-St Jeor Equation
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  
  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age)
  
  if (gender === 'male') {
    return Math.round(baseBMR + 5)
  } else if (gender === 'female') {
    return Math.round(baseBMR - 161)
  } else {
    // For 'other' or 'prefer-not-to-say', use average
    return Math.round(baseBMR - 78)
  }
}

/**
 * Get activity multiplier for TDEE calculation
 */
function getActivityMultiplier(activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    'sedentary': 1.2,           // Little to no exercise
    'lightly-active': 1.375,    // 1-3 days/week
    'moderately-active': 1.55,  // 3-5 days/week
    'very-active': 1.725,       // 6-7 days/week
    'extremely-active': 1.9     // Athlete/physical job
  }
  
  return multipliers[activityLevel]
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE is the total calories you burn in a day including activity
 * 
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level
 * @returns TDEE in calories/day
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  const multiplier = getActivityMultiplier(activityLevel)
  return Math.round(bmr * multiplier)
}

/**
 * Calculate target calories based on goal
 * 
 * @param tdee - Total Daily Energy Expenditure
 * @param goal - Primary fitness goal
 * @returns Target calories/day
 */
export function calculateTargetCalories(
  tdee: number,
  goal: PrimaryGoal
): number {
  const adjustments: Record<PrimaryGoal, number> = {
    'weight-loss': -500,      // 500 calorie deficit (1 lb/week loss)
    'muscle-gain': 300,       // 300 calorie surplus (lean bulk)
    'maintenance': 0,         // No change
    'athletic': 200,          // Slight surplus for performance
    'general': 0              // Maintenance
  }
  
  const adjustment = adjustments[goal]
  return Math.round(tdee + adjustment)
}

/**
 * Calculate macronutrient breakdown
 * 
 * @param targetCalories - Target daily calories
 * @param goal - Primary fitness goal
 * @returns Macro breakdown in grams
 */
export function calculateMacros(
  targetCalories: number,
  goal: PrimaryGoal,
  weight: number
): MacroBreakdown {
  let proteinRatio: number
  let fatRatio: number
  let carbRatio: number
  
  // Adjust macro ratios based on goal
  switch (goal) {
    case 'weight-loss':
      // Higher protein to preserve muscle, moderate fat, lower carbs
      proteinRatio = 0.35  // 35%
      fatRatio = 0.30      // 30%
      carbRatio = 0.35     // 35%
      break
      
    case 'muscle-gain':
      // High protein, moderate carbs for energy, moderate fat
      proteinRatio = 0.30  // 30%
      fatRatio = 0.25      // 25%
      carbRatio = 0.45     // 45%
      break
      
    case 'athletic':
      // Balanced with higher carbs for performance
      proteinRatio = 0.25  // 25%
      fatRatio = 0.25      // 25%
      carbRatio = 0.50     // 50%
      break
      
    case 'maintenance':
    case 'general':
    default:
      // Balanced macros
      proteinRatio = 0.30  // 30%
      fatRatio = 0.30      // 30%
      carbRatio = 0.40     // 40%
      break
  }
  
  // Calculate grams
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fats: 9 calories per gram
  
  const proteinCalories = targetCalories * proteinRatio
  const fatCalories = targetCalories * fatRatio
  const carbCalories = targetCalories * carbRatio
  
  const protein = Math.round(proteinCalories / 4)
  const fats = Math.round(fatCalories / 9)
  const carbs = Math.round(carbCalories / 4)
  
  // Ensure minimum protein intake (1g per kg body weight)
  const minProtein = Math.round(weight)
  
  return {
    protein: Math.max(protein, minProtein),
    carbs,
    fats
  }
}

/**
 * Calculate all metrics at once
 */
export function calculateAllMetrics(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: PrimaryGoal
) {
  const bmr = calculateBMR(weight, height, age, gender)
  const tdee = calculateTDEE(bmr, activityLevel)
  const targetCalories = calculateTargetCalories(tdee, goal)
  const macros = calculateMacros(targetCalories, goal, weight)
  
  return {
    bmr,
    tdee,
    targetCalories,
    macros
  }
}

/**
 * Unit conversion utilities
 */

// Height conversions
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = (feet * 12) + inches
  return Math.round(totalInches * 2.54)
}

// Weight conversions
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462)
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462)
}

/**
 * Validation utilities
 */

export function validateHeight(cm: number): boolean {
  // Valid height range: 120cm (3'11") to 250cm (8'2")
  return cm >= 120 && cm <= 250
}

export function validateWeight(kg: number): boolean {
  // Valid weight range: 30kg (66lbs) to 300kg (661lbs)
  return kg >= 30 && kg <= 300
}

export function validateAge(age: number): boolean {
  // Valid age range: 18 to 100
  return age >= 18 && age <= 100
}

export function validateMealsPerDay(meals: number): boolean {
  // Valid meals per day: 3 to 6
  return meals >= 3 && meals <= 6
}

