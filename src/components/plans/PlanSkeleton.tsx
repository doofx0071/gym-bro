interface PlanSkeletonProps {
  variant?: 'list' | 'detail'
}

export function PlanSkeleton({ variant = 'detail' }: PlanSkeletonProps) {
  if (variant === 'list') {
    return <PlanListSkeleton />
  }
  
  return <PlanDetailSkeleton />
}

function PlanListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted-foreground/20 rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted-foreground/20 rounded animate-pulse" />
      </div>
      
      {/* Plan Cards */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-48 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-8 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 pb-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-6 w-24 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted-foreground/20 rounded animate-pulse" />
              </div>
              <div className="h-7 w-16 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Content Accordion */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border rounded-lg">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-5 w-32 bg-muted-foreground/20 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted-foreground/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}