"use client";

import React from "react";
import { usdaApi } from "@/lib/apis/usda";
import type { FoodSearchResult } from "@/types/nutrition";

interface Props {
  food: FoodSearchResult;
}

export function FoodResultCard({ food }: Props) {
  const macros = usdaApi.extractMacros(food);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold leading-tight">
            {food.description}
          </h3>
          <div className="mt-1 text-xs text-zinc-500">
            {food.brandOwner ? `Brand: ${food.brandOwner} • ` : ""}
            Data: {food.dataType}
          </div>
          {food.ingredients && (
            <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
              Ingredients: {food.ingredients}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-medium">{Math.round(macros.calories)} kcal</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            P {Math.round(macros.protein)}g • C {Math.round(macros.carbs)}g • F {Math.round(macros.fats)}g
          </div>
          {macros.fiber !== undefined && (
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Fiber {Math.round(macros.fiber)}g</div>
          )}
        </div>
      </div>
    </div>
  );
}
