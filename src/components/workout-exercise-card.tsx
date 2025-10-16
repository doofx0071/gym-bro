"use client"

import { useQuery } from '@tanstack/react-query'
import { getExerciseById } from '@/lib/apis/exercisedb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, Info, ChevronDown, Replace } from 'lucide-react'
import Link from 'next/link'
import type { ExerciseDetail } from '@/types/plans'
import type { Exercise } from '@/types/exercise'
import { useState } from 'react'

interface WorkoutExerciseCardProps {
  exercise: ExerciseDetail
  index?: number
}

export function WorkoutExerciseCard({ exercise, index }: WorkoutExerciseCardProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)
  
// Check if exercise ID exists (accept both 4-digit and 7-character alphanumeric IDs)
  const isValidExerciseId = Boolean(exercise.exerciseId && (/^\d{4}$/.test(exercise.exerciseId) || /^[a-zA-Z0-9]{7}$/.test(exercise.exerciseId)))

  // Use the exercise ID if it's valid
  const resolvedId: string | undefined = isValidExerciseId && exercise.exerciseId ? exercise.exerciseId : undefined
  
  // Fetch ExerciseDB data using resolved ID (if available)
  const { data: exerciseData, isLoading, error } = useQuery({
    queryKey: ['exercise', resolvedId],
    queryFn: () => getExerciseById(resolvedId!),
    enabled: Boolean(resolvedId),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

// Fetch alternatives when user expands the section (only when we have a resolved ID)
  const { data: alternatives, isLoading: altLoading } = useQuery<{ alternatives: Exercise[] }>({
    queryKey: ['alternatives', resolvedId],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${resolvedId}/alternatives`)
      if (!response.ok) throw new Error('Failed to fetch alternatives')
      return response.json()
    },
    enabled: showAlternatives && Boolean(resolvedId),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // Show loading state while fetching ExerciseDB data (only for valid IDs)
  if (isLoading && isValidExerciseId) {
    return (
      <div className="border rounded-lg p-3 sm:p-4 bg-background/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-full sm:w-32 h-32 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-3 sm:p-4 bg-background/50 hover:bg-background/70 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Exercise GIF - Only show if we have ExerciseDB data */}
        {exerciseData?.gifUrl && (
          <div className="flex-shrink-0 w-full sm:w-36 h-36 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={exerciseData.gifUrl} 
              alt={exerciseData.name}
              className="w-full h-full object-contain"
              loading="lazy"
              style={{
                imageRendering: 'auto',
                filter: 'contrast(1.05) saturate(1.1)',
              }}
            />
          </div>
        )}
        
        {/* Exercise Details */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {index !== undefined && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                )}
                <h5 className="text-sm sm:text-base font-medium">{exercise.name}</h5>
              </div>
              
              {/* Show ExerciseDB link if we have valid data */}
{exerciseData && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    ExerciseDB
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 hover:text-primary text-xs"
                    asChild
                  >
                    <Link href={`/exercises/${resolvedId}`}>
                      <Info className="h-3 w-3 mr-1" />
                      Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            
            {exercise.rpe && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                RPE {exercise.rpe}
              </Badge>
            )}
          </div>
          
          {/* Sets/Reps/Rest Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sets</p>
              <p className="text-sm sm:text-base font-semibold">{exercise.sets}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Reps</p>
              <p className="text-sm sm:text-base font-semibold">{exercise.reps}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Rest</p>
              <p className="text-sm sm:text-base font-semibold">
                {exercise.restSeconds < 60 
                  ? `${exercise.restSeconds}s`
                  : `${Math.floor(exercise.restSeconds / 60)}m`
                }
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Equipment</p>
              <p className="text-xs sm:text-sm font-semibold break-words">
                {exercise.equipment?.join(', ') || exerciseData?.equipments?.join(', ') || 'None'}
              </p>
            </div>
          </div>
          
          {/* Target Muscles - Prefer ExerciseDB data if available */}
          {((exerciseData?.targetMuscles && exerciseData.targetMuscles.length > 0) || 
            (exercise.muscleGroups && exercise.muscleGroups.length > 0)) && (
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">Target Muscles</p>
              <div className="flex flex-wrap gap-1">
                {(exerciseData?.targetMuscles || exercise.muscleGroups)?.map((muscle, i) => (
                  <Badge key={i} variant="default" className="text-[10px] sm:text-xs capitalize">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Secondary Muscles from ExerciseDB */}
          {exerciseData?.secondaryMuscles && exerciseData.secondaryMuscles.length > 0 && (
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">Secondary Muscles</p>
              <div className="flex flex-wrap gap-1">
                {exerciseData.secondaryMuscles.map((muscle, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs capitalize">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions from ExerciseDB - Collapsible */}
          {exerciseData?.instructions && exerciseData.instructions.length > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
                {showInstructions ? 'Hide' : 'View'} Instructions
              </Button>
              
              {showInstructions && (
                <ol className="mt-2 space-y-1 text-xs sm:text-sm list-decimal list-inside text-muted-foreground">
                  {exerciseData.instructions.map((instruction, i) => {
                    // Clean up instruction text - remove "Step:X" or "Step X" prefix if present
                    const cleanedInstruction = instruction.replace(/^Step[:\s]*\d+[:\s]*/i, '').trim()
                    return <li key={i} className="pl-1">{cleanedInstruction}</li>
                  })}
                </ol>
              )}
            </div>
          )}
          
          {/* Alternative Exercises - Collapsible (only for valid ExerciseDB IDs) */}
{Boolean(resolvedId) && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setShowAlternatives(!showAlternatives)}
              >
                <Replace className={`h-3 w-3 mr-1 transition-transform ${showAlternatives ? 'rotate-180' : ''}`} />
                {showAlternatives ? 'Hide' : 'View'} Alternative Exercises
              </Button>
              
              {showAlternatives && (
                <div className="mt-2 space-y-2">
                  {altLoading ? (
                    <div className="text-xs sm:text-sm text-muted-foreground">Loading alternatives...</div>
                  ) : alternatives?.alternatives && alternatives.alternatives.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {alternatives.alternatives.slice(0, 3).map((alt) => (
                        <Link 
                          key={alt.exerciseId} 
                          href={`/exercises/${alt.exerciseId}`}
                          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
                        >
                          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={alt.gifUrl} 
                              alt={alt.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium line-clamp-2">{alt.name}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {alt.equipments?.slice(0, 2).map((equip, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5 capitalize">
                                  {equip}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">No alternatives found</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Custom Notes */}
          {exercise.notes && (
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-xs sm:text-sm text-foreground">{exercise.notes}</p>
            </div>
          )}
          
          {/* Error State (only for valid IDs) */}
          {error && isValidExerciseId && (
            <div className="text-xs text-muted-foreground">
              Could not load exercise details from database
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
