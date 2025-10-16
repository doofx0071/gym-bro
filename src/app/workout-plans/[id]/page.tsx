"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { getWorkoutPlanByIdClient } from "@/lib/data/plans-client"
import { resetCircuitBreaker } from "@/lib/apis/exercisedb"
import type { WorkoutPlanData } from "@/types/plans"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SteamLoader } from "@/components/steam-loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Clock, Target, Dumbbell, Calendar, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { WorkoutExerciseCard } from "@/components/workout-exercise-card"
import { WorkoutLogger } from "@/components/workout/WorkoutLogger"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  const [authInitialized, setAuthInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeLoggerDay, setActiveLoggerDay] = useState<number | null>(null)
  const isGenerating = searchParams.get('generating') === 'true'

  // Get current day index (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  const getCurrentDayIndex = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to workout plan format (0 = Monday, 6 = Sunday)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1
  }

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

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const response = await fetch(`/api/workout-plans/${params.id}/regenerate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate workout plan')
      }

      toast.success('Regenerating your workout plan...')
      
      // Update plan status locally
      if (plan) {
        setPlan({ ...plan, status: 'generating' })
      }
      
      // Add generating query param and reload
      router.push(`/workout-plans/${params.id}?generating=true`)
    } catch (err) {
      console.error('Failed to regenerate workout plan:', err)
      toast.error('Failed to regenerate workout plan')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/workout-plans/${params.id}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete workout plan')
      }

      toast.success('Workout plan deleted successfully')
      
      // Redirect to workout plans list
      router.push('/workout-plans')
    } catch (err) {
      console.error('Failed to delete workout plan:', err)
      toast.error('Failed to delete workout plan')
    } finally {
      setIsDeleting(false)
    }
  }

  // Reset circuit breaker on mount to ensure exercises can load
  useEffect(() => {
    resetCircuitBreaker();
  }, []);

  // Wait for auth to fully initialize before making redirect decisions
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthInitialized(true)
    }, 500) // Wait 0.5 seconds for auth to stabilize

    return () => clearTimeout(timer)
  }, [])

  // Poll for plan status if it's being generated
  useEffect(() => {
    if (!isGenerating || !plan || plan.status !== 'generating') return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/workout-plans/${params.id}/status`)
        const data = await response.json()
        
        if (response.ok) {
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
    // Only proceed if auth has initialized
    if (!authInitialized) return

    // Only redirect if we know for sure there's no auth user and no user profile
    if (!authUser && !user) {
      router.push('/auth/login')
      return
    }

    // Load plan as soon as we have a user
    if (user) {
      loadPlan()
    }
  }, [user, authUser, params.id, router, loadPlan, authInitialized])

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
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-24 md:pb-8">
        <div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-destructive font-medium text-lg mb-2">Error Loading Workout Plan</h2>
            <p className="text-destructive/80 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="cursor-pointer" asChild>
                <Link href="/workout-plans">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Workout Plans
                </Link>
              </Button>
              <Button onClick={() => loadPlan()} className="cursor-pointer">
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
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-24 md:pb-8">
        <div>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Workout plan not found</p>
            <Button variant="outline" className="cursor-pointer" asChild>
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
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-24 md:pb-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" size="sm" className="cursor-pointer flex-shrink-0" asChild>
              <Link href="/workout-plans">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{plan.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {getStatusBadge(plan.status)}
                <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{plan.focus}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Only show for completed plans */}
          {plan.status === 'completed' && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Regenerate Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer" disabled={isRegenerating || isDeleting}>
                    <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Regenerate</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate Workout Plan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create a new workout plan with fresh exercises and routines. Your current plan will be replaced. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="cursor-pointer" onClick={handleRegenerate}>
                      Regenerate Plan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="cursor-pointer" disabled={isDeleting || isRegenerating}>
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Workout Plan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your workout plan. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="cursor-pointer bg-destructive hover:bg-destructive/90" 
                      onClick={handleDelete}
                    >
                      Delete Plan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
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
            <CardContent className="flex flex-col items-center justify-center py-8">
              <SteamLoader 
                size={120}
                text="Please wait while we create your personalized workout plan..."
              />
            </CardContent>
          </Card>
        )}

        {/* Plan Overview - Masonry Grid */}
        <div className="columns-1 md:columns-3 gap-4 space-y-4 md:space-y-0">
          <Card className="break-inside-avoid mb-4">
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
          
          <Card className="break-inside-avoid mb-4">
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
          
          <Card className="break-inside-avoid mb-4">
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

        {/* Workout Schedule with Tabs */}
        {plan.status === 'completed' && plan.schedule && plan.schedule.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Weekly Schedule</h2>
            
            <Tabs defaultValue={getCurrentDayIndex().toString()} className="w-full">
              <TabsList className="inline-flex h-9 sm:h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-0.5 sm:gap-1 w-full overflow-x-auto scrollbar-hide">
                {plan.schedule.map((day) => {
                  const isToday = day.dayIndex === getCurrentDayIndex()
                  return (
                    <TabsTrigger 
                      key={day.dayIndex} 
                      value={day.dayIndex.toString()}
                      className="relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex-1 min-w-[45px] sm:min-w-0 cursor-pointer"
                    >
                      <span className="hidden sm:inline">{day.dayLabel.substring(0, 3)}</span>
                      <span className="sm:hidden">{day.dayLabel.substring(0, 1)}</span>
                      {isToday && (
                        <span className="ml-1 sm:ml-1.5 inline-flex items-center justify-center rounded-full bg-primary px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-primary-foreground">
                          •
                        </span>
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              
              {plan.schedule.map((day) => {
                const isToday = day.dayIndex === getCurrentDayIndex()
                return (
                  <TabsContent key={day.dayIndex} value={day.dayIndex.toString()} className="space-y-4">
                    {/* Day Header Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg sm:text-xl">{day.dayLabel}</span>
                            {isToday && (
                              <Badge variant="default" className="text-xs">
                                Today
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            {day.isRestDay ? (
                              <Badge variant="outline">Rest Day</Badge>
                            ) : (
                              <>
                                <Badge variant="secondary">
                                  {day.totalTime ? `${day.totalTime} min` : 'Workout'}
                                </Badge>
                                <Sheet open={activeLoggerDay === day.dayIndex} onOpenChange={(open) => setActiveLoggerDay(open ? day.dayIndex : null)}>
                                  <SheetTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant={isToday ? "default" : "outline"}
                                      className="cursor-pointer"
                                    >
                                      <Dumbbell className="h-4 w-4 mr-2" />
                                      {isToday ? "Start Today's Workout" : "Log Workout"}
                                    </Button>
                                  </SheetTrigger>
                                  <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-6">
                                    <SheetHeader className="mb-4 sm:mb-6">
                                      <SheetTitle className="text-lg sm:text-xl">{day.dayLabel} Workout</SheetTitle>
                                      <SheetDescription className="text-sm">
                                        Log your sets and track your progress
                                      </SheetDescription>
                                    </SheetHeader>
                                    <WorkoutLogger
                                      exercises={
                                        day.blocks?.flatMap(block => 
                                          block.exercises.map(ex => ({
                                            exerciseId: ex.exerciseId || '',
                                            name: ex.name,
                                            sets: ex.sets || 3,
                                            reps: ex.reps || '8-10',
                                          }))
                                        ) || []
                                      }
                                      planLabel={`${plan.title} - ${day.dayLabel}`}
                                      onComplete={() => {
                                        setActiveLoggerDay(null)
                                        toast.success('Workout completed! Great job! 💪')
                                      }}
                                    />
                                  </SheetContent>
                                </Sheet>
                              </>
                            )}
                          </div>
                        </CardTitle>
                        {day.focus && (
                          <p className="text-xs sm:text-sm text-muted-foreground">{day.focus}</p>
                        )}
                      </CardHeader>
                    </Card>
                    
                    {/* Workout Blocks */}
                    {!day.isRestDay && day.blocks && day.blocks.length > 0 && (
                      <div className="space-y-4">
                        {day.blocks.map((block, blockIndex) => (
                          <Card key={blockIndex}>
                            <CardHeader>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge 
                                  variant={block.type === 'main' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                                </Badge>
                                <h4 className="text-sm sm:text-base font-medium">{block.name}</h4>
                                {block.totalTime && (
                                  <span className="text-xs sm:text-sm text-muted-foreground">
                                    • {block.totalTime} min
                                  </span>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-3">
                                {block.exercises.map((exercise, exerciseIndex) => (
                                  <WorkoutExerciseCard 
                                    key={exerciseIndex}
                                    exercise={exercise}
                                    index={exerciseIndex}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {/* Rest Day Message */}
                    {day.isRestDay && (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Rest & Recovery</h3>
                          <p className="text-sm text-muted-foreground">
                            Take this day to rest and let your body recover.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
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
                <Button asChild className="cursor-pointer">
                  <Link href="/workout-plans/new" className="cursor-pointer">Generate New Plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}