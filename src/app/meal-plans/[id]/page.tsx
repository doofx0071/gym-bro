"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { getMealPlanByIdClient } from "@/lib/data/plans-client"
import type { MealPlanData } from "@/types/plans"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Target, Utensils } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const isGenerating = searchParams.get('generating') === 'true'

  const loadPlan = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
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
      setIsLoading(false)
    }
  }, [user, params.id])

  // Poll for plan status if it's being generated
  useEffect(() => {
    if (!isGenerating || !plan || plan.status !== 'generating') return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/meal-plans/${params.id}/status`)
        const data = await response.json()
        
        if (response.ok) {
          setProgress(data.progress)
          
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

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <div className="mb-8">
          <div className="h-9 w-64 bg-muted-foreground/20 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted-foreground/20 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-muted-foreground/20 rounded-lg animate-pulse" />
          <div className="h-96 bg-muted-foreground/20 rounded-lg animate-pulse" />
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
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/meal-plans">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Meal Plans
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
            <p className="text-muted-foreground mb-4">Meal plan not found</p>
            <Button variant="outline" asChild>
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
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/meal-plans">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{plan.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(plan.status)}
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{plan.goal}</span>
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
                Generating Your Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Please wait while we create your personalized meal plan...
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
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Daily Calories</p>
                  <p className="text-2xl font-bold">{plan.calories.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
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
          
          <Card>
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

        {/* Days */}
        {plan.status === 'completed' && plan.days && plan.days.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Weekly Meal Plan</h2>
            {plan.days.map((day) => (
              <Card key={day.dayIndex}>
                <CardHeader>
                  <CardTitle>{day.dayLabel}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {day.totalCalories} calories • {day.totalMacros.protein}g protein
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {day.meals.map((meal, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{meal.name}</h4>
                          <Badge variant="outline">{meal.timeOfDay}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {meal.calories} cal • {meal.prepTime} min prep
                        </p>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Ingredients:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {meal.ingredients.map((ingredient, i) => (
                                <li key={i}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium">Instructions:</p>
                            <ol className="text-sm text-muted-foreground list-decimal list-inside">
                              {meal.instructions.map((instruction, i) => (
                                <li key={i}>{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
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
                  {plan.error || 'Something went wrong while generating your meal plan.'}
                </p>
                <Button asChild>
                  <Link href="/meal-plans/new">Generate New Plan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}