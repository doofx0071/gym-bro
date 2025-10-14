'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { GenerateMealPlanInputSchema } from '@/lib/validation/plans'
import type { GenerateMealPlanInput } from '@/types/plans'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const DIETARY_PREFERENCES = [
  'vegetarian',
  'vegan',
  'pescatarian',
  'keto',
  'paleo',
  'mediterranean',
  'low-carb',
  'high-protein',
  'gluten-free',
  'dairy-free'
]

const CUISINE_PREFERENCES = [
  'filipino',
  'asian-fusion',
  'traditional-filipino',
  'modern-filipino',
  'healthy-filipino',
  'street-food-inspired',
  'home-style-filipino',
  'regional-filipino'
]

const COMMON_ALLERGIES = [
  'nuts',
  'peanuts',
  'dairy',
  'eggs',
  'fish',
  'shellfish',
  'soy',
  'gluten',
  'sesame',
  'mustard'
]

export function GenerateMealPlanForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const form = useForm<GenerateMealPlanInput>({
    resolver: zodResolver(GenerateMealPlanInputSchema),
    defaultValues: {
      targetCalories: 2000,
      mealsPerDay: 3,
      dietaryPreferences: [],
      allergies: [],
      cuisinePreferences: ['filipino'],
      cookingTime: 'moderate',
      budget: 'moderate',
      mealPrepFriendly: false,
    },
  })

  // Reset form to default values on mount
  useEffect(() => {
    form.reset({
      targetCalories: 2000,
      mealsPerDay: 3,
      dietaryPreferences: [],
      allergies: [],
      cuisinePreferences: ['filipino'],
      cookingTime: 'moderate',
      budget: 'moderate',
      mealPrepFriendly: false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: GenerateMealPlanInput) {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/meal-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate meal plan')
      }
      
      toast.success('Your meal plan is being generated in the background!')

      // Redirect to the meal plan with status tracking
      router.push(`/meal-plans/${data.id}?generating=true`)
    } catch (error) {
      console.error('Error generating meal plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate meal plan')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Meal Plan</h1>
        <p className="text-muted-foreground">
          Create a personalized meal plan tailored to your goals and preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set your goals and basic meal plan preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Custom Meal Plan"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Give your meal plan a custom name (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Goal</FormLabel>
                    <FormControl>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select your primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                          <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                          <SelectItem value="performance">Athletic Performance</SelectItem>
                          <SelectItem value="general-health">General Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetCalories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Calories per Day</FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          min={800}
                          max={5000}
                          step={50}
                          value={[field.value || 2000]}
                          onValueChange={vals => field.onChange(vals[0])}
                          className="w-full cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>800</span>
                          <span className="font-semibold">{field.value || 2000} calories</span>
                          <span>5000</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Adjust based on your daily caloric needs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mealsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meals Per Day</FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString() || '3'} onValueChange={val => field.onChange(Number(val))}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select meals per day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 meals</SelectItem>
                          <SelectItem value="3">3 meals</SelectItem>
                          <SelectItem value="4">4 meals</SelectItem>
                          <SelectItem value="5">5 meals</SelectItem>
                          <SelectItem value="6">6 meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      How many meals would you like per day?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>
                Select your dietary style and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="dietaryPreferences"
                render={() => (
                  <FormItem>
                    <FormLabel>Dietary Style</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {DIETARY_PREFERENCES.map((preference) => (
                        <FormField
                          key={preference}
                          control={form.control}
                          name="dietaryPreferences"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={preference}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(preference)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), preference])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== preference
                                            )
                                          )
                                    }}
                                    className="cursor-pointer"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal capitalize cursor-pointer">
                                  {preference.replace('-', ' ')}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={() => (
                  <FormItem>
                    <FormLabel>Food Allergies</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {COMMON_ALLERGIES.map((allergy) => (
                        <FormField
                          key={allergy}
                          control={form.control}
                          name="allergies"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={allergy}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(allergy)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), allergy])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== allergy
                                            )
                                          )
                                    }}
                                    className="cursor-pointer"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal capitalize cursor-pointer">
                                  {allergy}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cuisinePreferences"
                render={() => (
                  <FormItem>
                    <FormLabel>Cuisine Preferences</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {CUISINE_PREFERENCES.map((cuisine) => (
                        <FormField
                          key={cuisine}
                          control={form.control}
                          name="cuisinePreferences"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={cuisine}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cuisine)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), cuisine])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== cuisine
                                            )
                                          )
                                    }}
                                    className="cursor-pointer"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal capitalize cursor-pointer">
                                  {cuisine.replace('-', ' ')}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cooking Preferences</CardTitle>
              <CardDescription>
                Tell us about your cooking style and constraints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cookingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooking Time Preference</FormLabel>
                    <FormControl>
                      <Select value={field.value || 'moderate'} onValueChange={field.onChange}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select cooking time preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quick">Quick (15-30 min)</SelectItem>
                          <SelectItem value="moderate">Moderate (30-60 min)</SelectItem>
                          <SelectItem value="elaborate">Elaborate (60+ min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Level</FormLabel>
                    <FormControl>
                      <Select value={field.value || 'moderate'} onValueChange={field.onChange}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select budget level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Budget-Friendly</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">Premium Ingredients</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mealPrepFriendly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 cursor-pointer">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">
                        Meal Prep Friendly
                      </FormLabel>
                      <FormDescription>
                        Generate meals that can be prepared in advance
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="cursor-pointer"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 order-2 sm:order-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating} className="flex-1 order-1 sm:order-2 cursor-pointer">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Meal Plan'
              )}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  )
}