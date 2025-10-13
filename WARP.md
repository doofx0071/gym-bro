# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

**Project:** Gym Bro - AI-powered fitness and nutrition companion  
**Repository:** https://github.com/doofx0071/gym-bro  
**Status:** Production Ready (as of January 2025)  
**Last Updated:** January 13, 2025

## Tech Stack

- **Next.js** 15.5.4 (App Router, Turbopack enabled)
- **React** 19.1.0
- **TypeScript** 5 (strict mode)
- **Tailwind CSS** v4
- **Shadcn UI** (New York style) + Magic UI components
- **Supabase** (Auth, Postgres, Storage)
- **Unsplash API** for fitness images

## Common Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Build for production
npm start           # Run production build
npm run lint        # ESLint check

# Additional scripts (add if missing)
npm run typecheck   # TypeScript check (tsc --noEmit)
```

## Project Structure

### Core Routes
- `/` - Landing page with hero, stats, workout marquee
- `/auth/login`, `/auth/register` - Authentication with OTP verification
- `/onboarding` - 4-step user onboarding (physical, fitness, activity, dietary)
- `/dashboard` - Main user dashboard with stats and plans
- `/profile` - User profile display
- `/settings` - Settings with dark mode, notifications, security
- `/not-found` - Custom 404 page with Gym Bro branding and auth-aware navigation

### Key Files & Architecture

**Authentication & State:**
- `src/app/auth/actions.ts` - Server actions (signup, login, verifyOtp, resetPassword)
- `src/contexts/user-context.tsx` - Global user state (authUser, profile, meal/workout plans)
- `src/lib/supabase/` - Supabase client configs (client, server, middleware)
- `src/middleware.ts` - Route protection and session management

**Components:**
- `src/components/app-sidebar.tsx` - Desktop sidebar navigation
- `src/components/auth-form.tsx` - Unified auth component with inline mode switching
- `src/components/unsplash-photo.tsx` - Reusable Unsplash image with attribution
- `src/components/ui/` - Shadcn UI components

**Business Logic:**
- `src/types/index.ts` - TypeScript types (UserProfile, MealPlan, WorkoutPlan, etc.)
- `src/lib/calculations.ts` - BMR, TDEE, macro calculations using Mifflin-St Jeor equation
- `src/app/api/unsplash/` - Unsplash API proxy endpoints

## Environment Setup

Create `.env.local`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Unsplash (required)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema (Supabase)

**Tables with RLS enabled:**
- `user_profiles` - Core user data with NOT NULL constraints on auth_user_id
- `meal_plans` - JSON meal plans per user with foreign key constraints
- `workout_plans` - JSON workout plans per user with foreign key constraints

**Key columns in user_profiles:**
- Physical: `height_cm`, `weight_kg`, `age`, `gender`
- Fitness: `fitness_level`, `primary_goal`, `activity_level`  
- Dietary: `dietary_preference`, `allergies`, `meals_per_day`
- Calculated: `bmr`, `tdee`, `target_calories`, `macros` (JSONB)
- Constraints: `auth_user_id` NOT NULL UNIQUE, proper foreign keys

**Recent Schema Fixes:**
- ✅ Fixed column naming consistency (height_cm vs height)
- ✅ Added NOT NULL constraints on critical fields
- ✅ Implemented proper RLS policies for all tables
- ✅ Fixed 406 API errors by using explicit column selects

## Architecture Highlights

**Authentication Flow:**
1. Email/password registration → email verification required
2. Login → OTP sent to email → 8-digit code verification → dashboard
3. Route protection via middleware (protects `/onboarding`, `/dashboard`)
4. Smooth OTP verification without runtime errors (returns success, client handles redirect)

**State Management:**
- React Context for global user state
- LocalStorage keys: `gym-bro-user`, `gym-bro-meal-plan`, `gym-bro-workout-plan`, `gym-bro-onboarding`
- Session caching for Unsplash images to minimize API calls

**UI/UX:**
- Responsive design: Desktop sidebar + mobile bottom nav
- Loading skeletons use `bg-muted-foreground/20` with `animate-pulse`
- Dark mode support with instant toggle in settings
- Consistent cursor pointers on all interactive elements

## Development Workflows

**Fresh setup:**
```bash
git clone https://github.com/doofx0071/gym-bro
cd gym-bro
# Create and populate .env.local with your keys
npm install
npm run dev
```

**Test authentication flow:**
1. Visit `/auth/register` → create account → verify email
2. Visit `/auth/login` → enter credentials → check email for OTP → enter OTP
3. Should redirect to `/onboarding` (first time) or `/dashboard` (returning user)

**Test API endpoints:**
```bash
# Random gym photo
curl http://localhost:3000/api/unsplash

# Download tracking (replace URL from above response)
curl -I "http://localhost:3000/api/unsplash/download?url=https://images.unsplash.com/photo-..."
```

**Add Shadcn components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add sidebar
npx shadcn@latest add switch
```

## Troubleshooting

**Auth Issues:**
- Redirect loops: Check middleware is running and cookies are set
- OTP emails missing: Verify Supabase SMTP settings, check spam folder
- Environment variables: Ensure all NEXT_PUBLIC_ vars are correct

**Build Issues:**  
- Tailwind v4: Restart dev server after config changes
- TypeScript errors: Run `npm run typecheck` to see full errors

**API Issues:**
- Unsplash rate limit: Demo key limited to 50/hour, production gives 5,000/hour
- Clear Unsplash cache: DevTools → Session Storage → remove "auth_gym_photo_data"

## Deployment (Vercel)

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`

```bash
# Deploy
vercel --prod

# Pull env vars locally (optional)
vercel env pull .env.local
```

## Key Features Implemented

✅ **Complete authentication system** with email verification and OTP  
✅ **4-step onboarding** capturing physical metrics, fitness goals, activity level, dietary preferences  
✅ **Comprehensive dashboard** with stats, macros, and plan generation CTAs  
✅ **Profile and settings pages** with dark mode toggle and sidebar layouts  
✅ **Responsive navigation** - desktop sidebar, mobile bottom nav  
✅ **Unsplash integration** with proper attribution and download tracking  
✅ **BMR/TDEE calculations** using Mifflin-St Jeor equation  
✅ **TypeScript throughout** with strict mode and comprehensive type definitions  
✅ **Custom 404 page** with Gym Bro branding and contextual navigation  
✅ **Complete database schema** with RLS policies and proper constraints  
✅ **Error handling improvements** in user context with retry loop prevention  

## Documentation

See `mds/` folder for detailed documentation:
- `COMPLETION_SUMMARY.md` - All recent fixes and testing checklist
- `updated_summary.md` - Complete project overview and feature list
- `quick-start-checklist.md` - Step-by-step setup guide

---

**Status:** Production Ready  
**Last Updated:** January 2025  
**Next Phase:** AI meal plan and workout plan generation