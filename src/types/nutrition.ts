/**
 * USDA FoodData Central API Types
 * Documentation: https://fdc.nal.usda.gov/api-guide.html
 */

export interface FoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string; // g, mg, μg, IU, kcal
  value: number;
}

export interface FoodSearchResult {
  fdcId: number;
  description: string;
  dataType: string; // Foundation, SR Legacy, Branded, Survey
  publicationDate: string;
  brandOwner?: string;
  ingredients?: string;
  foodNutrients: FoodNutrient[];
}

export interface FoodSearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageList: number[];
  foodSearchCriteria: {
    query: string;
    dataType: string[];
    pageSize: number;
    pageNumber: number;
  };
  foods: FoodSearchResult[];
}

export interface SearchFoodOptions {
  query: string;
  dataType?: ('Foundation' | 'SR Legacy' | 'Branded' | 'Survey (FNDDS)')[];
  pageSize?: number;
  pageNumber?: number;
}

// Nutrient IDs from USDA database
export const NUTRIENT_IDS = {
  // Macronutrients
  ENERGY_KCAL: 1008,
  PROTEIN: 1003,
  FAT: 1004,
  CARBOHYDRATE: 1005,
  FIBER: 1079,
  SUGARS: 2000,

  // Vitamins
  VITAMIN_A: 1106,
  VITAMIN_C: 1162,
  VITAMIN_D: 1114,
  VITAMIN_E: 1109,
  VITAMIN_K: 1183,
  THIAMIN_B1: 1165,
  RIBOFLAVIN_B2: 1166,
  NIACIN_B3: 1167,
  VITAMIN_B6: 1175,
  FOLATE_B9: 1177,
  VITAMIN_B12: 1178,

  // Minerals
  CALCIUM: 1087,
  IRON: 1089,
  MAGNESIUM: 1090,
  PHOSPHORUS: 1091,
  POTASSIUM: 1092,
  SODIUM: 1093,
  ZINC: 1095,
} as const;

// Meal ingredient validation types
export interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface ValidationResult {
  verified: boolean;
  fdcId?: number;
  actualCalories?: number;
  actualProtein?: number;
  actualCarbs?: number;
  actualFat?: number;
  fiber?: number;
  confidence: 'high' | 'medium' | 'low';
  matchedName?: string;
}

export interface MealNutrition {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  ingredients: Array<{
    name: string;
    nutrition: ValidationResult;
  }>;
}

// Meal plan types
export interface Meal {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: MealIngredient[];
  instructions?: string[];
  cookingTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  isFilipinoCuisine?: boolean;
  nutrition?: MealNutrition;
  imageUrl?: string;
}

export interface DailyMealPlan {
  date: string;
  meals: Meal[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  calorieGoal?: number;
  proteinGoal?: number;
  carbGoal?: number;
  fatGoal?: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  days: DailyMealPlan[];
  createdAt: string;
  updatedAt: string;
}

// Nutrition goals
export interface NutritionGoals {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  fiber?: number; // in grams
}

// Macro nutrient data
export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}
