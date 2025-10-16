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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${confidenceColors[confidence]} ${className} cursor-help`}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
            <Info className="w-3 h-3 ml-1" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-sm">Nutrition Data Verified</p>
            <p className="text-xs text-muted-foreground">
              Source: {source}
            </p>
            <p className="text-xs text-muted-foreground">
              Confidence: {confidenceLabels[confidence]}
            </p>
            <p className="text-xs mt-2">
              This meal&apos;s nutrition data has been validated against verified food databases.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
