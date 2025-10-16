"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { getMealPlanByIdClient } from "@/lib/data/plans-client"
import type { MealPlanData } from "@/types/plans"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SteamLoader } from "@/components/steam-loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MealVerificationBadge } from "@/components/nutrition/MealVerificationBadge"
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
import { ArrowLeft, Clock, Target, Utensils, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface MealPlanPageProps {
  params: Promise<{ id: string }>
}

export default function MealPlanPage({ params: paramsPromise }: MealPlanPageProps) {
  const params = use(paramsPromise)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, authUser } = useUser()
  const [plan, setPlan] = useState<MealPlanData | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isGenerating = searchParams.get('generating') === 'true'

  // Get current day index (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  const getCurrentDayIndex = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to meal plan format (0 = Monday, 6 = Sunday)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1
  }

  const loadPlan = useCallback(async () => {
    if (!user) return
    
    try {
      setError(null)
      
      const result = await getMealPlanByIdClient(params.id, user.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setPlan(result.data)
      }
    } catch (err) {
      console.error('Failed to load meal plan:', err)
      setError('Failed to load meal plan')
    } finally {
      setIsInitialLoad(false)
    }
  }, [user, params.id])

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const response = await fetch(`/api/meal-plans/${params.id}/regenerate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate meal plan')
      }

      toast.success('Regenerating your meal plan...')
      
      // Update plan status locally
      if (plan) {
        setPlan({ ...plan, status: 'generating' })
      }
      
      // Add generating query param and reload
      router.push(`/meal-plans/${params.id}?generating=true`)
    } catch (err) {
      console.error('Failed to regenerate meal plan:', err)
      toast.error('Failed to regenerate meal plan')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/meal-plans/${params.id}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete meal plan')
      }

      toast.success('Meal plan deleted successfully')
      
      // Redirect to meal plans list
      router.push('/meal-plans')
    } catch (err) {
      console.error('Failed to delete meal plan:', err)
      toast.error('Failed to delete meal plan')
    } finally {
      setIsDeleting(false)
    }
  }

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
        const response = await fetch(`/api/meal-plans/${params.id}/status`)
        const data = await response.json()
        
        if (response.ok) {
          if (data.status === 'completed') {
            // Plan is ready, reload the full plan data
            loadPlan()
            toast.success('Your meal plan is ready!')
            // Remove generating query param
            router.replace(`/meal-plans/${params.id}`)
          } else if (data.status === 'failed') {
            setError(data.error || 'Plan generation failed')
            toast.error('Plan generation failed')
            router.replace(`/meal-plans/${params.id}`)
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
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-destructive font-medium text-lg mb-2">Error Loading Meal Plan</h2>
            <p className="text-destructive/80 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="cursor-pointer" asChild>
                <Link href="/meal-plans">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Meal Plans
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
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Meal plan not found</p>
            <Button variant="outline" className="cursor-pointer" asChild>
              <Link href="/meal-plans">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Meal Plans
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
              <Link href="/meal-plans">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{plan.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {getStatusBadge(plan.status)}
                <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{plan.goal}</span>
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
                    <AlertDialogTitle>Regenerate Meal Plan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create a new meal plan with fresh recipes and meals. Your current plan will be replaced. This action cannot be undone.
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
                    <AlertDialogTitle>Delete Meal Plan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your meal plan. This action cannot be undone.
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
                Generating Your Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <SteamLoader 
                size={120}
                text="Please wait while we create your personalized meal plan..."
              />
            </CardContent>
          </Card>
        )}

        {/* Plan Overview - Masonry Grid */}
        <div className="columns-1 md:columns-3 gap-4 space-y-4 md:space-y-0">
          <Card className="break-inside-avoid mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Daily Calories</p>
                  <p className="text-2xl font-bold">{plan.calories.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="break-inside-avoid mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Utensils className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold">{plan.macros.protein}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="break-inside-avoid mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Utensils className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Meals</p>
                  <p className="text-2xl font-bold">{plan.days?.reduce((acc, day) => acc + day.meals.length, 0) || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Macros Breakdown */}
        {plan.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Macronutrients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="text-xl font-semibold">{plan.macros.calories}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-xl font-semibold">{plan.macros.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-xl font-semibold">{plan.macros.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Fats</p>
                  <p className="text-xl font-semibold">{plan.macros.fats}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Days with Tabs */}
        {plan.status === 'completed' && plan.days && plan.days.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Weekly Meal Plan</h2>
            
            <Tabs defaultValue={getCurrentDayIndex().toString()} className="w-full">
              <TabsList className="inline-flex h-9 sm:h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-0.5 sm:gap-1 w-full overflow-x-auto scrollbar-hide">
                {plan.days.map((day) => {
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
              
              {plan.days.map((day) => {
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
                        <Badge variant="secondary" className="self-start sm:self-auto">
                          {day.totalCalories} cal
                        </Badge>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {day.totalMacros.protein}g protein • {day.totalMacros.carbs}g carbs • {day.totalMacros.fats}g fats
                      </p>
                    </CardHeader>
                  </Card>
                  
                  {/* Meals Grid */}
                  <div className="grid gap-4">
                    {day.meals.map((meal, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-start justify-between sm:block">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  <span className="break-words">{meal.name}</span>
                                  <MealVerificationBadge validation={meal.usdaValidation} />
                                </CardTitle>
                                <Badge variant="outline" className="sm:hidden">{meal.timeOfDay}</Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                {meal.calories} cal • {meal.prepTime} min prep
                              </p>
                            </div>
                            <Badge variant="outline" className="hidden sm:inline-flex">{meal.timeOfDay}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                          {/* Macros */}
                          <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg">
                            <div className="text-center">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Protein</p>
                              <p className="text-sm sm:text-base font-semibold">{meal.macros.protein}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Carbs</p>
                              <p className="text-sm sm:text-base font-semibold">{meal.macros.carbs}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] sm:text-xs text-muted-foreground">Fats</p>
                              <p className="text-sm sm:text-base font-semibold">{meal.macros.fats}g</p>
                            </div>
                          </div>
                          
                          {/* Ingredients */}
                          <div>
                            <h5 className="text-sm sm:text-base font-medium mb-2 flex items-center gap-2">
                              <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Ingredients
                            </h5>
                            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                              {meal.ingredients.map((ingredient, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{ingredient}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Instructions */}
                          <div>
                            <h5 className="text-sm sm:text-base font-medium mb-2 flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Instructions
                            </h5>
                            <ol className="text-xs sm:text-sm text-muted-foreground space-y-2">
                              {meal.instructions.map((instruction, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="font-medium mr-2">{i + 1}.</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                  {plan.error || 'Something went wrong while generating your meal plan.'}
                </p>
                <Button asChild className="cursor-pointer">
                  <Link href="/meal-plans/new" className="cursor-pointer">Generate New Plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}