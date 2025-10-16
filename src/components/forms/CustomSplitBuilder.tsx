'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import type { CustomSplitDay } from '@/types/plans'

const MUSCLE_GROUPS = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'glutes',
  'calves'
]

interface CustomSplitBuilderProps {
  value?: CustomSplitDay[]
  onChange: (splitDays: CustomSplitDay[]) => void
  maxDays?: number
}

export function CustomSplitBuilder({ value = [], onChange, maxDays = 7 }: CustomSplitBuilderProps) {
  const [splitDays, setSplitDays] = useState<CustomSplitDay[]>(
    value.length > 0 ? value : [{ dayNumber: 1, label: 'Day 1', muscleGroups: [] }]
  )

  const addDay = () => {
    if (splitDays.length >= maxDays) return
    
    const newDay: CustomSplitDay = {
      dayNumber: splitDays.length + 1,
      label: `Day ${splitDays.length + 1}`,
      muscleGroups: []
    }
    const updated = [...splitDays, newDay]
    setSplitDays(updated)
    onChange(updated)
  }

  const removeDay = (index: number) => {
    if (splitDays.length <= 1) return
    
    const updated = splitDays.filter((_, i) => i !== index)
      .map((day, i) => ({
        ...day,
        dayNumber: i + 1,
        label: `Day ${i + 1}`
      }))
    setSplitDays(updated)
    onChange(updated)
  }

  const updateDayLabel = (index: number, label: string) => {
    const updated = splitDays.map((day, i) => 
      i === index ? { ...day, label } : day
    )
    setSplitDays(updated)
    onChange(updated)
  }

  const toggleMuscleGroup = (dayIndex: number, muscleGroup: string) => {
    const updated = splitDays.map((day, i) => {
      if (i === dayIndex) {
        const muscleGroups = day.muscleGroups.includes(muscleGroup)
          ? day.muscleGroups.filter(m => m !== muscleGroup)
          : [...day.muscleGroups, muscleGroup]
        return { ...day, muscleGroups }
      }
      return day
    })
    setSplitDays(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Custom Split Configuration</h3>
          <p className="text-xs text-muted-foreground">
            Define which muscle groups to train on each day
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDay}
          disabled={splitDays.length >= maxDays}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Day
        </Button>
      </div>

      <div className="space-y-3">
        {splitDays.map((day, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Label htmlFor={`day-${index}-label`} className="text-sm font-medium">
                    Day {day.dayNumber}
                  </Label>
                  <Input
                    id={`day-${index}-label`}
                    value={day.label}
                    onChange={(e) => updateDayLabel(index, e.target.value)}
                    placeholder={`e.g., Chest & Triceps Day`}
                    className="mt-2"
                  />
                </div>
                {splitDays.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDay(index)}
                    className="ml-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Label className="text-xs font-medium mb-2 block">
                Muscle Groups
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MUSCLE_GROUPS.map((muscle) => (
                  <div
                    key={muscle}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`day-${index}-${muscle}`}
                      checked={day.muscleGroups.includes(muscle)}
                      onCheckedChange={() => toggleMuscleGroup(index, muscle)}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={`day-${index}-${muscle}`}
                      className="text-sm font-normal capitalize cursor-pointer"
                    >
                      {muscle}
                    </Label>
                  </div>
                ))}
              </div>
              {day.muscleGroups.length === 0 && (
                <p className="text-xs text-destructive mt-2">
                  Please select at least one muscle group
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
