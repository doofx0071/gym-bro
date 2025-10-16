import React from "react";
import { MealValidator } from "@/components/nutrition/meal-validator";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Meal Nutrition Validation Test</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Enter ingredients and validate using USDA. Units supported: g, oz, kg, mg, lb.
        </p>
      </div>
      <MealValidator />
    </main>
  );
}
