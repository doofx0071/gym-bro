"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, RefreshCw, Download, Trash2 } from "lucide-react"
import type { PlanStatus } from "@/types/plans"

interface PlanHeaderProps {
  title: string
  status: PlanStatus
  createdAt: Date
  updatedAt: Date
  error?: string
  onRegenerate?: () => void
  onDelete?: () => void
  onExport?: () => void
  isGenerating?: boolean
}

export function PlanHeader({
  title,
  status,
  createdAt,
  updatedAt,
  error,
  onRegenerate,
  onDelete,
  onExport,
  isGenerating = false
}: PlanHeaderProps) {
  const getStatusBadge = () => {
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {title}
          </h1>
          {getStatusBadge()}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
          <span>Created {formatDate(createdAt)}</span>
          {updatedAt.getTime() !== createdAt.getTime() && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>Updated {formatDate(updatedAt)}</span>
            </>
          )}
        </div>
        
        {error && status === 'failed' && (
          <div className="mt-2 text-sm text-destructive">
            Error: {error}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onRegenerate && status !== 'generating' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="cursor-pointer"
              disabled={isGenerating}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onExport && status === 'completed' && (
              <DropdownMenuItem 
                onClick={onExport}
                className="cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Plan
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={onDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Plan
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}