'use client';

import { useQuery } from '@tanstack/react-query';
import { getExerciseById } from '@/lib/apis/exercisedb';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ExerciseCardProps {
  exerciseId: string;
  sets: number;
  reps: number | string;
  restPeriod?: number;
  showDetails?: boolean;
}

export function ExerciseCard({
  exerciseId,
  sets,
  reps,
  restPeriod,
  showDetails = true,
}: ExerciseCardProps) {
  const {
    data: exercise,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => getExerciseById(exerciseId),
    staleTime: 1000 * 60 * 60, // Consider fresh for 1 hour
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load exercise. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!exercise) return null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="text-lg font-semibold">{exercise.name}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* GIF Display - V1 API always includes GIFs! */}
        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
          <Image
            src={exercise.gifUrl}
            alt={exercise.name}
            fill
            className="object-contain"
            unoptimized // Keep GIF animation
            priority={false}
            style={{
              imageRendering: 'pixelated',
              filter: 'contrast(1.05) saturate(1.1)',
            }}
          />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {exercise.bodyParts?.map((part) => (
            <Badge key={part} variant="secondary">
              {part}
            </Badge>
          ))}
          {exercise.equipments?.map((equip) => (
            <Badge key={equip} variant="outline">
              {equip}
            </Badge>
          ))}
        </div>

        {/* Sets and Reps */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <div>
            <span className="text-muted-foreground">Sets:</span>{' '}
            <span className="text-foreground">{sets}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Reps:</span>{' '}
            <span className="text-foreground">{reps}</span>
          </div>
          {restPeriod && (
            <div>
              <span className="text-muted-foreground">Rest:</span>{' '}
              <span className="text-foreground">{restPeriod}s</span>
            </div>
          )}
        </div>

        {/* Target Muscles */}
        <div className="text-sm space-y-1">
          {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
            <div>
              <span className="font-medium">Primary:</span>{' '}
              <span className="text-muted-foreground">
                {exercise.targetMuscles.join(', ')}
              </span>
            </div>
          )}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <div>
              <span className="font-medium">Secondary:</span>{' '}
              <span className="text-muted-foreground">
                {exercise.secondaryMuscles.join(', ')}
              </span>
            </div>
          )}
        </div>

        {showDetails && (
          <>
            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  View Instructions
                </summary>
                <ol className="mt-2 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  {exercise.instructions.map((instruction, idx) => (
                    <li key={idx} className="pl-2">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
