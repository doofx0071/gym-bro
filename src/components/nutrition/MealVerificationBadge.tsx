'use client'

import { NutritionBadge } from './NutritionBadge'
import type { USDAValidation } from '@/types/plans'

interface MealVerificationBadgeProps {
  validation?: USDAValidation
  className?: string
}

/**
 * Displays USDA verification badge for a meal
 * Wrapper around NutritionBadge that works with our USDAValidation type
 */
export function MealVerificationBadge({ validation, className }: MealVerificationBadgeProps) {
  // Show badge for all meals that went through validation
  // Even if verification failed, show it with appropriate confidence level
  if (!validation) {
    return null
  }

  return (
    <NutritionBadge
      verified={validation.verified}
      confidence={validation.confidence}
      source="USDA FoodData Central"
      className={className}
    />
  )
}
