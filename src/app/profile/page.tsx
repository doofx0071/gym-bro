"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/contexts/user-context"
import { cmToFeetInches, kgToLbs } from "@/lib/calculations"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/onboarding")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  const units = user.preferredUnits || "metric"
  const heightDisplay = units === "metric"
    ? `${user.height} cm`
    : (() => {
        const { feet, inches } = cmToFeetInches(user.height)
        return `${feet}'${inches}"`
      })()

  const weightDisplay = units === "metric"
    ? `${user.weight} kg`
    : `${kgToLbs(user.weight)} lbs`

  const goalLabels = {
    "weight-loss": "Weight Loss",
    "muscle-gain": "Muscle Gain",
    maintenance: "Maintenance",
    athletic: "Athletic Performance",
    general: "General Fitness",
  }

  const fitnessLevelLabels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  }

  const activityLevelLabels = {
    sedentary: "Sedentary",
    "lightly-active": "Lightly Active",
    "moderately-active": "Moderately Active",
    "very-active": "Very Active",
    "extremely-active": "Extremely Active",
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Profile</h2>
        <p className="text-muted-foreground">
          View and manage your fitness profile
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Physical Metrics */}
        <Card>
            <CardHeader>
              <CardTitle>Physical Metrics</CardTitle>
              <CardDescription>Your body measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="text-lg font-semibold">{heightDisplay}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-lg font-semibold">{weightDisplay}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-lg font-semibold">{user.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="text-lg font-semibold capitalize">{user.gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Fitness Goals */}
        <Card>
            <CardHeader>
              <CardTitle>Fitness Goals</CardTitle>
              <CardDescription>Your fitness objectives and level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fitness Level</p>
                  <Badge variant="secondary" className="mt-1">
                    {fitnessLevelLabels[user.fitnessLevel]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Primary Goal</p>
                  <Badge variant="secondary" className="mt-1">
                    {goalLabels[user.primaryGoal]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activity Level</p>
                  <Badge variant="secondary" className="mt-1">
                    {activityLevelLabels[user.activityLevel]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Calculated Metrics */}
        <Card>
            <CardHeader>
              <CardTitle>Calculated Metrics</CardTitle>
              <CardDescription>Your personalized nutrition targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">BMR</p>
                  <p className="text-lg font-semibold">{user.bmr} cal</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TDEE</p>
                  <p className="text-lg font-semibold">{user.tdee} cal</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Calories</p>
                  <p className="text-lg font-semibold">{user.targetCalories} cal</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meals/Day</p>
                  <p className="text-lg font-semibold">{user.mealsPerDay}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Daily Macros</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Protein</p>
                    <p className="text-lg font-semibold text-primary">{user.macros.protein}g</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Carbs</p>
                    <p className="text-lg font-semibold text-primary">{user.macros.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fats</p>
                    <p className="text-lg font-semibold text-primary">{user.macros.fats}g</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Dietary Preferences */}
        {(user.dietaryPreference || user.allergies) && (
          <Card>
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>Your dietary restrictions and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.dietaryPreference && user.dietaryPreference !== "none" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Diet Type</p>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {user.dietaryPreference}
                    </Badge>
                  </div>
                )}
                {user.allergies && user.allergies.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {user.allergies.map((allergy) => (
                        <Badge key={allergy} variant="outline">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  )
}

