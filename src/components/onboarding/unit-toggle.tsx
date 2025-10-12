"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Units } from "@/types"

interface UnitToggleProps {
  value: Units
  onChange: (value: Units) => void
  className?: string
}

export function UnitToggle({ value, onChange, className }: UnitToggleProps) {
  return (
    <div className={cn("inline-flex rounded-lg border p-1 bg-muted", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "px-4 rounded-md transition-colors",
          value === "metric"
            ? "bg-background shadow-sm"
            : "hover:bg-transparent"
        )}
        onClick={() => onChange("metric")}
      >
        Metric
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "px-4 rounded-md transition-colors",
          value === "imperial"
            ? "bg-background shadow-sm"
            : "hover:bg-transparent"
        )}
        onClick={() => onChange("imperial")}
      >
        Imperial
      </Button>
    </div>
  )
}

