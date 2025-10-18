'use client';

import { useState, useEffect } from 'react';
import { WorkoutLogger } from '@/components/workout/WorkoutLogger';
import type { ExerciseHistory } from '@/lib/types/workout-tracking';
import { toast } from 'sonner';

export default function WorkoutLoggerTestPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [logs, setLogs] = useState<Record<string, Array<{ set_number: number; reps: number; weight_kg: number; completed: boolean }>>>({});
  const [histories, setHistories] = useState<Record<string, ExerciseHistory>>({});

  const testExercises = [
    {
      exerciseId: '0001',
      name: 'Barbell Bench Press',
      sets: 3,
      reps: '8-10',
    },
    {
      exerciseId: '0032',
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: '10-12',
    },
    {
      exerciseId: '0096',
      name: 'Cable Chest Fly',
      sets: 3,
      reps: '12-15',
    },
  ];

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
        body: JSON.stringify({ plan_label: 'Chest Day - Phase 5 Demo' }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.session.id);
        setSessionStartTime(Date.now());
        // Fetch histories
        testExercises.forEach(ex => fetchHistory(ex.exerciseId));
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

  async function handleLogSet(
    exerciseId: string,
    exerciseName: string,
    setNumber: number,
    reps: number,
    weight: number
  ) {
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

  async function handleComplete() {
    if (!sessionId || !sessionStartTime) return;
    
    const durationMin = Math.round((Date.now() - sessionStartTime) / 60000);
    
    try {
      const res = await fetch(`/api/progress/session/${sessionId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_min: durationMin }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Workout completed! Duration: ${durationMin} min 🎉`);
        alert('Great job! Check the console for session details.');
        console.log('Completed session:', data.session);
      }
    } catch (err) {
      console.error('Failed to complete workout:', err);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Workout Progress Tracker</h1>
        <p className="text-muted-foreground">
          Demo: Log your sets and track progress over time
        </p>
      </div>

      <WorkoutLogger
        exercises={testExercises}
        sessionId={sessionId}
        sessionStartTime={sessionStartTime}
        logs={logs}
        histories={histories}
        isStarting={isStarting}
        onLogSet={handleLogSet}
        onComplete={handleComplete}
      />
    </div>
  );
}
