'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Forgot password is now integrated into the login page.
 * This page redirects to login for better UX.
 */
export default function ForgotPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/auth/login')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting to login...</p>
    </div>
  )
}

