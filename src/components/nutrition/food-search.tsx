"use client";

import React from "react";
import { useFoodSearch } from "@/hooks/use-usda";
import { FoodResultCard } from "@/components/nutrition/food-result-card";

export function FoodSearch({ defaultQuery = "chicken breast" }: { defaultQuery?: string }) {
  const [query, setQuery] = React.useState(defaultQuery);
  const { data, isLoading, isError, error, refetch, isFetching } = useFoodSearch(
    { query, pageSize: 10, dataType: ["Foundation", "SR Legacy", "Branded"] },
    true
  );

  return (
    <div className="space-y-4">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          refetch();
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods (e.g., chicken adobo, boiled egg, rice)"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
        />
        <button
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={isFetching}
          type="submit"
        >
          {isFetching ? "Searching..." : "Search"}
        </button>
      </form>

      {isLoading && <div className="text-sm text-zinc-500">Loading results...</div>}
      {isError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          Error: {error?.message}
        </div>
      )}

      {data && (
        <div className="space-y-3">
          <div className="text-xs text-zinc-500">
            {data.totalHits.toLocaleString()} results • Page {data.currentPage} of {data.totalPages}
          </div>
          {data.foods.map((food) => (
            <FoodResultCard key={food.fdcId} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
