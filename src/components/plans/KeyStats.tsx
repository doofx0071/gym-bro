"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, Target, Dumbbell, Calendar } from "lucide-react"
import type { MacroNutrition } from "@/types/plans"

interface MealPlanStatsProps {
  type: 'meal'
  calories: number
  macros: MacroNutrition
  goal: string
  daysCount: number
}

interface WorkoutPlanStatsProps {
  type: 'workout'
  daysPerWeek: number
  focus?: string
  totalWorkouts: number
  estimatedDuration?: number
}

type KeyStatsProps = MealPlanStatsProps | WorkoutPlanStatsProps

export function KeyStats(props: KeyStatsProps) {
  if (props.type === 'meal') {
    return <MealPlanStats {...props} />
  } else {
    return <WorkoutPlanStats {...props} />
  }
}

function MealPlanStats({ calories, macros, goal, daysCount }: MealPlanStatsProps) {
  // Calculate macro percentages
  const totalMacroCalories = (macros.protein * 4) + (macros.carbs * 4) + (macros.fats * 9)
  const proteinPercent = totalMacroCalories > 0 ? (macros.protein * 4 / totalMacroCalories) * 100 : 0
  const carbsPercent = totalMacroCalories > 0 ? (macros.carbs * 4 / totalMacroCalories) * 100 : 0
  const fatsPercent = totalMacroCalories > 0 ? (macros.fats * 9 / totalMacroCalories) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Daily Calories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calories.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">calories per day</p>
        </CardContent>
      </Card>

      {/* Goal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goal</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{goal}</div>
          <p className="text-xs text-muted-foreground">primary focus</p>
        </CardContent>
      </Card>

      {/* Plan Duration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plan Duration</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{daysCount}</div>
          <p className="text-xs text-muted-foreground">days planned</p>
        </CardContent>
      </Card>

      {/* Macros Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Daily Macros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Protein</span>
              <span className="font-medium">{macros.protein}g</span>
            </div>
            <Progress value={proteinPercent} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Carbs</span>
              <span className="font-medium">{macros.carbs}g</span>
            </div>
            <Progress value={carbsPercent} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Fats</span>
              <span className="font-medium">{macros.fats}g</span>
            </div>
            <Progress value={fatsPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WorkoutPlanStats({ 
  daysPerWeek, 
  focus, 
  totalWorkouts, 
  estimatedDuration 
}: WorkoutPlanStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Days Per Week */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Training Days</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{daysPerWeek}</div>
          <p className="text-xs text-muted-foreground">days per week</p>
        </CardContent>
      </Card>

      {/* Focus */}
      {focus && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{focus}</div>
            <p className="text-xs text-muted-foreground">training focus</p>
          </CardContent>
        </Card>
      )}

      {/* Total Workouts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">weekly sessions</p>
        </CardContent>
      </Card>

      {/* Estimated Duration */}
      {estimatedDuration && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Length</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimatedDuration}</div>
            <p className="text-xs text-muted-foreground">minutes average</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}