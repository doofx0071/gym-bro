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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const FOOD_RESTRICTIONS = [
  { value: 'vegetarian', label: 'No Meat (Vegetarian)', info: 'No pork, beef, chicken. Eggs and dairy OK. Fish depends on preference.' },
  { value: 'vegan', label: 'Plant-Based Only (Vegan)', info: 'No meat, fish, eggs, dairy. Only vegetables, fruits, grains, legumes.' },
  { value: 'pescatarian', label: 'Fish OK, No Meat', info: 'No pork, beef, chicken. Fish and seafood are allowed.' },
  { value: 'no-pork', label: 'No Pork', info: 'Excludes pork and pork products. Other meats OK.' },
  { value: 'no-red-meat', label: 'No Red Meat', info: 'No pork or beef. Chicken and fish are OK.' },
  { value: 'keto', label: 'Minimize Rice & Carbs (Keto)', info: 'Very low carb diet. Rice replaced with cauliflower rice or skipped. Focus on meat, eggs, veggies.' },
  { value: 'low-carb', label: 'Reduce Rice Portions', info: 'Less rice than normal. Smaller carb portions, more protein and vegetables.' },
  { value: 'high-protein', label: 'Extra Protein', info: 'More eggs, fish, chicken, and meat. Good for muscle building.' },
  { value: 'gluten-free', label: 'No Gluten', info: 'No wheat, bread, regular soy sauce. Use gluten-free alternatives.' },
  { value: 'dairy-free', label: 'No Dairy', info: 'No milk, cheese, butter. Use coconut milk or other alternatives.' }
]

const CUISINE_PREFERENCES = [
  { value: 'traditional-filipino', label: 'Traditional Filipino', info: 'Classic dishes: Adobo, Sinigang, Kare-Kare, Menudo, Caldereta' },
  { value: 'home-style-filipino', label: 'Home-Style Filipino', info: 'Everyday comfort food: Tinola, Ginisang Monggo, Tortang Talong, Nilaga' },
  { value: 'modern-filipino', label: 'Modern Filipino', info: 'Updated recipes, healthier versions, fusion dishes' },
  { value: 'street-food-inspired', label: 'Street Food Inspired', info: 'Isaw, Fishballs, Kwek-Kwek, Balut, Taho, Turon, BBQ' },
  { value: 'regional-filipino', label: 'Regional Specialties', info: 'Bicol Express, Sisig, Lechon, Pinakbet, Laing, Ilocano dishes' },
  { value: 'healthy-filipino', label: 'Healthy Filipino', info: 'Lighter versions with less oil, more vegetables, grilled instead of fried' }
]

const COMMON_ALLERGIES = [
  { value: 'nuts', label: 'Nuts', info: 'Tree nuts: cashews, almonds, walnuts (peanuts listed separately)' },
  { value: 'peanuts', label: 'Peanuts', info: 'Peanuts and peanut butter. We\'ll skip Kare-Kare and satay.' },
  { value: 'shellfish', label: 'Shellfish', info: 'Shrimp, crabs, mussels, oysters, tahong, alimango' },
  { value: 'fish', label: 'All Fish/Seafood', info: 'All fish and seafood products' },
  { value: 'eggs', label: 'Eggs', info: 'Chicken eggs and egg-based dishes' },
  { value: 'dairy', label: 'Dairy Products', info: 'Milk, cheese, butter, cream' },
  { value: 'soy', label: 'Soy', info: 'Soybeans, tofu, some soy sauces' },
  { value: 'gluten', label: 'Gluten (Wheat)', info: 'Wheat, bread, regular soy sauce, pasta' },
  { value: 'sesame', label: 'Sesame', info: 'Sesame seeds and sesame oil' }
]

