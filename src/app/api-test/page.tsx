'use client';

import { ExerciseCard } from '@/components/exercise-card';
import { useQuery } from '@tanstack/react-query';
import { getAllExercises } from '@/lib/apis/exercisedb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ApiTestPage() {
  // Test ExerciseDB connection
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['test-exercises'],
    queryFn: () => getAllExercises({ limit: 3 }),
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Integration Test</h1>
        <p className="text-muted-foreground">
          Testing ExerciseDB and USDA API connections
        </p>
      </div>

      {/* ExerciseDB Test */}
      <Card>
        <CardHeader>
          <CardTitle>ExerciseDB API Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Testing connection...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to connect to ExerciseDB'}
                <br />
                <br />
                <strong>Troubleshooting:</strong>
                <ul className="list-disc list-inside mt-2">
                  <li>Check that EXERCISEDB_API_KEY is set in .env.local</li>
                  <li>Verify you subscribed to ExerciseDB on RapidAPI</li>
                  <li>Restart the development server</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {exercises && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Connected Successfully!</AlertTitle>
              <AlertDescription className="text-green-600">
                Fetched {exercises.length} exercises from ExerciseDB
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Display Sample Exercises */}
      {exercises && exercises.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sample Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exerciseId}
                exerciseId={exercise.exerciseId}
                sets={3}
                reps="10-12"
                restPeriod={60}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ If ExerciseDB shows &quot;Connected Successfully&quot;, your API is working!</p>
          <p>🎉 Migration to self-hosted ExerciseDB V1 complete (GIFs enabled).</p>
          <p>🔄 Next: Implement nutrition validation and macro components (see <code>/nutrition-test</code>).</p>
          <p>📝 You can delete this test page later: <code>src/app/api-test/</code></p>
        </CardContent>
      </Card>
    </div>
  );
}
