"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress"
import { useUser } from "@/contexts/user-context"
import Link from "next/link"
import { Target, TrendingDown, TrendingUp, Activity, Heart } from "lucide-react"

const formSchema = z.object({
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  primaryGoal: z.enum(["weight-loss", "muscle-gain", "maintenance", "athletic", "general"]),
})

type FormValues = z.infer<typeof formSchema>

const fitnessLevels = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to working out or returning after a long break",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Regular exercise routine for 6+ months",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Consistent training for 2+ years with good form",
  },
] as const

const goals = [
  {
    value: "weight-loss",
    label: "Weight Loss",
    description: "Lose fat while preserving muscle mass",
    icon: TrendingDown,
  },
  {
    value: "muscle-gain",
    label: "Muscle Gain",
    description: "Build muscle and increase strength",
    icon: TrendingUp,
  },
  {
    value: "maintenance",
    label: "Maintenance",
    description: "Maintain current weight and fitness level",
    icon: Target,
  },
  {
    value: "athletic",
    label: "Athletic Performance",
    description: "Improve speed, power, and endurance",
    icon: Activity,
  },
  {
    value: "general",
    label: "General Fitness",
    description: "Overall health and wellness",
    icon: Heart,
  },
] as const

export default function FitnessGoalsPage() {
  const router = useRouter()
  const { onboardingData, updateOnboardingData } = useUser()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitnessLevel: onboardingData.fitnessLevel || "beginner",
      primaryGoal: onboardingData.primaryGoal || "general",
    },
  })

  function onSubmit(values: FormValues) {
    updateOnboardingData({
      fitnessLevel: values.fitnessLevel,
      primaryGoal: values.primaryGoal,
    })
    router.push("/onboarding/activity")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <OnboardingProgress currentStep={2} totalSteps={4} />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Fitness Level */}
              <FormField
                control={form.control}
                name="fitnessLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">
                      What's your current fitness level?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        {fitnessLevels.map((level) => (
                          <FormItem key={level.value}>
                            <FormControl>
                              <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value={level.value} id={level.value} />
                                <label
                                  htmlFor={level.value}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">{level.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {level.description}
                                  </div>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      This helps us create workouts at the right difficulty level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Primary Goal */}
              <FormField
                control={form.control}
                name="primaryGoal"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">
                      What's your primary fitness goal?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        {goals.map((goal) => {
                          const Icon = goal.icon
                          return (
                            <FormItem key={goal.value}>
                              <FormControl>
                                <div className="flex items-start space-x-3 space-y-0">
                                  <RadioGroupItem value={goal.value} id={goal.value} />
                                  <label
                                    htmlFor={goal.value}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4 text-primary" />
                                      <span className="font-medium">{goal.label}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {goal.description}
                                    </div>
                                  </label>
                                </div>
                              </FormControl>
                            </FormItem>
                          )
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      We'll adjust your calorie target and macros based on your goal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 cursor-pointer" asChild>
                  <Link href="/onboarding/physical">
                    Back
                  </Link>
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer">
                  Next: Activity Level
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

