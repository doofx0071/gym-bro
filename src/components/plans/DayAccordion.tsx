"use client"

import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Utensils, Dumbbell, Users } from "lucide-react"
import type { DayMeals, WorkoutDay, MealDetail, WorkoutBlock, ExerciseDetail } from "@/types/plans"

interface DayAccordionProps {
  type: 'meal' | 'workout'
  data: DayMeals[] | WorkoutDay[]
  className?: string
}

export function DayAccordion({ type, data, className }: DayAccordionProps) {
  if (type === 'meal') {
    return <MealDayAccordion data={data as DayMeals[]} className={className} />
  } else {
    return <WorkoutDayAccordion data={data as WorkoutDay[]} className={className} />
  }
}

function MealDayAccordion({ data, className }: { data: DayMeals[], className?: string }) {
  return (
    <Accordion type="single" collapsible className={className}>
      {data.map((day) => (
        <AccordionItem key={day.dayIndex} value={`day-${day.dayIndex}`}>
          <AccordionTrigger className="text-left">
            <div className="flex items-center justify-between w-full mr-4">
              <div className="flex items-center gap-3">
                <Utensils className="h-4 w-4 text-primary" />
                <span className="font-medium">{day.dayLabel}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{day.meals.length} meals</span>
                <span>{day.totalCalories} cal</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {day.meals.map((meal, index) => (
                <MealCard key={index} meal={meal} />
              ))}
              
              {/* Daily Totals */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Daily Totals</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{day.totalCalories} calories</span>
                      <span>{day.totalMacros.protein}g protein</span>
                      <span>{day.totalMacros.carbs}g carbs</span>
                      <span>{day.totalMacros.fats}g fat</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function WorkoutDayAccordion({ data, className }: { data: WorkoutDay[], className?: string }) {
  return (
    <Accordion type="single" collapsible className={className}>
      {data.map((day) => (
        <AccordionItem key={day.dayIndex} value={`day-${day.dayIndex}`}>
          <AccordionTrigger className="text-left">
            <div className="flex items-center justify-between w-full mr-4">
              <div className="flex items-center gap-3">
                {day.isRestDay ? (
                  <Users className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Dumbbell className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium">{day.dayLabel}</span>
                {day.focus && (
                  <Badge variant="secondary" className="ml-2">
                    {day.focus}
                  </Badge>
                )}
              </div>
              {!day.isRestDay && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{day.blocks.reduce((acc, block) => acc + block.exercises.length, 0)} exercises</span>
                  {day.totalTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{day.totalTime} min</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {day.isRestDay ? (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Rest Day</p>
                      <p className="text-sm">Take time to recover and let your muscles repair.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                day.blocks.map((block, blockIndex) => (
                  <WorkoutBlockCard key={blockIndex} block={block} />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function MealCard({ meal }: { meal: MealDetail }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium">{meal.name}</h4>
            <p className="text-sm text-muted-foreground">{meal.timeOfDay}</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">{meal.calories} cal</div>
            <div className="text-muted-foreground">
              {meal.macros.protein}p • {meal.macros.carbs}c • {meal.macros.fats}f
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-medium mb-2">Ingredients</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index}>• {ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Instructions ({meal.prepTime} min)
            </h5>
            <ol className="text-sm text-muted-foreground space-y-1">
              {meal.instructions.map((instruction, index) => (
                <li key={index}>{index + 1}. {instruction}</li>
              ))}
            </ol>
          </div>
          
          {meal.notes && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm"><strong>Note:</strong> {meal.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function WorkoutBlockCard({ block }: { block: WorkoutBlock }) {
  const getBlockColor = (type: string) => {
    switch (type) {
      case 'warmup': return 'bg-yellow-50 border-yellow-200'
      case 'main': return 'bg-blue-50 border-blue-200'
      case 'accessory': return 'bg-green-50 border-green-200'
      case 'cooldown': return 'bg-purple-50 border-purple-200'
      default: return 'bg-muted/50'
    }
  }

  return (
    <Card className={getBlockColor(block.type)}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="capitalize">
                {block.type}
              </Badge>
              <h4 className="font-medium">{block.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {block.exercises.length} exercises
              {block.totalTime && ` • ${block.totalTime} min`}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          {block.exercises.map((exercise, index) => (
            <ExerciseRow key={index} exercise={exercise} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ExerciseRow({ exercise }: { exercise: ExerciseDetail }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded bg-background/50">
      <div className="flex-1">
        <div className="font-medium">{exercise.name}</div>
        <div className="text-sm text-muted-foreground">
          {exercise.equipment && exercise.equipment.length > 0 && (
            <span>{exercise.equipment.join(', ')} • </span>
          )}
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <span>{exercise.muscleGroups.join(', ')}</span>
          )}
        </div>
      </div>
      
      <div className="text-right text-sm">
        <div className="font-medium">
          {exercise.sets} × {exercise.reps}
        </div>
        <div className="text-muted-foreground">
          {exercise.restSeconds > 0 && `${Math.floor(exercise.restSeconds / 60)}:${(exercise.restSeconds % 60).toString().padStart(2, '0')} rest`}
          {exercise.rpe && ` • RPE ${exercise.rpe}`}
        </div>
      </div>
      
      {exercise.notes && (
        <div className="ml-3 text-xs text-muted-foreground max-w-xs">
          {exercise.notes}
        </div>
      )}
    </div>
  )
}