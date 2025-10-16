'use client';

import { LogoLoader } from '@/components/logo-loader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SteamLoader } from '@/components/steam-loader';

export default function TestLoaderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted p-6 space-y-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Logo Loader Test</h1>
        <p className="text-muted-foreground">
          Testing the animated logo loader component with different configurations
        </p>
      </div>

      {/* Direct Comparison */}
      <section className="max-w-5xl mx-auto">
        <div className="bg-card border rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Side-by-Side Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">Original Animation</h3>
              <p className="text-xs text-muted-foreground mb-4">Draw → Pause 2s → Erase (8s cycle)</p>
              <LogoLoader size={120} text="Your current loader" />
            </div>
            <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">Steam-Style Animation</h3>
              <p className="text-xs text-muted-foreground mb-4">Smooth continuous motion (4s cycle)</p>
              <SteamLoader size={120} text="Smoother alternative" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Both use your brand red color (#db0000). Compare the smoothness and choose your favorite!
          </p>
        </div>
      </section>

      {/* Light Background Tests */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-6">Light Background - Original Loader</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Default - No text */}
            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Default (No Text)
              </h3>
              <LogoLoader />
            </div>

            {/* With Workout Plan text */}
            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Workout Plan Generation
              </h3>
              <LogoLoader text="Generating Your Workout Plan..." />
            </div>

            {/* With Meal Plan text */}
            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Meal Plan Generation
              </h3>
              <LogoLoader text="Creating Your Meal Plan..." />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">Light Background - Steam Loader</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Default - No text */}
            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Smooth Animation
              </h3>
              <SteamLoader />
            </div>

            {/* With Workout Plan text */}
            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Workout Plan (Steam)
              </h3>
              <SteamLoader text="Generating Your Workout Plan..." />
            </div>

            {/* With Meal Plan text */}
            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Meal Plan (Steam)
              </h3>
              <SteamLoader text="Creating Your Meal Plan..." />
            </div>
          </div>
        </div>

        {/* Different Sizes */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Different Sizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">Small (100px)</h3>
              <LogoLoader size={100} text="Processing..." />
            </div>

            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Default (150px)
              </h3>
              <LogoLoader size={150} text="Loading..." />
            </div>

            <div className="flex flex-col items-center p-8 bg-white rounded-lg border shadow-sm">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">Large (200px)</h3>
              <LogoLoader size={200} text="Almost there..." />
            </div>
          </div>
        </div>
      </section>

      {/* Dark Background Tests */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-6">Dark Background - Original Loader</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dark background with white text */}
            <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-lg border border-neutral-700 shadow-lg">
              <h3 className="text-sm font-medium mb-4 text-neutral-400">
                Default Dark Theme
              </h3>
              <LogoLoader text="Generating Your Workout Plan..." />
            </div>

            {/* Dark background with brand gradient color */}
            <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-lg border border-red-700 shadow-lg">
              <h3 className="text-sm font-medium mb-4 text-neutral-400">
                Brand Red Accent
              </h3>
              <LogoLoader
                className="text-red-500"
                text="Analyzing your fitness goals..."
              />
            </div>

            {/* Dark background emerald */}
            <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-lg border border-emerald-700 shadow-lg">
              <h3 className="text-sm font-medium mb-4 text-neutral-400">
                Emerald Accent
              </h3>
              <LogoLoader
                className="text-emerald-400"
                text="Creating your plan..."
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">Dark Background - Steam Loader</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dark Steam default */}
            <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-lg border border-red-700 shadow-lg">
              <h3 className="text-sm font-medium mb-4 text-neutral-400">
                Steam-Style (Brand Red)
              </h3>
              <SteamLoader text="Smooth continuous animation..." />
            </div>

            {/* Dark Steam red accent */}
            <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-lg border border-red-700 shadow-lg">
              <h3 className="text-sm font-medium mb-4 text-neutral-400">
                Steam Bright Red
              </h3>
              <SteamLoader
                className="text-red-500"
                text="Fast smooth motion..."
              />
            </div>

            {/* Dark Steam emerald */}
            <div className="flex flex-col items-center p-8 bg-neutral-900 rounded-lg border border-emerald-700 shadow-lg">
              <h3 className="text-sm font-medium mb-4 text-neutral-400">
                Steam Emerald
              </h3>
              <SteamLoader
                className="text-emerald-400"
                text="Alternative color option..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Real-world Example Card */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Real-World Example Card</h2>
        <div className="max-w-md mx-auto bg-card border rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-lg font-semibold">Generating Your Plan</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-2">Draw → Pause → Erase</p>
              <LogoLoader text="Original loader" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-2">Smooth Continuous</p>
              <SteamLoader text="Steam-style loader" />
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>✓ Analyzing your fitness goals</p>
            <p>✓ Selecting optimal exercises</p>
            <p className="opacity-50">⏳ Customizing workout schedule</p>
          </div>
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="max-w-5xl mx-auto">
        <div className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-2">Basic Usage:</p>
              <code className="block bg-background p-3 rounded border">
                {`<LogoLoader text="Loading..." />`}
              </code>
            </div>
            <div>
              <p className="font-medium mb-2">Custom Size:</p>
              <code className="block bg-background p-3 rounded border">
                {`<LogoLoader size={200} text="Processing..." />`}
              </code>
            </div>
            <div>
              <p className="font-medium mb-2">Custom Color:</p>
              <code className="block bg-background p-3 rounded border">
                {`<LogoLoader className="text-emerald-500" text="Creating..." />`}
              </code>
            </div>
            <div className="pt-4 border-t">
              <p className="text-muted-foreground">
                <strong>Next Steps:</strong> Replace the existing Progress component in your
                meal and workout plan generation flows with this LogoLoader component.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
