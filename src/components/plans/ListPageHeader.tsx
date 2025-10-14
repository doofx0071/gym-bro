"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface ListPageHeaderProps {
  title: string
  description: string
  generateUrl: string
}

export function ListPageHeader({ title, description, generateUrl }: ListPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      
      <Button asChild className="cursor-pointer">
        <Link href={generateUrl} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Generate New Plan
        </Link>
      </Button>
    </div>
  )
}