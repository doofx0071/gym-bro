"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/contexts/user-context"
import { calculateAllMetrics, cmToFeetInches, kgToLbs } from "@/lib/calculations"
import Link from "next/link"
import { Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ReviewPage() {
  const router = useRouter()
  const { onboardingData, completeOnboarding, isLoading } = useUser()
  const [submitting, setSubmitting] = useState(false)

  // Calculate metrics for preview
  const metrics = onboardingData.height && onboardingData.weight && onboardingData.age && 
    onboardingData.gender && onboardingData.activityLevel && onboardingData.primaryGoal
    ? calculateAllMetrics(
        onboardingData.weight,
        onboardingData.height,
        onboardingData.age,
        onboardingData.gender,
        onboardingData.activityLevel,
        onboardingData.primaryGoal
      )
    : null

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await completeOnboarding()
      toast.success("Profile saved successfully!")
      router.push("/dashboard")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile"
      toast.error(errorMessage)
      console.error("Onboarding error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  // Format display values
  const units = onboardingData.preferredUnits || "metric"
  const heightDisplay = onboardingData.height
    ? units === "metric"
      ? `${onboardingData.height} cm`
      : (() => {
          const { feet, inches } = cmToFeetInches(onboardingData.height)
          return `${feet}'${inches}"`
        })()
    : "Not set"

  const weightDisplay = onboardingData.weight
    ? units === "metric"
      ? `${onboardingData.weight} kg`
      : `${kgToLbs(onboardingData.weight)} lbs`
    : "Not set"

  const genderLabels = {
    male: "Male",
    female: "Female",
    other: "Other",
    "prefer-not-to-say": "Prefer not to say",
  }

  const fitnessLevelLabels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  }

  const goalLabels = {
    "weight-loss": "Weight Loss",
    "muscle-gain": "Muscle Gain",
    maintenance: "Maintenance",
    athletic: "Athletic Performance",
    general: "General Fitness",
  }

  const activityLabels = {
    sedentary: "Sedentary",
    "lightly-active": "Lightly Active",
    "moderately-active": "Moderately Active",
    "very-active": "Very Active",
    "extremely-active": "Extremely Active",
  }

  const dietaryLabels = {
    none: "No Restrictions",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    keto: "Keto",
    paleo: "Paleo",
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Review Your Information</h1>
        <p className="text-muted-foreground">
          Make sure everything looks correct before we create your personalized plans
        </p>
      </div>

      <div className="space-y-6">
        {/* Physical Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Physical Metrics</CardTitle>
                <CardDescription>Your body measurements</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                <Link href="/onboarding/physical">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-medium">{heightDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium">{weightDisplay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium">{onboardingData.age || "Not set"} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender:</span>
              <span className="font-medium">
                {onboardingData.gender ? genderLabels[onboardingData.gender] : "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fitness Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fitness Profile</CardTitle>
                <CardDescription>Your fitness level and goals</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                <Link href="/onboarding/fitness">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fitness Level:</span>
              <span className="font-medium">
                {onboardingData.fitnessLevel
                  ? fitnessLevelLabels[onboardingData.fitnessLevel]
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Goal:</span>
              <span className="font-medium">
                {onboardingData.primaryGoal ? goalLabels[onboardingData.primaryGoal] : "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Activity Level */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity Level</CardTitle>
                <CardDescription>Your weekly activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                <Link href="/onboarding/activity">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Activity Level:</span>
              <span className="font-medium">
                {onboardingData.activityLevel
                  ? activityLabels[onboardingData.activityLevel]
                  : "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>Your food preferences</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                <Link href="/onboarding/dietary">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diet Type:</span>
              <span className="font-medium">
                {onboardingData.dietaryPreference
                  ? dietaryLabels[onboardingData.dietaryPreference]
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meals Per Day:</span>
              <span className="font-medium">{onboardingData.mealsPerDay || 3}</span>
            </div>
            {onboardingData.allergies && onboardingData.allergies.length > 0 && (
              <div>
                <span className="text-muted-foreground">Allergies:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {onboardingData.allergies.map((allergy) => (
                    <Badge key={allergy} variant="secondary">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculated Metrics Preview */}
        {metrics && (
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Your Personalized Targets</CardTitle>
              <CardDescription>Based on your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BMR (Basal Metabolic Rate):</span>
                <span className="font-medium">{metrics.bmr} cal/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TDEE (Total Daily Energy):</span>
                <span className="font-medium">{metrics.tdee} cal/day</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Target Calories:</span>
                <span className="font-bold text-primary">{metrics.targetCalories} cal/day</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{metrics.macros.protein}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{metrics.macros.carbs}g</div>
                  <div className="text-xs text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{metrics.macros.fats}g</div>
                  <div className="text-xs text-muted-foreground">Fats</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1 cursor-pointer" asChild>
            <Link href="/onboarding/dietary">Back</Link>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || isLoading}
            className="flex-1 cursor-pointer"
            size="lg"
          >
            {submitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Your Profile...
              </>
            ) : (
              "Create My Profile"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By creating your profile, you agree to consult with a healthcare professional before
          starting any new fitness or nutrition program.
        </p>
      </div>
    </div>
  )
}