export function GenerateMealPlanForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const form = useForm<GenerateMealPlanInput>({
    resolver: zodResolver(GenerateMealPlanInputSchema),
    defaultValues: {
      targetCalories: 2000,
      macroGoals: {
        protein: 150,
        carbs: 200,
        fats: 65
      },
      mealsPerDay: 3,
      dietaryPreferences: [],
      allergies: [],
      cuisinePreferences: ['traditional-filipino'],
      cookingTime: 'moderate',
      cookingSkill: 'intermediate',
      budget: 'moderate',
      mealPrepFriendly: false,
    },
  })

  // Reset form to default values on mount
  useEffect(() => {
    form.reset({
      targetCalories: 2000,
      macroGoals: {
        protein: 150,
        carbs: 200,
        fats: 65
      },
      mealsPerDay: 3,
      dietaryPreferences: [],
      allergies: [],
      cuisinePreferences: ['traditional-filipino'],
      cookingTime: 'moderate',
      cookingSkill: 'intermediate',
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
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Meal Plan</h1>
        <p className="text-muted-foreground">
          Create a personalized meal plan tailored to your goals and preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Masonry grid layout */}
          <div className="columns-1 lg:columns-2 gap-6 space-y-6 lg:space-y-0">
          <Card className="break-inside-avoid mb-6">
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

          <Card className="break-inside-avoid mb-6">
            <CardHeader>
              <CardTitle>Nutrition Goals</CardTitle>
              <CardDescription>
                Set your macro targets (optional - will be calculated from calories if not set)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="macroGoals.protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein Target (grams/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Recommended: 0.7-1g per lb of body weight for muscle building
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="macroGoals.carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbohydrates Target (grams/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="200"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Primary energy source - adjust based on activity level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="macroGoals.fats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fats Target (grams/day)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="65"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Essential for hormone production - aim for 20-30% of calories
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="break-inside-avoid mb-6">
            <CardHeader>
              <CardTitle>Food Preferences & Restrictions</CardTitle>
              <CardDescription>
                Customize your meals based on your dietary needs and preferences (All optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {/* Dietary Restrictions & Goals */}
                <AccordionItem value="dietary-restrictions">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline hover:bg-accent/50 cursor-pointer transition-colors rounded-md px-2 -mx-2">
                    Dietary Restrictions & Goals
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormField
                      control={form.control}
                      name="dietaryPreferences"
                      render={() => (
                        <FormItem>
                          <FormDescription className="mb-3">
                            Select any dietary restrictions or nutritional goals you want to follow
                          </FormDescription>
                          <div className="grid grid-cols-1 gap-3">
                            {FOOD_RESTRICTIONS.map((restriction) => (
                              <FormField
                                key={restriction.value}
                                control={form.control}
                                name="dietaryPreferences"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={restriction.value}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3 bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(restriction.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), restriction.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== restriction.value
                                                  )
                                                )
                                          }}
                                          className="cursor-pointer mt-0.5"
                                        />
                                      </FormControl>
                                      <div className="flex-1 space-y-1 cursor-pointer">
                                        <FormLabel className="text-sm font-medium cursor-pointer leading-none">
                                          {restriction.label}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground leading-snug">
                                          {restriction.info}
                                        </p>
                                      </div>
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
                  </AccordionContent>
                </AccordionItem>

                {/* Food Allergies */}
                <AccordionItem value="allergies">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline hover:bg-accent/50 cursor-pointer transition-colors rounded-md px-2 -mx-2">
                    ⚠️ Food Allergies & Health Safety
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={() => (
                        <FormItem>
                          <FormDescription className="mb-3">
                            Select any foods you&apos;re allergic to - we&apos;ll avoid them completely
                          </FormDescription>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {COMMON_ALLERGIES.map((allergy) => (
                              <FormField
                                key={allergy.value}
                                control={form.control}
                                name="allergies"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={allergy.value}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3 bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(allergy.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), allergy.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== allergy.value
                                                  )
                                                )
                                          }}
                                          className="cursor-pointer mt-0.5"
                                        />
                                      </FormControl>
                                      <div className="flex-1 space-y-1 cursor-pointer">
                                        <FormLabel className="text-sm font-medium cursor-pointer leading-none">
                                          {allergy.label}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground leading-snug">
                                          {allergy.info}
                                        </p>
                                      </div>
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
                  </AccordionContent>
                </AccordionItem>

                {/* Filipino Food Style */}
                <AccordionItem value="cuisine-preferences">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline hover:bg-accent/50 cursor-pointer transition-colors rounded-md px-2 -mx-2">
                    🇵🇭 Filipino Food Style
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormField
                      control={form.control}
                      name="cuisinePreferences"
                      render={() => (
                        <FormItem>
                          <FormDescription className="mb-3">
                            What type of Filipino dishes do you want? (Select all you like)
                          </FormDescription>
                          <div className="grid grid-cols-1 gap-3">
                            {CUISINE_PREFERENCES.map((cuisine) => (
                              <FormField
                                key={cuisine.value}
                                control={form.control}
                                name="cuisinePreferences"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={cuisine.value}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3 bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(cuisine.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), cuisine.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== cuisine.value
                                                  )
                                                )
                                          }}
                                          className="cursor-pointer mt-0.5"
                                        />
                                      </FormControl>
                                      <div className="flex-1 space-y-1 cursor-pointer">
                                        <FormLabel className="text-sm font-medium cursor-pointer leading-none">
                                          {cuisine.label}
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground leading-snug">
                                          {cuisine.info}
                                        </p>
                                      </div>
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="break-inside-avoid mb-6">
            <CardHeader>
              <CardTitle>Cooking Preferences</CardTitle>
              <CardDescription>
                Tell us about your cooking style and constraints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cookingSkill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooking Skill Level</FormLabel>
                    <FormControl>
                      <Select value={field.value || 'intermediate'} onValueChange={field.onChange}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select your cooking skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (Simple recipes)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (Moderate complexity)</SelectItem>
                          <SelectItem value="advanced">Advanced (Complex techniques)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      We&apos;ll match recipe complexity to your skill level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

          {/* Buttons inside masonry grid */}
          <div className="break-inside-avoid mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto order-2 sm:order-1 cursor-pointer min-w-[120px]"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating} className="w-full sm:w-auto order-1 sm:order-2 cursor-pointer min-w-[200px]">
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
          </div>
          </div>
          {/* End masonry grid */}
        </form>
      </Form>
    </div>
  )
}
