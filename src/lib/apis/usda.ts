import { NUTRIENT_IDS, type FoodSearchResponse, type SearchFoodOptions } from "@/types/nutrition";

const BASE_URL = process.env.NEXT_PUBLIC_USDA_API_BASE_URL || "https://api.nal.usda.gov/fdc";
const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;

if (!API_KEY) {
  // Don't throw on import; callers will see a clear error on request
  // This avoids SSR import crashes when env isn't loaded yet.
  console.warn("USDA API key is not set. Set NEXT_PUBLIC_USDA_API_KEY in .env.local");
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY || "");
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export class USDAApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "USDAApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new USDAApiError(text || `USDA request failed with ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const usdaApi = {
  // Search foods by query
  async searchFoods(options: SearchFoodOptions): Promise<FoodSearchResponse> {
    if (!API_KEY) throw new USDAApiError("USDA API key missing. Configure .env.local.");

    const { query, dataType, pageNumber = 1, pageSize = 25 } = options;
    const url = buildUrl("/v1/foods/search", {
      query,
      dataType: dataType?.join(","),
      pageNumber,
      pageSize,
    });

    const res = await fetch(url, { cache: "no-store" });
    return handleResponse<FoodSearchResponse>(res);
  },

  // Convenience: extract macros from a food's nutrient list
  extractMacros(food: { foodNutrients?: Array<{ nutrientId: number; value: number }> }) {
    const nutrients = food.foodNutrients || [];
    const byId = (id: number) => nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
    return {
      calories: byId(NUTRIENT_IDS.ENERGY_KCAL),
      protein: byId(NUTRIENT_IDS.PROTEIN),
      carbs: byId(NUTRIENT_IDS.CARBOHYDRATE),
      fats: byId(NUTRIENT_IDS.FAT),
      fiber: byId(NUTRIENT_IDS.FIBER),
    } as const;
  },
};
