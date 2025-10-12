"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress"
import { useUser } from "@/contexts/user-context"
import Link from "next/link"
import { X } from "lucide-react"

const formSchema = z.object({
  dietaryPreference: z.enum(["none", "vegetarian", "vegan", "pescatarian", "keto", "paleo"]).optional(),
  mealsPerDay: z.number().min(3).max(6),
})

type FormValues = z.infer<typeof formSchema>

const dietaryPreferences = [
  {
    value: "none",
    label: "No Restrictions",
    description: "I eat everything",
  },
  {
    value: "vegetarian",
    label: "Vegetarian",
    description: "No meat, but eggs and dairy are okay",
  },
  {
    value: "vegan",
    label: "Vegan",
    description: "No animal products at all",
  },
  {
    value: "pescatarian",
    label: "Pescatarian",
    description: "Fish and seafood, but no other meat",
  },
  {
    value: "keto",
    label: "Keto",
    description: "Very low carb, high fat diet",
  },
  {
    value: "paleo",
    label: "Paleo",
    description: "Whole foods, no processed items",
  },
] as const

export default function DietaryPreferencesPage() {
  const router = useRouter()
  const { onboardingData, updateOnboardingData } = useUser()
  const [allergies, setAllergies] = useState<string[]>(onboardingData.allergies || [])
  const [allergyInput, setAllergyInput] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryPreference: onboardingData.dietaryPreference || "none",
      mealsPerDay: onboardingData.mealsPerDay || 3,
    },
  })

  const mealsPerDay = form.watch("mealsPerDay")

  const handleAddAllergy = () => {
    const trimmed = allergyInput.trim()
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed])
      setAllergyInput("")
    }
  }

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddAllergy()
    }
  }

  function onSubmit(values: FormValues) {
    updateOnboardingData({
      dietaryPreference: values.dietaryPreference,
      mealsPerDay: values.mealsPerDay,
      allergies: allergies.length > 0 ? allergies : undefined,
    })
    router.push("/onboarding/review")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <OnboardingProgress currentStep={4} totalSteps={4} />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Dietary Preference */}
              <FormField
                control={form.control}
                name="dietaryPreference"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">
                      Do you have any dietary preferences?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        {dietaryPreferences.map((pref) => (
                          <FormItem key={pref.value}>
                            <FormControl>
                              <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value={pref.value} id={pref.value} />
                                <label
                                  htmlFor={pref.value}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">{pref.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {pref.description}
                                  </div>
                                </label>
                              </div>
                            </FormControl>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      We'll create meal plans that match your dietary preferences
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allergies */}
              <div className="space-y-3">
                <FormLabel className="text-lg font-semibold">
                  Any food allergies or intolerances? (Optional)
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., peanuts, dairy, gluten"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAllergy}
                  >
                    Add
                  </Button>
                </div>
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allergies.map((allergy) => (
                      <Badge key={allergy} variant="secondary" className="gap-1">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(allergy)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  We'll exclude these ingredients from your meal plans
                </p>
              </div>

              {/* Meals Per Day */}
              <FormField
                control={form.control}
                name="mealsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      How many meals do you prefer per day?
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            {mealsPerDay}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            meals per day
                          </span>
                        </div>
                        <Slider
                          min={3}
                          max={6}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                          <span>6</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {mealsPerDay === 3 && "Traditional 3 meals: breakfast, lunch, dinner"}
                      {mealsPerDay === 4 && "3 meals + 1 snack"}
                      {mealsPerDay === 5 && "3 meals + 2 snacks"}
                      {mealsPerDay === 6 && "6 smaller meals throughout the day"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> These preferences are optional. 
                  You can always regenerate your meal plan with different settings later.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 cursor-pointer" asChild>
                  <Link href="/onboarding/activity">
                    Back
                  </Link>
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer">
                  Review & Submit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

