"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Utensils, Dumbbell } from "lucide-react"

interface EmptyStateProps {
  type: 'meal' | 'workout'
}

export function EmptyState({ type }: EmptyStateProps) {
  const isMeal = type === 'meal'
  
  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 p-3 rounded-full bg-muted">
          {isMeal ? (
            <Utensils className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          No {isMeal ? 'meal' : 'workout'} plans yet
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          {isMeal 
            ? "Create your first AI-generated meal plan with personalized recipes and nutrition guidance tailored to your goals. Use the 'Generate New Plan' button in the top right to get started."
            : "Generate your first AI-powered workout plan with exercises designed for your fitness level and goals. Use the 'Generate New Plan' button in the top right to get started."
          }
        </p>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>AI-powered personalization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>{isMeal ? 'Nutrition focused' : 'Progressive training'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Easy to follow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Adaptable to your needs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}