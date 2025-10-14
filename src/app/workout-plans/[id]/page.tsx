"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { getWorkoutPlanByIdClient } from "@/lib/data/plans-client"
import type { WorkoutPlanData } from "@/types/plans"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Target, Dumbbell, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface WorkoutPlanPageProps {
  params: Promise<{ id: string }>
}

export default function WorkoutPlanPage({ params: paramsPromise }: WorkoutPlanPageProps) {
  const params = use(paramsPromise)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, authUser } = useUser()
  const [plan, setPlan] = useState<WorkoutPlanData | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const isGenerating = searchParams.get('generating') === 'true'

  const loadPlan = useCallback(async () => {
    if (!user) return
    
    try {
      setError(null)
      
      const result = await getWorkoutPlanByIdClient(params.id, user.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setPlan(result.data)
      }
    } catch (err) {
      console.error('Failed to load workout plan:', err)
      setError('Failed to load workout plan')
    } finally {
      setIsInitialLoad(false)
    }
  }, [user, params.id])

  // Poll for plan status if it's being generated
  useEffect(() => {
    if (!isGenerating || !plan || plan.status !== 'generating') return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/workout-plans/${params.id}/status`)
        const data = await response.json()
        
        if (response.ok) {
          setProgress(data.progress)
          
          if (data.status === 'completed') {
            // Plan is ready, reload the full plan data
            loadPlan()
            toast.success('Your workout plan is ready!')
            // Remove generating query param
            router.replace(`/workout-plans/${params.id}`)
          } else if (data.status === 'failed') {
            setError(data.error || 'Plan generation failed')
            toast.error('Plan generation failed')
            router.replace(`/workout-plans/${params.id}`)
          }
        }
      } catch (err) {
        console.error('Failed to check plan status:', err)
      }
    }

    const interval = setInterval(pollStatus, 2000) // Check every 2 seconds
    return () => clearInterval(interval)
  }, [isGenerating, plan, params.id, router, loadPlan])

  useEffect(() => {
    // Only redirect if we know for sure there's no auth user and no user profile
    if (!authUser && !user) {
      router.push('/auth/login')
      return
    }

    // Load plan as soon as we have a user
    if (user) {
      loadPlan()
    }
  }, [user, authUser, params.id, router, loadPlan])

  if (isInitialLoad) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div className="space-y-6">
          <div className="h-9 w-64 bg-muted-foreground/20 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted-foreground/20 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-muted-foreground/20 rounded-lg animate-pulse" />
            <div className="h-96 bg-muted-foreground/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-destructive font-medium text-lg mb-2">Error Loading Workout Plan</h2>
            <p className="text-destructive/80 mb-4">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/workout-plans">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Workout Plans
                </Link>
              </Button>
              <Button onClick={() => loadPlan()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Workout plan not found</p>
            <Button variant="outline" asChild>
              <Link href="/workout-plans">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workout Plans
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generating':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Generating...</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-300">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/workout-plans">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{plan.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(plan.status)}
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{plan.focus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {plan.status === 'generating' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Generating Your Workout Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Please wait while we create your personalized workout plan...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Days per Week</p>
                  <p className="text-2xl font-bold">{plan.daysPerWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Focus</p>
                  <p className="text-2xl font-bold capitalize">{plan.focus || 'General'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Workouts</p>
                  <p className="text-2xl font-bold">{plan.schedule?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Schedule */}
        {plan.status === 'completed' && plan.schedule && plan.schedule.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Weekly Schedule</h2>
            {plan.schedule.map((day) => (
              <Card key={day.dayIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{day.dayLabel}</span>
                    {day.isRestDay ? (
                      <Badge variant="outline">Rest Day</Badge>
                    ) : (
                      <Badge variant="outline">
                        {day.totalTime ? `${day.totalTime} min` : 'Workout'}
                      </Badge>
                    )}
                  </CardTitle>
                  {day.focus && (
                    <p className="text-sm text-muted-foreground">{day.focus}</p>
                  )}
                </CardHeader>
                
                {!day.isRestDay && day.blocks && day.blocks.length > 0 && (
                  <CardContent>
                    <div className="space-y-6">
                      {day.blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={block.type === 'main' ? 'default' : 'secondary'}
                            >
                              {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                            </Badge>
                            <h4 className="font-medium">{block.name}</h4>
                            {block.totalTime && (
                              <span className="text-sm text-muted-foreground">
                                • {block.totalTime} min
                              </span>
                            )}
                          </div>
                          
                          <div className="grid gap-3">
                            {block.exercises.map((exercise, exerciseIndex) => (
                              <div 
                                key={exerciseIndex} 
                                className="border rounded-lg p-4 bg-background/50"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium">{exercise.name}</h5>
                                  {exercise.rpe && (
                                    <Badge variant="outline" className="text-xs">
                                      RPE {exercise.rpe}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Sets</p>
                                    <p className="font-medium">{exercise.sets}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Reps</p>
                                    <p className="font-medium">{exercise.reps}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Rest</p>
                                    <p className="font-medium">
                                      {exercise.restSeconds < 60 
                                        ? `${exercise.restSeconds}s`
                                        : `${Math.floor(exercise.restSeconds / 60)}m ${exercise.restSeconds % 60}s`
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Equipment</p>
                                    <p className="font-medium">
                                      {exercise.equipment?.join(', ') || 'None'}
                                    </p>
                                  </div>
                                </div>
                                
                                {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-sm text-muted-foreground mb-1">Target Muscles</p>
                                    <div className="flex flex-wrap gap-1">
                                      {exercise.muscleGroups.map((muscle, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                          {muscle}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {exercise.notes && (
                                  <div className="mt-3">
                                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm">{exercise.notes}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Error State for Failed Generation */}
        {plan.status === 'failed' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <p className="text-destructive font-medium mb-2">Generation Failed</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.error || 'Something went wrong while generating your workout plan.'}
                </p>
                <Button asChild>
                  <Link href="/workout-plans/new">Generate New Plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}