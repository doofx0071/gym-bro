"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/contexts/user-context"
import { Dumbbell, Utensils, User, TrendingUp, Flame, Target } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { user, authUser, mealPlan, workoutPlan, isLoading } = useUser()
  const hasRedirected = useRef(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Wait for auth to fully initialize before making redirect decisions
  useEffect(() => {
    // Give the auth context time to load the session
    const timer = setTimeout(() => {
      setAuthInitialized(true)
    }, 500) // Wait 0.5 seconds for auth to stabilize

    return () => clearTimeout(timer)
  }, [])

  // Redirect to onboarding if user is authenticated but hasn't completed onboarding
  useEffect(() => {
    // Only proceed if loading is complete AND auth has had time to initialize
    if (!isLoading && authInitialized && !hasRedirected.current) {
      hasRedirected.current = true
      
      // If user is logged in but has no profile, they need onboarding
      if (authUser && !user) {
        setTimeout(() => {
          router.push("/onboarding")
        }, 100)
      } else if (!authUser) {
        // Not logged in at all - redirect to login
        setTimeout(() => {
          router.push("/auth/login")
        }, 100)
      }
      // If both authUser and user exist, stay on dashboard (no action needed)
    }
  }, [authUser, user, isLoading, router, authInitialized])

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
      </div>
    )
  }

  if (!user) {
    return null
  }

  const goalLabels = {
    "weight-loss": "Weight Loss",
    "muscle-gain": "Muscle Gain",
    maintenance: "Maintenance",
    athletic: "Athletic Performance",
    general: "General Fitness",
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back! 💪</h2>
        <p className="text-muted-foreground">
          Here&apos;s your personalized fitness and nutrition dashboard
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Calories</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.targetCalories}</div>
              <p className="text-xs text-muted-foreground">cal/day target</p>
            </CardContent>
          </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Primary Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalLabels[user.primaryGoal]}</div>
              <p className="text-xs text-muted-foreground">Your focus</p>
            </CardContent>
          </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TDEE</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.tdee}</div>
              <p className="text-xs text-muted-foreground">cal/day burned</p>
            </CardContent>
          </Card>
      </div>

      {/* Macros Card */}
      <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Macros</CardTitle>
            <CardDescription>Your target macronutrient breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">{user.macros.protein}g</span>
                </div>
                <Progress value={33} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm text-muted-foreground">{user.macros.carbs}g</span>
                </div>
                <Progress value={33} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fats</span>
                  <span className="text-sm text-muted-foreground">{user.macros.fats}g</span>
                </div>
                <Progress value={33} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Today's Highlights - Only show if plans exist */}
      {(mealPlan || workoutPlan) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Today's Meals */}
          {mealPlan && mealPlan.days && mealPlan.days.length > 0 && (() => {
            const getCurrentDayIndex = () => {
              const today = new Date()
              const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
              return dayOfWeek === 0 ? 6 : dayOfWeek - 1
            }
            const todayIndex = getCurrentDayIndex()
            const todayMeals = mealPlan.days.find((day: { dayIndex?: number; dayOfWeek?: number }) => (day.dayIndex ?? day.dayOfWeek) === todayIndex)
            
            if (!todayMeals) return null
            
            return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-primary" />
                      Today&apos;s Meals
                    </CardTitle>
                    <Badge variant="default">Today</Badge>
                  </div>
                  <CardDescription>
                    {(todayMeals as { dayLabel?: string; totalCalories?: number }).dayLabel || 'Today'} • {(todayMeals as { totalCalories?: number }).totalCalories || 0} cal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {((todayMeals as { meals?: unknown[] }).meals || []).slice(0, 3).map((mealItem: unknown, index: number) => {
                      const meal = mealItem as {
                        name: string;
                        timeOfDay?: string;
                        type?: string;
                        calories?: number;
                        prepTime?: number;
                        nutrition?: { calories: number };
                      }
                      return (
                      <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{meal.name}</p>
                          <p className="text-xs text-muted-foreground">{meal.timeOfDay || meal.type || 'Meal'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{meal.calories || meal.nutrition?.calories || 0} cal</p>
                          <p className="text-xs text-muted-foreground">{meal.prepTime || 0}min</p>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                  <Separator />
                  <Button className="w-full cursor-pointer" variant="outline" asChild>
                    <Link href={`/meal-plans/${mealPlan.id}`}>View Full Plan</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })()}
          
          {/* Today's Workout */}
          {workoutPlan && ((workoutPlan as { schedule?: unknown[]; days?: unknown[] }).schedule || (workoutPlan as { days?: unknown[] }).days) && ((workoutPlan as { schedule?: unknown[] }).schedule || (workoutPlan as { days?: unknown[] }).days || []).length > 0 && (() => {
            const getCurrentDayIndex = () => {
              const today = new Date()
              const dayOfWeek = today.getDay()
              return dayOfWeek === 0 ? 6 : dayOfWeek - 1
            }
            const todayIndex = getCurrentDayIndex()
            const workoutDays = (workoutPlan as { schedule?: unknown[]; days?: unknown[] }).schedule || (workoutPlan as { days?: unknown[] }).days || []
            const todayWorkout = workoutDays.find((day: unknown) => {
              const dayItem = day as { dayIndex?: number; dayOfWeek?: number }
              return (dayItem.dayIndex ?? dayItem.dayOfWeek) === todayIndex
            })
            
            if (!todayWorkout) return null
            
            return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      Today&apos;s Workout
                    </CardTitle>
                    <Badge variant="default">Today</Badge>
                  </div>
                  <CardDescription>
                    {(todayWorkout as { dayLabel?: string; name?: string }).dayLabel || (todayWorkout as { name?: string }).name || 'Today&apos;s Workout'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(todayWorkout as { isRestDay?: boolean; restDay?: boolean }).isRestDay || (todayWorkout as { restDay?: boolean }).restDay ? (
                    <div className="text-center py-8">
                      <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium">Rest Day</p>
                      <p className="text-sm text-muted-foreground">Recovery & regeneration</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {((todayWorkout as { blocks?: unknown[] }).blocks || []).slice(0, 2).map((blockItem: unknown, blockIndex: number) => {
                          const block = blockItem as {
                            type: string;
                            name: string;
                            exercises?: unknown[];
                          }
                          return (
                          <div key={blockIndex} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={block.type === 'main' ? 'default' : 'secondary'} className="text-xs">
                                {block.type}
                              </Badge>
                              <p className="text-sm font-medium">{block.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {block.exercises?.length || 0} exercises
                            </p>
                          </div>
                          )
                        })}
                      </div>
                      <Separator />
                      <Button className="w-full cursor-pointer" variant="outline" asChild>
                        <Link href={`/workout-plans/${workoutPlan.id}`}>View Workout</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })()}
        </div>
      )}

      {/* Plans Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <CardTitle>Meal Plan</CardTitle>
              </div>
              {mealPlan && <Badge variant="secondary">Active</Badge>}
            </div>
            <CardDescription>
              {mealPlan
                ? "Your personalized 7-day meal plan"
                : "Generate your AI-powered meal plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mealPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Daily Calories:</span>
                  <span className="font-medium">{mealPlan.dailyCalories} cal</span>
                </div>
                <Separator />
                <Button className="w-full cursor-pointer" asChild>
                  <Link href="/meal-plans">View Meal Plan</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get a personalized 7-day meal plan with recipes, ingredients, and nutrition info.
                </p>
                <Button className="w-full cursor-pointer" asChild>
                  <Link href="/meal-plans/new">
                    <Utensils className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <CardTitle>Workout Plan</CardTitle>
              </div>
              {workoutPlan && <Badge variant="secondary">Active</Badge>}
            </div>
            <CardDescription>
              {workoutPlan
                ? "Your personalized workout routine"
                : "Generate your AI-powered workout plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workoutPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Days Per Week:</span>
                  <span className="font-medium">{workoutPlan.daysPerWeek}</span>
                </div>
                <Separator />
                <Button className="w-full cursor-pointer" asChild>
                  <Link href="/workout-plans">View Workout Plan</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get a personalized workout routine tailored to your fitness level and goals.
                </p>
                <Button className="w-full cursor-pointer" asChild>
                  <Link href="/workout-plans/new">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Generate Workout Plan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your fitness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="cursor-pointer" asChild>
              <Link href="/profile">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" className="cursor-pointer" asChild>
              <Link href="/settings">
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

