"use client";

import { useQuery } from "@tanstack/react-query";
import { usdaApi } from "@/lib/apis/usda";
import type { FoodSearchResponse, SearchFoodOptions } from "@/types/nutrition";

export function useFoodSearch(params: SearchFoodOptions, enabled = true) {
  return useQuery<FoodSearchResponse, Error>({
    queryKey: ["usda", "search", params],
    queryFn: () => usdaApi.searchFoods(params),
    enabled: enabled && Boolean(params.query?.trim()),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: (failureCount, error) => {
      if (error.message.includes("API key")) return false;
      return failureCount < 2;
    },
  });
}
