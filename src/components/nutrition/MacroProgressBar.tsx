'use client'

import { Progress } from '@/components/ui/progress'
import type { MacroNutrition } from '@/types/plans'

interface MacroProgressBarProps {
  current: MacroNutrition
  target?: MacroNutrition
  showCalories?: boolean
  className?: string
}

export function MacroProgressBar({ 
  current, 
  target, 
  showCalories = true,
  className 
}: MacroProgressBarProps) {
  const calculateProgress = (currentValue: number, targetValue?: number) => {
    if (!targetValue || targetValue === 0) return 0
    return Math.min((currentValue / targetValue) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95 && percentage <= 105) return 'bg-green-500'
    if (percentage >= 85 && percentage <= 115) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const proteinProgress = target?.protein ? calculateProgress(current.protein, target.protein) : 0
  const carbsProgress = target?.carbs ? calculateProgress(current.carbs, target.carbs) : 0
  const fatsProgress = target?.fats ? calculateProgress(current.fats, target.fats) : 0
  const caloriesProgress = target?.calories ? calculateProgress(current.calories, target.calories) : 0

  return (
    <div className={`space-y-4 ${className}`}>
      {showCalories && target?.calories && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(current.calories)} / {Math.round(target.calories)} kcal
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={caloriesProgress} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(caloriesProgress)}`}
              style={{ width: `${caloriesProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-red-600">Protein</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(current.protein)}g{target?.protein ? ` / ${Math.round(target.protein)}g` : ''}
          </span>
        </div>
        {target?.protein && (
          <div className="relative">
            <Progress 
              value={proteinProgress} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(proteinProgress)}`}
              style={{ width: `${proteinProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-yellow-600">Carbs</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(current.carbs)}g{target?.carbs ? ` / ${Math.round(target.carbs)}g` : ''}
          </span>
        </div>
        {target?.carbs && (
          <div className="relative">
            <Progress 
              value={carbsProgress} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(carbsProgress)}`}
              style={{ width: `${carbsProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-blue-600">Fats</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(current.fats)}g{target?.fats ? ` / ${Math.round(target.fats)}g` : ''}
          </span>
        </div>
        {target?.fats && (
          <div className="relative">
            <Progress 
              value={fatsProgress} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(fatsProgress)}`}
              style={{ width: `${fatsProgress}%` }}
            />
          </div>
        )}
      </div>

      {target && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Progress indicators: 
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mx-1" /> On target (95-105%)
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mx-1" /> Close (85-115%)
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mx-1" /> Off target
          </p>
        </div>
      )}
    </div>
  )
}
