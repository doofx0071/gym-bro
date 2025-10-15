"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, RefreshCw, Trash2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { createClient } from "@/lib/supabase/client"
import { PlanSkeleton } from "@/components/plans/PlanSkeleton"
import { EmptyState } from "@/components/plans/EmptyState"
import { ListPageHeader } from "@/components/plans/ListPageHeader"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { MealPlanSummary } from "@/types/plans"
import Link from "next/link"
import { toast } from "sonner"

export default function MealPlansPage() {
  const router = useRouter()
  const { user, authUser, isLoading: userLoading } = useUser()
  const [plans, setPlans] = useState<MealPlanSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlans() {
      if (!user || userLoading) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const supabase = createClient()
        const { data, error: dbError } = await supabase
          .from('meal_plans')
          .select('id, title, goal, calories, status, created_at, error')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (dbError) {
          setError('Failed to load meal plans')
        } else {
          const summaries: MealPlanSummary[] = (data || []).map(row => ({
            id: row.id,
            title: row.title,
            goal: row.goal,
            calories: row.calories,
            status: row.status,
            created_at: new Date(row.created_at),
            error: row.error
          }))
          setPlans(summaries)
        }
      } catch (err) {
        console.error('Failed to load meal plans:', err)
        setError('Failed to load meal plans')
      } finally {
        setIsLoading(false)
      }
    }

    if (user && !userLoading) {
      loadPlans()
    }
  }, [user, userLoading])

  // Redirect if not authenticated - only after loading is complete
  useEffect(() => {
    if (!userLoading && !isLoading && !authUser) {
      router.push('/auth/login')
    }
  }, [authUser, userLoading, isLoading, router])

  if (userLoading || isLoading) {
    return (
      <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
        <PlanSkeleton variant="list" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generating':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Generating...</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-300">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const handleRegenerate = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/meal-plans/${planId}/regenerate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate meal plan')
      }

      toast.success('Regenerating meal plan...')
      router.push(`/meal-plans/${planId}?generating=true`)
    } catch (err) {
      console.error('Failed to regenerate meal plan:', err)
      toast.error('Failed to regenerate meal plan')
    }
  }

  const handleDelete = async (planId: string) => {
    setDeletingPlanId(planId)
    try {
      const response = await fetch(`/api/meal-plans/${planId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete meal plan')
      }

      toast.success('Meal plan deleted successfully')
      
      // Remove from list
      setPlans(plans.filter(p => p.id !== planId))
    } catch (err) {
      console.error('Failed to delete meal plan:', err)
      toast.error('Failed to delete meal plan')
    } finally {
      setDeletingPlanId(null)
    }
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <ListPageHeader
          title="Meal Plans"
          description="AI-generated personalized meal plans tailored to your goals"
          generateUrl="/meal-plans/new"
        />

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive font-medium">Error loading meal plans</p>
            <p className="text-destructive/80 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Plans List */}
        {plans.length === 0 ? (
          <EmptyState type="meal" />
        ) : (
          <div className="grid gap-3 md:gap-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (plan.status === 'completed') {
                    router.push(`/meal-plans/${plan.id}`)
                  } else if (plan.status === 'generating') {
                    router.push(`/meal-plans/${plan.id}?generating=true`)
                  }
                }}
              >
                <CardHeader className="pb-3 md:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        {getStatusBadge(plan.status)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                        <span>{plan.goal}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{plan.calories.toLocaleString()} cal/day</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm">Created {formatDate(plan.created_at)}</span>
                      </div>
                      
                      {plan.error && plan.status === 'failed' && (
                        <div className="text-sm text-destructive">
                          {plan.error}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {plan.status === 'completed' && (
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/meal-plans/${plan.id}`} className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              View Plan
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {(plan.status === 'failed' || plan.status === 'completed') && (
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={(e) => handleRegenerate(plan.id, e)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {plan.status === 'failed' ? 'Retry Generation' : 'Regenerate'}
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Plan
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Meal Plan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{plan.title}&quot;. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="cursor-pointer bg-destructive hover:bg-destructive/90" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(plan.id)
                                }}
                                disabled={deletingPlanId === plan.id}
                              >
                                Delete Plan
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}