"use client"

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { Separator } from '@/components/ui/separator'

// Pages that should have sidebar layout
const sidebarPages = [
  '/dashboard',
  '/profile', 
  '/settings',
  '/workout-plans',
  '/meal-plans',
  '/exercises'
]

interface SidebarLayoutProviderProps {
  children: ReactNode
}

export function SidebarLayoutProvider({ children }: SidebarLayoutProviderProps) {
  const pathname = usePathname()
  const hasSidebar = sidebarPages.some(page => pathname.startsWith(page))
  
  if (!hasSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="w-full">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {pathname.startsWith('/dashboard') && 'Dashboard'}
              {pathname.startsWith('/profile') && 'Profile'}
              {pathname.startsWith('/settings') && 'Settings'}
              {pathname.startsWith('/workout-plans') && 'Workout Plans'}
              {pathname.startsWith('/meal-plans') && 'Meal Plans'}
              {pathname.startsWith('/exercises') && 'Exercise Library'}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
