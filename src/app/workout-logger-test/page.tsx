'use client';

import { WorkoutLogger } from '@/components/workout/WorkoutLogger';

export default function WorkoutLoggerTestPage() {
  const testExercises = [
    {
      exerciseId: '0001', // Bench Press
      name: 'Barbell Bench Press',
      sets: 3,
      reps: '8-10',
    },
    {
      exerciseId: '0032', // Incline Bench Press
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: '10-12',
    },
    {
      exerciseId: '0096', // Cable Fly
      name: 'Cable Chest Fly',
      sets: 3,
      reps: '12-15',
    },
  ];

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
        planLabel="Chest Day - Phase 5 Demo"
        onComplete={() => {
          alert('Workout completed! Great job! 🎉');
        }}
      />
    </div>
  );
}
