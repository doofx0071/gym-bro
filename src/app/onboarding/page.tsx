"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Utensils, User, Activity } from "lucide-react"
import { useUser } from "@/contexts/user-context"

export default function OnboardingStart() {
  const router = useRouter()
  const { user, isLoading } = useUser()
  const hasRedirected = useRef(false)

  // Redirect to dashboard if user already has a profile
  useEffect(() => {
    if (!isLoading && user && !hasRedirected.current) {
      hasRedirected.current = true
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Let's Get Started!
        </h1>
        <p className="text-lg text-muted-foreground">
          We'll ask you a few questions to create your personalized fitness and nutrition plans.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This will only take 2-3 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Physical Metrics</CardTitle>
            <CardDescription>
              Height, weight, age, and gender
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Fitness Goals</CardTitle>
            <CardDescription>
              Your fitness level and primary objectives
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Activity Level</CardTitle>
            <CardDescription>
              How active you are throughout the week
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Dietary Preferences</CardTitle>
            <CardDescription>
              Food preferences and restrictions (optional)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium">100% Free</p>
                <p className="text-sm text-muted-foreground">
                  No credit card required. Get your personalized plans instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium">Privacy First</p>
                <p className="text-sm text-muted-foreground">
                  Your data stays on your device. We don't store your personal information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium">AI-Powered</p>
                <p className="text-sm text-muted-foreground">
                  Advanced AI creates plans tailored specifically to your needs and goals.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button asChild variant="outline" size="lg" className="cursor-pointer">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
        <Button asChild size="lg" className="px-8 cursor-pointer">
          <Link href="/onboarding/physical">
            Start Onboarding
          </Link>
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        By continuing, you agree to consult with a healthcare professional before starting any new fitness or nutrition program.
      </p>
    </div>
  )
}

