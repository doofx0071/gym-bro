'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, TrendingUp, Loader2 } from 'lucide-react';
import type { ExerciseHistory } from '@/lib/types/workout-tracking';
import { toast } from 'sonner';

interface Exercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | string;
}

interface SetLog {
  set_number: number;
  reps: number;
  weight_kg: number;
  completed: boolean;
}

interface WorkoutLoggerProps {
  exercises: Exercise[];
  sessionId: string | null;
  sessionStartTime: number | null;
  logs: Record<string, SetLog[]>;
  histories: Record<string, ExerciseHistory>;
  isStarting?: boolean;
  onLogSet: (exerciseId: string, exerciseName: string, setNumber: number, reps: number, weight: number) => Promise<void>;
  onComplete?: () => Promise<void>;
}

export function WorkoutLogger({ 
  exercises, 
  sessionId, 
  sessionStartTime,
  logs, 
  histories,
  isStarting = false,
  onLogSet,
  onComplete 
}: WorkoutLoggerProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  async function handleComplete() {
    if (!onComplete) return;
    setIsCompleting(true);
    try {
      await onComplete();
    } catch (err) {
      console.error('Failed to complete workout:', err);
      toast.error('Failed to complete workout');
    } finally {
      setIsCompleting(false);
    }
  }

  function getLastWorkout(exerciseId: string) {
    const hist = histories[exerciseId];
    if (!hist || hist.recent_sessions.length === 0) return null;
    return hist.recent_sessions[0];
  }

  // Calculate workout duration
  function getWorkoutDuration() {
    if (!sessionStartTime) return '0 min';
    const durationMs = Date.now() - sessionStartTime;
    const durationMin = Math.floor(durationMs / 60000);
    return `${durationMin} min`;
  }

  // Calculate total sets logged
  function getTotalSetsLogged() {
    return Object.values(logs).reduce((sum, exerciseLogs) => sum + exerciseLogs.length, 0);
  }

  if (isStarting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Starting session...</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive font-medium mb-2">Failed to start session</p>
        <p className="text-sm text-muted-foreground">Please close and try again</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Status Header */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium">Session Active</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{getWorkoutDuration()}</span>
              <span>•</span>
              <span>{getTotalSetsLogged()} sets logged</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Loggers */}
      {exercises.map((exercise) => {
        const lastWorkout = getLastWorkout(exercise.exerciseId);
        const currentLogs = logs[exercise.exerciseId] || [];
        const setsCompleted = currentLogs.length;

        return (
          <ExerciseLogger
            key={exercise.exerciseId}
            exercise={exercise}
            lastWorkout={lastWorkout}
            currentLogs={currentLogs}
            setsCompleted={setsCompleted}
            onLogSet={(setNum, reps, weight) =>
              onLogSet(exercise.exerciseId, exercise.name, setNum, reps, weight)
            }
          />
        );
      })}

      {/* Complete Workout Button */}
      {onComplete && (
        <Button 
          onClick={handleComplete} 
          className="w-full cursor-pointer" 
          size="lg"
          disabled={isCompleting}
        >
          {isCompleting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            'Complete Workout'
          )}
        </Button>
      )}
    </div>
  );
}

interface ExerciseLoggerProps {
  exercise: Exercise;
  lastWorkout: { session_date: string; sets: Array<{ set_number: number; reps: number | null; weight_kg: number | null; rpe: number | null }> } | null;
  currentLogs: SetLog[];
  setsCompleted: number;
  onLogSet: (setNum: number, reps: number, weight: number) => void;
}

function ExerciseLogger({ exercise, lastWorkout, currentLogs, setsCompleted, onLogSet }: ExerciseLoggerProps) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const currentSet = setsCompleted + 1;

  // Detect if exercise needs weight (exclude bodyweight, cardio, stretching)
  const needsWeight = !exercise.name.toLowerCase().match(
    /jumping|jack|stretch|warmup|cool.*down|arm circle|leg swing|plank|burpee|mountain climber|high knee|butt kick|cardio/i
  );

  function handleLog() {
    if (!reps) return;
    if (needsWeight && !weight) return;
    onLogSet(currentSet, parseInt(reps), parseFloat(weight) || 0);
    setReps('');
    setWeight('');
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-sm sm:text-base md:text-lg flex items-start sm:items-center justify-between gap-2">
          <span className="break-words flex-1 leading-tight">{exercise.name}</span>
          <span className="text-xs sm:text-sm font-normal text-muted-foreground whitespace-nowrap flex-shrink-0">
            {setsCompleted}/{exercise.sets}
          </span>
        </CardTitle>
        {lastWorkout && lastWorkout.sets.length > 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Last: {lastWorkout.sets.map(s => 
              s.weight_kg && s.weight_kg > 0 
                ? `${s.reps || 0} × ${s.weight_kg}kg` 
                : `${s.reps || 0} reps`
            ).join(', ')}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Completed sets */}
        {currentLogs.map((log) => (
          <div key={log.set_number} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">Set {log.set_number}:</span>
            <span className="font-medium">
              {log.weight_kg && log.weight_kg > 0 
                ? `${log.reps} reps × ${log.weight_kg}kg` 
                : `${log.reps} reps`}
            </span>
          </div>
        ))}

        {/* Current set input */}
        {setsCompleted < exercise.sets && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Circle className="w-4 h-4 flex-shrink-0" />
              <span>Set {currentSet}</span>
            </div>
            <div className={`grid gap-2 sm:gap-3 ${needsWeight ? 'grid-cols-[1fr,1fr,auto]' : 'grid-cols-[1fr,auto]'}`}>
              <Input
                type="number"
                placeholder="Reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="text-center text-base h-10 sm:h-9"
                inputMode="numeric"
              />
              {needsWeight && (
                <Input
                  type="number"
                  placeholder="Weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="text-center text-base h-10 sm:h-9"
                  step="0.5"
                  inputMode="decimal"
                />
              )}
              <Button 
                onClick={handleLog} 
                disabled={!reps || (needsWeight && !weight)} 
                size="sm"
                className="h-10 sm:h-9 px-3 sm:px-4 cursor-pointer"
              >
                Log
              </Button>
            </div>
          </div>
        )}

        {/* All sets complete */}
        {setsCompleted >= exercise.sets && (
          <div className="text-center text-sm font-medium text-green-600 py-2">
            ✓ All sets completed!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
