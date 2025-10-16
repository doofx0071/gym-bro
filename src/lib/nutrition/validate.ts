// Ingredient and meal validation using USDA API search

import { usdaApi } from "@/lib/apis/usda";
import { type MealIngredient, type ValidationResult, type MealNutrition, type MacroNutrients } from "@/types/nutrition";
import { toGrams, scalePer100g, sumMacros } from "./calculate";

// Simple token-based similarity scoring
function similarity(a: string, b: string): number {
  const ta = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const tb = new Set(b.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  ta.forEach((t) => { if (tb.has(t)) inter++; });
  const union = new Set<string>([...ta, ...tb]).size;
  return inter / union; // Jaccard
}

export async function validateIngredient(ing: MealIngredient): Promise<ValidationResult> {
  const query = ing.name.trim();
  if (!query) return { verified: false, confidence: "low" };

  // Prefer Foundation and SR Legacy datasets for consistency
  const resp = await usdaApi.searchFoods({ query, dataType: ["Foundation", "SR Legacy"], pageSize: 10, pageNumber: 1 });
  const foods = resp.foods || [];
  if (foods.length === 0) return { verified: false, confidence: "low" };

  // Rank by name similarity and presence of common words
  const ranked = foods
    .map((f) => ({ f, score: similarity(query, f.description) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const macrosPer100: MacroNutrients = usdaApi.extractMacros(best.f);

  const grams = toGrams(ing.quantity, ing.unit);
  const scaled = scalePer100g(macrosPer100, grams);

  const confidence: ValidationResult["confidence"] = best.score > 0.6 ? "high" : best.score > 0.35 ? "medium" : "low";

  return {
    verified: confidence !== "low",
    fdcId: best.f.fdcId,
    actualCalories: scaled.calories,
    actualProtein: scaled.protein,
    actualCarbs: scaled.carbs,
    actualFat: scaled.fats,
    fiber: scaled.fiber,
    confidence,
    matchedName: best.f.description,
  };
}

export async function validateMeal(ingredients: MealIngredient[]): Promise<MealNutrition> {
  const results = await Promise.all(
    ingredients.map(async (ing) => ({ name: ing.name, nutrition: await validateIngredient(ing) }))
  );

  const totals = sumMacros(
    results.map((r) => ({
      calories: r.nutrition.actualCalories || 0,
      protein: r.nutrition.actualProtein || 0,
      carbs: r.nutrition.actualCarbs || 0,
      fats: r.nutrition.actualFat || 0,
      fiber: r.nutrition.fiber || 0,
    }))
  );

  return {
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalCarbs: totals.carbs,
    totalFat: totals.fats,
    totalFiber: totals.fiber || 0,
    ingredients: results,
  };
}
