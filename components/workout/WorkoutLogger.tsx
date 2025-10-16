'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import type { ExerciseHistory } from '@/lib/types/workout-tracking';

interface Exercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | string; // could be "8-10" or "12"
}

interface WorkoutLoggerProps {
  exercises: Exercise[];
  planLabel?: string;
  onComplete?: () => void;
}

interface SetLog {
  set_number: number;
  reps: number;
  weight_kg: number;
  completed: boolean;
}

export function WorkoutLogger({ exercises, planLabel, onComplete }: WorkoutLoggerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [logs, setLogs] = useState<Record<string, SetLog[]>>({});
  const [histories, setHistories] = useState<Record<string, ExerciseHistory>>({});

  // Create session on mount
  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startSession() {
    setIsStarting(true);
    try {
      const res = await fetch('/api/progress/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_label: planLabel }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.session.id);
        // Fetch history for all exercises
        await Promise.all(exercises.map(ex => fetchHistory(ex.exerciseId)));
      }
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setIsStarting(false);
    }
  }

  async function fetchHistory(exerciseId: string) {
    try {
      const res = await fetch(`/api/progress/history?exercise_id=${exerciseId}`);
      const data = await res.json();
      if (data.success) {
        setHistories(prev => ({ ...prev, [exerciseId]: data.history }));
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }

  async function logSet(exerciseId: string, exerciseName: string, setNumber: number, reps: number, weight: number) {
    if (!sessionId) return;
    try {
      const res = await fetch('/api/progress/log-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          set_number: setNumber,
          reps,
          weight_kg: weight,
          completed: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => ({
          ...prev,
          [exerciseId]: [
            ...(prev[exerciseId] || []),
            { set_number: setNumber, reps, weight_kg: weight, completed: true },
          ],
        }));
      }
    } catch (err) {
      console.error('Failed to log set:', err);
    }
  }

  function getLastWorkout(exerciseId: string) {
    const hist = histories[exerciseId];
    if (!hist || hist.recent_sessions.length === 0) return null;
    return hist.recent_sessions[0];
  }

  if (isStarting) {
    return <div className="text-center py-8 text-muted-foreground">Starting session...</div>;
  }

  if (!sessionId) {
    return <div className="text-center py-8 text-destructive">Failed to start session. Please refresh.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>Session active • Track your sets below</span>
      </div>

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
              logSet(exercise.exerciseId, exercise.name, setNum, reps, weight)
            }
          />
        );
      })}

      {onComplete && (
        <Button onClick={onComplete} className="w-full" size="lg">
          Complete Workout
        </Button>
      )}
    </div>
  );
}

interface ExerciseLoggerProps {
  exercise: Exercise;
  lastWorkout: { session_date: string; sets: any[] } | null;
  currentLogs: SetLog[];
  setsCompleted: number;
  onLogSet: (setNum: number, reps: number, weight: number) => void;
}

function ExerciseLogger({ exercise, lastWorkout, currentLogs, setsCompleted, onLogSet }: ExerciseLoggerProps) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const currentSet = setsCompleted + 1;

  function handleLog() {
    if (!reps || !weight) return;
    onLogSet(currentSet, parseInt(reps), parseFloat(weight));
    setReps('');
    setWeight('');
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="truncate">{exercise.name}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {setsCompleted}/{exercise.sets} sets
          </span>
        </CardTitle>
        {lastWorkout && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Last: {lastWorkout.sets.map(s => `${s.reps || 0} × ${s.weight_kg || 0}kg`).join(', ')}
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
              {log.reps} reps × {log.weight_kg}kg
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
            <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
              <Input
                type="number"
                placeholder="Reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="text-center"
              />
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-center"
                step="0.5"
              />
              <Button onClick={handleLog} disabled={!reps || !weight} size="sm">
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
