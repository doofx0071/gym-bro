"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { GenerateMealPlanForm } from '@/components/forms/GenerateMealPlanForm'

export default function GenerateMealPlanPage() {
  const router = useRouter()
  const { authUser, isLoading } = useUser()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/auth/login')
    }
  }, [authUser, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authUser) {
    return null
  }

  return <GenerateMealPlanForm />
}
