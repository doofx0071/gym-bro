'use client'

import { CheckCircle2, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface NutritionBadgeProps {
  verified: boolean
  confidence?: 'high' | 'medium' | 'low'
  source?: string
  className?: string
}

export function NutritionBadge({ 
  verified, 
  confidence = 'high', 
  source = 'USDA FoodData Central',
  className 
}: NutritionBadgeProps) {
  if (!verified) return null

  const confidenceColors = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-orange-100 text-orange-800 border-orange-300'
  }

  const confidenceLabels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence'
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${confidenceColors[confidence]} ${className} cursor-help text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1`}
            aria-label="View USDA nutrition verification details"
          >
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 flex-shrink-0" />
            <span className="truncate">Verified</span>
            <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-0.5 sm:ml-1 flex-shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs sm:max-w-sm bg-popover text-popover-foreground border border-border">
          <div className="space-y-1.5">
            <p className="font-semibold text-sm">Nutrition Data Verified</p>
            <p className="text-xs opacity-90">
              Source: {source}
            </p>
            <p className="text-xs opacity-90">
              Confidence: {confidenceLabels[confidence]}
            </p>
            <p className="text-xs mt-2 opacity-80">
              This meal&apos;s nutrition data has been validated against verified food databases.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
