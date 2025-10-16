"use client";

import React from "react";
import { validateMeal } from "@/lib/nutrition/validate";
import type { MealIngredient, MealNutrition } from "@/types/nutrition";

const defaultIngredients: MealIngredient[] = [
  { name: "chicken breast", quantity: 200, unit: "g" },
  { name: "white rice", quantity: 180, unit: "g" },
];

export function MealValidator() {
  const [items, setItems] = React.useState<MealIngredient[]>(defaultIngredients);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<MealNutrition | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const updateItem = (idx: number, patch: Partial<MealIngredient>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { name: "", quantity: 100, unit: "g" }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const onValidate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await validateMeal(items);
      setResult(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Validation failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-8">
            <input
              className="md:col-span-5 rounded-md border px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="Ingredient (e.g., chicken adobo)"
              value={it.name}
              onChange={(e) => updateItem(idx, { name: e.target.value })}
            />
            <input
              className="md:col-span-1 rounded-md border px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              type="number"
              value={it.quantity}
              onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
            />
            <select
              className="md:col-span-1 rounded-md border px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              value={it.unit}
              onChange={(e) => updateItem(idx, { unit: e.target.value })}
            >
              <option>g</option>
              <option>oz</option>
              <option>kg</option>
              <option>mg</option>
              <option>lb</option>
            </select>
            <button
              onClick={() => removeItem(idx)}
              className="md:col-span-1 rounded-md border px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Remove
            </button>
          </div>
        ))}
        <button onClick={addItem} className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
          + Add ingredient
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onValidate}
          disabled={loading}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Validating..." : "Validate meal"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2 text-sm">
          <div className="font-semibold">Totals</div>
          <div>Calories: {Math.round(result.totalCalories)} kcal</div>
          <div>
            Macros: P {Math.round(result.totalProtein)} g • C {Math.round(result.totalCarbs)} g • F {Math.round(result.totalFat)} g
          </div>
          <div>Fiber: {Math.round(result.totalFiber)} g</div>
          <div className="mt-2 space-y-1">
            <div className="font-semibold">Ingredients</div>
            {result.ingredients.map((r, i) => (
              <div key={i} className="rounded-md border p-2 dark:border-zinc-800">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-zinc-500">Match: {r.nutrition.matchedName || "-"} ({r.nutrition.confidence})</div>
                <div className="text-xs">
                  {Math.round(r.nutrition.actualCalories || 0)} kcal • P {Math.round(r.nutrition.actualProtein || 0)}g • C {Math.round(r.nutrition.actualCarbs || 0)}g • F {Math.round(r.nutrition.actualFat || 0)}g
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
