"use client"

import { useState, useEffect } from "react"
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
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress"
import { UnitToggle } from "@/components/onboarding/unit-toggle"
import { useUser } from "@/contexts/user-context"
import type { Units, Gender } from "@/types"
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
  validateHeight,
  validateWeight,
  validateAge,
} from "@/lib/calculations"
import Link from "next/link"

const formSchema = z.object({
  height: z.number().min(120).max(250),
  weight: z.number().min(30).max(300),
  age: z.number().min(18).max(100),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  preferredUnits: z.enum(["metric", "imperial"]),
})

type FormValues = z.infer<typeof formSchema>

export default function PhysicalMetricsPage() {
  const router = useRouter()
  const { onboardingData, updateOnboardingData } = useUser()
  const [units, setUnits] = useState<Units>("metric")

  // Display values (for imperial)
  const [heightFeet, setHeightFeet] = useState(5)
  const [heightInches, setHeightInches] = useState(9)
  const [weightLbs, setWeightLbs] = useState(150)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: onboardingData.height || 170,
      weight: onboardingData.weight || 70,
      age: onboardingData.age || 25,
      gender: onboardingData.gender || "male",
      preferredUnits: onboardingData.preferredUnits || "metric",
    },
  })

  // Initialize display values from form
  useEffect(() => {
    const height = form.getValues("height")
    const weight = form.getValues("weight")
    const savedUnits = form.getValues("preferredUnits")
    
    setUnits(savedUnits)
    
    if (savedUnits === "imperial") {
      const { feet, inches } = cmToFeetInches(height)
      setHeightFeet(feet)
      setHeightInches(inches)
      setWeightLbs(kgToLbs(weight))
    }
  }, [form])

  // Handle unit toggle
  const handleUnitsChange = (newUnits: Units) => {
    setUnits(newUnits)
    form.setValue("preferredUnits", newUnits)
    
    if (newUnits === "imperial") {
      const height = form.getValues("height")
      const weight = form.getValues("weight")
      const { feet, inches } = cmToFeetInches(height)
      setHeightFeet(feet)
      setHeightInches(inches)
      setWeightLbs(kgToLbs(weight))
    }
  }

  // Handle imperial height change
  const handleHeightChange = (feet: number, inches: number) => {
    setHeightFeet(feet)
    setHeightInches(inches)
    const cm = feetInchesToCm(feet, inches)
    form.setValue("height", cm)
  }

  // Handle imperial weight change
  const handleWeightLbsChange = (lbs: number) => {
    setWeightLbs(lbs)
    const kg = lbsToKg(lbs)
    form.setValue("weight", kg)
  }

  function onSubmit(values: FormValues) {
    updateOnboardingData({
      height: values.height,
      weight: values.weight,
      age: values.age,
      gender: values.gender,
      preferredUnits: values.preferredUnits,
    })
    router.push("/onboarding/fitness")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <OnboardingProgress currentStep={1} totalSteps={4} />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Unit Toggle */}
              <div className="flex justify-end">
                <FormField
                  control={form.control}
                  name="preferredUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <UnitToggle
                          value={units}
                          onChange={handleUnitsChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Height */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height</FormLabel>
                    {units === "metric" ? (
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="170"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            cm
                          </span>
                        </div>
                      </FormControl>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            placeholder="5"
                            value={heightFeet}
                            onChange={(e) => handleHeightChange(Number(e.target.value), heightInches)}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ft
                          </span>
                        </div>
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            placeholder="9"
                            value={heightInches}
                            onChange={(e) => handleHeightChange(heightFeet, Number(e.target.value))}
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            in
                          </span>
                        </div>
                      </div>
                    )}
                    <FormDescription>
                      Your current height
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Weight */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder={units === "metric" ? "70" : "150"}
                          {...(units === "metric" 
                            ? field 
                            : { value: weightLbs, onChange: (e) => handleWeightLbsChange(Number(e.target.value)) }
                          )}
                          onChange={(e) => {
                            if (units === "metric") {
                              field.onChange(Number(e.target.value))
                            } else {
                              handleWeightLbsChange(Number(e.target.value))
                            }
                          }}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {units === "metric" ? "kg" : "lbs"}
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your current weight
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="pr-20"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          years
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      You must be 18 or older
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <label
                                htmlFor="male"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Male
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <label
                                htmlFor="female"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Female
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <label
                                htmlFor="other"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Other
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                              <label
                                htmlFor="prefer-not-to-say"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Prefer not to say
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Used for accurate calorie calculations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 cursor-pointer" asChild>
                  <Link href="/onboarding">
                    Back
                  </Link>
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer">
                  Next: Fitness Goals
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

