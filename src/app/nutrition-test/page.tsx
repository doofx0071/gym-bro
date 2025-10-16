import React from "react";
import { FoodSearch } from "@/components/nutrition/food-search";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">USDA Nutrition Search Test</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Try queries like &quot;chicken adobo&quot;, &quot;boiled egg&quot;, &quot;white rice&quot; to validate nutrition lookup.
        </p>
      </div>
      <FoodSearch defaultQuery="chicken breast" />
    </main>
  );
}
