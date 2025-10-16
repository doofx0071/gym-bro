"use client"

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getExerciseById } from '@/lib/apis/exercisedb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ExercisePageProps {
  params: Promise<{ id: string }>
}

export default function ExercisePage({ params: paramsPromise }: ExercisePageProps) {
  const params = use(paramsPromise)
  
  const { data: exercise, isLoading, error } = useQuery({
    queryKey: ['exercise', params.id],
    queryFn: () => getExerciseById(params.id),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="w-full aspect-square max-w-md mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div className="space-y-4">
          <Button variant="outline" size="sm" asChild className="cursor-pointer">
            <Link href="/exercises" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Link>
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load exercise. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div className="space-y-4">
          <Button variant="outline" size="sm" asChild className="cursor-pointer">
            <Link href="/exercises" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Link>
          </Button>
          
          <div className="text-center py-12">
            <p className="text-muted-foreground">Exercise not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <Link href="/exercises" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Link>
        </Button>

        {/* Exercise Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">{exercise.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">ID: {exercise.exerciseId}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* GIF Display */}
            <div className="flex justify-center">
              <div className="relative w-full aspect-square max-w-lg bg-muted rounded-lg overflow-hidden mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                  style={{
                    imageRendering: 'auto',
                    filter: 'contrast(1.05) saturate(1.1)',
                  }}
                />
              </div>
            </div>

            {/* Badges Section */}
            <div className="space-y-4">
              {/* Body Parts */}
              {exercise.bodyParts && exercise.bodyParts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Body Parts</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.bodyParts.map((part) => (
                      <Badge key={part} variant="secondary" className="capitalize">
                        {part}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {exercise.equipments && exercise.equipments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Equipment</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipments.map((equip) => (
                      <Badge key={equip} variant="outline" className="capitalize">
                        {equip}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Muscles */}
              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Primary Muscles</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.targetMuscles.map((muscle) => (
                      <Badge key={muscle} variant="default" className="capitalize">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Muscles */}
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Secondary Muscles</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.secondaryMuscles.map((muscle) => (
                      <Badge key={muscle} variant="secondary" className="capitalize">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                  {exercise.instructions.map((instruction, idx) => (
                    <li key={idx} className="pl-2">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
