'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { GenerateWorkoutPlanInputSchema } from '@/lib/validation/plans'
import { useAutoFormPersistence } from '@/lib/utils/form-persistence'
import type { GenerateWorkoutPlanInput } from '@/types/plans'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const EQUIPMENT_OPTIONS = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'kettlebells',
  'resistance-bands',
  'pull-up-bar',
  'bench',
  'squat-rack',
  'cable-machine',
  'machines',
  'yoga-mat',
  'foam-roller'
]

const COMMON_INJURIES = [
  'lower-back',
  'knee',
  'shoulder',
  'wrist',
  'ankle',
  'neck',
  'elbow',
  'hip'
]

export function GenerateWorkoutPlanForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const form = useForm<GenerateWorkoutPlanInput>({
    resolver: zodResolver(GenerateWorkoutPlanInputSchema),
    defaultValues: {
      daysPerWeek: 3,
      sessionLength: 60,
      focus: 'general',
      split: 'full-body',
      equipment: [],
      injuries: [],
      experience: 'beginner',
    },
  })

  // Form persistence
  const { clearSavedData } = useAutoFormPersistence(
    form.getValues() as Record<string, unknown>,
    (data) => form.reset({ ...form.getValues(), ...data }),
    {
      key: 'workout-plan-form-data',
      debounceMs: 1000,
      excludeFields: [] // Save all fields
    }
  )

  async function onSubmit(values: GenerateWorkoutPlanInput) {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/workout-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workout plan')
      }

      // Clear saved form data on successful submission
      clearSavedData()
      
      toast.success('Your workout plan is being generated in the background!')

      // Redirect to the workout plan with status tracking
      router.push(`/workout-plans/${data.id}?generating=true`)
    } catch (error) {
      console.error('Error generating workout plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate workout plan')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Workout Plan</h1>
        <p className="text-muted-foreground">
          Create a personalized workout plan tailored to your fitness goals and available equipment
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set your workout goals and basic preferences
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
                        placeholder="My Custom Workout Plan"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Give your workout plan a custom name (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="focus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Focus</FormLabel>
                    <FormControl>
                      <Select value={field.value || 'general'} onValueChange={field.onChange}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select your primary focus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Strength Building</SelectItem>
                          <SelectItem value="hypertrophy">Muscle Growth (Hypertrophy)</SelectItem>
                          <SelectItem value="endurance">Endurance & Conditioning</SelectItem>
                          <SelectItem value="general">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      What is your main fitness goal?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Experience</FormLabel>
                    <FormControl>
                      <Select value={field.value || 'beginner'} onValueChange={field.onChange}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (0-1 year)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                          <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      How long have you been training consistently?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Schedule</CardTitle>
              <CardDescription>
                Define your workout frequency and duration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="daysPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Per Week</FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          min={1}
                          max={7}
                          step={1}
                          value={[field.value || 3]}
                          onValueChange={vals => field.onChange(vals[0])}
                          className="w-full cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1 day</span>
                          <span className="font-semibold">{field.value || 3} days per week</span>
                          <span>7 days</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How many days per week do you want to work out?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Length</FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          min={15}
                          max={180}
                          step={15}
                          value={[field.value || 60]}
                          onValueChange={vals => field.onChange(vals[0])}
                          className="w-full cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>15 min</span>
                          <span className="font-semibold">{field.value || 60} minutes</span>
                          <span>3 hours</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How long do you want each workout session to be?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="split"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Split</FormLabel>
                    <FormControl>
                      <Select value={field.value || 'full-body'} onValueChange={field.onChange}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select workout split" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-body">Full Body</SelectItem>
                          <SelectItem value="upper-lower">Upper/Lower Split</SelectItem>
                          <SelectItem value="push-pull-legs">Push/Pull/Legs</SelectItem>
                          <SelectItem value="custom">Custom Split</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      How do you want to organize your workouts?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipment & Limitations</CardTitle>
              <CardDescription>
                Tell us about available equipment and any physical limitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="equipment"
                render={() => (
                  <FormItem>
                    <FormLabel>Available Equipment</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {EQUIPMENT_OPTIONS.map((equipment) => (
                        <FormField
                          key={equipment}
                          control={form.control}
                          name="equipment"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={equipment}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(equipment)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), equipment])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== equipment
                                            )
                                          )
                                    }}
                                    className="cursor-pointer"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal capitalize cursor-pointer">
                                  {equipment.replace('-', ' ')}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      Select all equipment you have access to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="injuries"
                render={() => (
                  <FormItem>
                    <FormLabel>Injuries or Areas to Avoid</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {COMMON_INJURIES.map((injury) => (
                        <FormField
                          key={injury}
                          control={form.control}
                          name="injuries"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={injury}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(injury)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), injury])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== injury
                                            )
                                          )
                                    }}
                                    className="cursor-pointer"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal capitalize cursor-pointer">
                                  {injury.replace('-', ' ')}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      Select any areas that need special consideration
                    </FormDescription>
                    <FormMessage />
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
                'Generate Workout Plan'
              )}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  )
}