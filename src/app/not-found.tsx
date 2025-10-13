'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/user-context'
import { Home, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  const { authUser } = useUser()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 with Logo */}
        <div className="flex items-center justify-center gap-4">
          {/* Large 404 Text */}
          <h1 className="text-8xl sm:text-9xl font-bebas tracking-tight text-primary">
            404
          </h1>
          
          {/* Separator */}
          <div className="w-px h-20 sm:h-24 bg-border"></div>
          
          {/* Logo */}
          <div className="relative h-16 w-16 sm:h-20 sm:w-20">
            <Image
              src="/logo.svg"
              alt="Gym Bro Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Error Messages */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Sorry, the page you are looking for could not be found.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {authUser ? (
            <>
              {/* Show Dashboard button if user is logged in */}
              <Button asChild className="cursor-pointer">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" className="cursor-pointer">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </>
          ) : (
            <>
              {/* Show Home button if user is not logged in */}
              <Button asChild className="cursor-pointer">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="cursor-pointer">
                <Link href="/auth/login">
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please{' '}
            <a 
              href="mailto:support@gymbro.app" 
              className="text-primary hover:underline cursor-pointer"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}