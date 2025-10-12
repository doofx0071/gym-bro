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

const formSchema = z.object({
  activityLevel: z.enum([
    "sedentary",
    "lightly-active",
    "moderately-active",
    "very-active",
    "extremely-active",
  ]),
})

type FormValues = z.infer<typeof formSchema>

const activityLevels = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little to no exercise, desk job",
    details: "Mostly sitting throughout the day",
    multiplier: "1.2x",
  },
  {
    value: "lightly-active",
    label: "Lightly Active",
    description: "Light exercise 1-3 days per week",
    details: "Walking, light cardio, or recreational activities",
    multiplier: "1.375x",
  },
  {
    value: "moderately-active",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days per week",
    details: "Regular gym sessions or sports",
    multiplier: "1.55x",
  },
  {
    value: "very-active",
    label: "Very Active",
    description: "Hard exercise 6-7 days per week",
    details: "Intense training or physically demanding job",
    multiplier: "1.725x",
  },
  {
    value: "extremely-active",
    label: "Extremely Active",
    description: "Very hard exercise & physical job",
    details: "Professional athlete or very physical occupation",
    multiplier: "1.9x",
  },
] as const

export default function ActivityLevelPage() {
  const router = useRouter()
  const { onboardingData, updateOnboardingData } = useUser()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityLevel: onboardingData.activityLevel || "moderately-active",
    },
  })

  function onSubmit(values: FormValues) {
    updateOnboardingData({
      activityLevel: values.activityLevel,
    })
    router.push("/onboarding/dietary")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <OnboardingProgress currentStep={3} totalSteps={4} />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">
                      How active are you?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        {activityLevels.map((level) => (
                          <FormItem key={level.value}>
                            <FormControl>
                              <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value={level.value} id={level.value} />
                                <label
                                  htmlFor={level.value}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{level.label}</span>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                      {level.multiplier}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {level.description}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {level.details}
                                  </div>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      This determines your Total Daily Energy Expenditure (TDEE). 
                      The multiplier shows how much your activity increases your calorie needs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Be honest about your activity level. 
                  Overestimating can lead to weight gain, while underestimating can slow your progress.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 cursor-pointer" asChild>
                  <Link href="/onboarding/fitness">
                    Back
                  </Link>
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer">
                  Next: Dietary Preferences
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

