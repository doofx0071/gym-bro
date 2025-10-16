// Nutrition calculation helpers
// Scales nutrient values by gram weight and aggregates across ingredients

import type { MacroNutrients } from "@/types/nutrition";

export function sumMacros(list: MacroNutrients[]): MacroNutrients {
  return list.reduce<MacroNutrients>((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fats: acc.fats + (m.fats || 0),
    fiber: (acc.fiber || 0) + (m.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
}

// Unit conversion to grams
export function toGrams(quantity: number, unit: string): number {
  const u = unit.trim().toLowerCase();
  switch (u) {
    case "g":
    case "gram":
    case "grams":
      return quantity;
    case "kg":
    case "kilogram":
    case "kilograms":
      return quantity * 1000;
    case "mg":
    case "milligram":
    case "milligrams":
      return quantity / 1000;
    case "oz":
    case "ounce":
    case "ounces":
      return quantity * 28.3495;
    case "lb":
    case "lbs":
    case "pound":
    case "pounds":
      return quantity * 453.592;
    default:
      // Unknown unit: treat as grams to avoid NaN, caller should sanitize
      return quantity;
  }
}

// Scale per-100g macros to given grams
export function scalePer100g(macros: MacroNutrients, grams: number): MacroNutrients {
  const factor = grams / 100;
  return {
    calories: macros.calories * factor,
    protein: macros.protein * factor,
    carbs: macros.carbs * factor,
    fats: macros.fats * factor,
    fiber: (macros.fiber || 0) * factor,
  };
}
