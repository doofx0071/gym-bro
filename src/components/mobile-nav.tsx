"use client"

import * as React from "react"
import { Home, Dumbbell, Utensils, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Workouts",
    url: "/workout-plan",
    icon: Dumbbell,
  },
  {
    title: "Meals",
    url: "/meal-plan",
    icon: Utensils,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.url
          const Icon = item.icon
          
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="sr-only">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

