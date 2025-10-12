'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * OTP verification is now integrated into the login page.
 * This page redirects to login for better UX.
 */
export default function VerifyOtpPage() {
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

