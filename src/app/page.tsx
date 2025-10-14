'use client'

import Image from 'next/image'
import { Zap } from 'lucide-react'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { Marquee } from '@/components/ui/marquee'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'

const workouts = [
  { icon: '💪', name: 'Push Day', exercises: 'Bench Press, Shoulder Press, Triceps' },
  { icon: '🏋️', name: 'Pull Day', exercises: 'Deadlifts, Pull-ups, Bicep Curls' },
  { icon: '🦵', name: 'Leg Day', exercises: 'Squats, Lunges, Leg Press' },
  { icon: '🔥', name: 'Core', exercises: 'Planks, Crunches, Russian Twists' },
  { icon: '🏃', name: 'Cardio', exercises: 'Running, Cycling, HIIT' },
  { icon: '⚡', name: 'Full Body', exercises: 'Compound Movements, Circuits' },
]

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Theme Toggler */}
      <div className="absolute top-4 right-4 z-50">
        <AnimatedThemeToggler className="h-10 w-10 rounded-full border bg-background p-2 hover:bg-accent cursor-pointer" />
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          {/* Gym Bro Heading with Mixed Custom Fonts */}
          <h1 className="mb-6 text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-black dark:text-white flex items-center justify-center gap-2">
            <span className="font-quotes-script">Gym</span>
            <span className="font-brice-bold">BRO</span>
          </h1>

          <div className="relative mx-auto mb-8 h-32 w-32">
            <Image src="/logo.svg" alt="Gym Bro Logo" fill className="object-contain" priority />
          </div>

          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">Your AI Fitness Companion</h2>

          <p className="mb-6 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto">Get AI-powered meal plans and workout routines tailored to your goals, fitness level, and dietary preferences.</p>

          <div className="flex justify-center mb-12">
            <ShimmerButton className="shadow-2xl cursor-pointer" onClick={() => (window.location.href = '/auth/register')}>
              <span className="flex items-center gap-2 cursor-pointer">
                <Zap className="h-4 w-4" />
                Get Started
              </span>
            </ShimmerButton>
          </div>
        </div>

        {/* Workouts Marquee Section - Full Width */}
        <div className="w-full mt-8">
          <h3 className="mb-6 text-center text-2xl font-bold sm:text-3xl">Popular Workouts</h3>

          <Marquee pauseOnHover className="[--duration:40s] bg-background">
            {workouts.map((workout, idx) => (
              <div key={idx} className={cn('relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 mx-3','border-gray-950/[.1] bg-background hover:bg-gray-950/[.05]','dark:border-gray-50/[.1] dark:bg-background dark:hover:bg-gray-50/[.15]','transition-all duration-300')}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{workout.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">{workout.name}</p>
                    <p className="text-xs text-muted-foreground">{workout.exercises}</p>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>
    </div>
  )
}
