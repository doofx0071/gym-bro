# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

**Project:** Gym Bro - AI-powered fitness and nutrition companion  
**Repository:** https://github.com/doofx0071/gym-bro  
**Status:** Production Ready + Phase 4 Complete (USDA Integration) (as of October 2025)  
**Last Updated:** October 16, 2025

## Tech Stack

- **Next.js** 15.5.4 (App Router, Turbopack enabled)
- **React** 19.1.0
- **TypeScript** 5 (strict mode)
- **Tailwind CSS** v4
- **Shadcn UI** (New York style) + Magic UI components
- **Supabase** (Auth, Postgres, Storage)
- **Unsplash API** for fitness images
- **ExerciseDB API** for 1300+ exercises with GIFs (self-hosted V1)
- **USDA FoodData Central API** for nutrition validation (400,000+ food items)
- **AI Services** - Mistral AI (mistral-large-latest for plan generation)

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

**AI Integration:**
- `src/lib/ai.ts` - Dual AI service integration (Groq + Mistral)
- `src/examples/ai-usage.ts` - Complete AI usage examples
- `src/hooks/use-auth-sync.tsx` - Enhanced auth synchronization hooks

## Environment Setup

Create `.env.local`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Unsplash (required)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# AI Services (required for AI features)
GROQ_API_KEY=your_groq_api_key_here  # Optional - used as fallback
MISTRAL_API_KEY=your_mistral_api_key_here  # Required for plan generation
GROQ_MODEL=llama-3.1-8b-instant
MISTRAL_MODEL=mistral-large-latest

# USDA FoodData Central (required for nutrition validation)
NEXT_PUBLIC_USDA_API_KEY=your_usda_api_key_here
USDA_API_KEY=your_usda_api_key_here

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
✅ **AI Integration Complete** - Dual AI setup with Groq + Mistral AI services  
✅ **ExerciseDB Integration** - 1300+ exercises with GIFs and alternative suggestions  
✅ **USDA Nutrition Validation** - Meal plans validated against 400,000+ verified foods

## Recent Updates (October 2025)

### 🔥 Latest Fixes: Workout Completion Detection (October 2025)
- **Completion Status Bug Fixed**: Past day workout completions now correctly show as "Completed Workout" in the UI
- **API Enhancement**: check-today endpoint accepts optional `date` query parameter for checking any day
- **Frontend Logic Rewrite**: Changed from calculating dates per weekday to scanning past 7 days of completed sessions
- **Day Matching Algorithm**: Matches completed sessions to scheduled days by checking if session label contains day name
- **Timezone Robust**: No longer dependent on date calculations that could be off by one day
- **Code Cleanup**: Removed all debug logging for cleaner code
- **UI States**: Workout plan buttons correctly reflect completion status for all days

### ✅ Phase 5.2: Workout Progress Tracking MVP Complete (October 2025)
- **Database Schema**: `workout_sessions` and `workout_set_logs` tables with `is_completed` and `completed_at` tracking
- **Logging System**: Real-time set logging with reps, weight, and RPE
- **History Display**: View previous workout performance for progressive overload
- **API Endpoints**: Session creation, set logging, history retrieval, completion check with date support
- **WorkoutLogger Component**: Complete logging UI with optimistic updates
- **Mobile First**: Number inputs, large touch targets, responsive design
- **Demo Page**: `/workout-logger-test` with sample exercises

### 🔥 Previous Fixes (October 16, 2025)
- **ExerciseDB API Integration**: Fixed array response handling for V1 API
- **Circuit Breaker Pattern**: Implemented with reset for robust API calls
- **Pagination**: Fixed exercises page with 25 items per page limit
- **Alternative Exercises**: Rewrote using filter endpoint with AI fallback logic
- **Mobile Responsiveness**: Improved "View Alternative Exercises" section
- **Instructions UI**: Cleaned up formatting, removed redundant numbering
- **Skeleton Loaders**: Standardized styling to match dashboard colors
- **Debug Logging**: Added comprehensive API call tracing
- **GIFs & Instructions**: Ensured proper display across all workout plans

### ✅ Phase 4: USDA FoodData Central Integration Complete (October 16, 2025)
- **USDA API Integration**: 400,000+ verified food items with comprehensive nutrition data
- **Meal Validation Service**: AI-generated meals validated against USDA database for accuracy
- **Ingredient Extraction**: Smart parsing extracts ingredients from meal descriptions
- **Confidence Scoring**: Each meal receives a validation confidence score (0-100%)
- **Database Migration**: Added `validation_status` and `validation_confidence` columns
- **Verification Badges**: Visual UI badges show USDA validation status on meal cards
- **Mobile Responsive Tooltips**: Tap-enabled tooltips with proper contrast in light/dark modes
- **Enhanced AI Prompts**: Updated to generate USDA-compatible ingredient names
- **Type-Safe Integration**: Complete TypeScript types for USDA data and validation
- **Documentation**: Complete integration guide and troubleshooting docs

### ✅ Phase 3.5: ExerciseDB Integration & Alternative Exercises Complete (October 16, 2025)
- **ExerciseDB API Integration**: 1300+ exercises with animated GIFs and detailed metadata
- **Exercise Library Page**: Searchable, filterable exercise catalog with infinite scroll
- **Exercise Detail Pages**: Full exercise info with GIFs, muscles worked, equipment, instructions
- **Alternative Exercise Suggestions**: Smart recommendations based on target muscles, body parts, equipment
- **Workout Exercise Cards Enhanced**: Collapsible alternatives section on workout plan cards
- **Mobile Responsive Layout**: Full-width exercise pages, sidebar for desktop, optimized touch targets
- **Cursor Pointer UX**: Consistent pointer styling across all interactive elements
- **API Routes**: `/api/exercises/[id]` and `/api/exercises/[id]/alternatives`
- **Type-Safe Integration**: Complete TypeScript types with Exercise and ExerciseDB interfaces
- **Helper Library**: `exercisedb-helper.ts` with similarity algorithms and mapping utilities

### ✅ Phase 3: Dashboard Enhancements & Plan Management Complete (October 15, 2025)
- **Today's Meal Card**: Dashboard card showing current day's meals from active plan
- **Today's Workout Card**: Dashboard card showing current day's workout from active plan
- **Plan Regeneration**: Regenerate meal and workout plans with confirmation dialogs
- **Plan Deletion**: Delete plans with confirmation dialogs from detail and list pages
- **Enhanced List Pages**: Fully functional dropdown menus with regenerate and delete actions
- **Toast Notifications**: User feedback for all actions (regenerate, delete, success, errors)
- **Cursor Pointer Styling**: Consistent cursor-pointer on all interactive elements
- **Alert Dialog Component**: Installed and integrated for all confirmation dialogs

### ✅ Phase 2: AI Plan Generation Complete (October 14, 2025)
- **Meal Plan Generation**: AI-powered Filipino meal plans using Mistral AI with JSON mode
- **Workout Plan Generation**: AI-powered workout plans using Mistral AI with JSON mode
- **Background Processing**: Async generation with status polling for better UX
- **Filipino Focus**: Comprehensive prompts for authentic Filipino dishes and ingredients
- **Robust Error Handling**: Nullable fields, proper validation, and graceful failures
- **Status Tracking**: Real-time generation status (generating, completed, failed)
- **Tabbed UI**: Clean day-by-day navigation with auto-select current day
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop screens
- **Today Indicator**: Automatic current day detection with visual badges

### ✅ AI Services Integration
- **Primary Provider**: Mistral AI (mistral-large-latest) for plan generation with JSON mode
- **Fallback Provider**: Groq (llama-3.1-8b-instant) for speed when Mistral unavailable
- **Type-Safe Integration**: Full TypeScript support with proper error handling
- **JSON Response Format**: Native JSON mode eliminates parsing errors
- **Usage Examples**: Complete implementation examples in `src/examples/ai-usage.ts`

### ✅ Bug Fixes & Code Quality
- **TypeScript Errors**: Fixed all compilation errors in contexts and hooks
- **ESLint Issues**: Resolved all linting warnings and errors
- **Build System**: Successful production build (4.8s compile time)
- **Context Management**: Fixed circular imports and unused variables
- **Type Safety**: Enhanced AI library with proper content type handling

### ✅ Build Status
- **TypeScript Check**: ✅ Passing (`npx tsc --noEmit`)
- **ESLint Check**: ✅ Passing (`npm run lint`)
- **Production Build**: ✅ Successful (`npm run build`)
- **AI Services**: ✅ Tested and working with real API keys

## Documentation

See `docs/` and `mds/` folders for detailed documentation:

**Current Status:**
- `docs/implementation-status.md` - ⭐ **Phase completion verification** (Phases 0-4 status)
- `docs/usda-integration-complete.md` - USDA nutrition validation integration guide
- `docs/usda-integration-fixes.md` - USDA integration fixes and mobile responsiveness
- `docs/exercisedb-integration.md` - ExerciseDB API integration details
- `docs/v1-migration-summary.md` - ExerciseDB V1 migration summary

**Historical Reference:**
- `mds/COMPLETION_SUMMARY.md` - All recent fixes and testing checklist
- `mds/updated_summary.md` - Complete project overview and feature list
- `mds/quick-start-checklist.md` - Step-by-step setup guide
- `mds/api-integration-roadmap.md` - API integration roadmap (updated October 2025)

---

**Status:** Production Ready + Phase 5.2 Complete (Progress Tracking MVP + Completion Detection)  
**Last Updated:** October 2025  
**MVP Progress:** 93% Complete (Phase 5.2 done)  
**Next Phase:** Phase 5.3+ - Advanced features (Filipino food database, social features, advanced plan editing)

## AI Usage Quick Start

```typescript
// Import AI functions
import { callAI, callGroq, callMistral } from '@/lib/ai'

// Quick fitness tip (Groq for speed)
const tip = await callGroq([
  { role: 'user', content: 'Give me a quick workout tip' }
])

// Detailed workout plan (Mistral for quality)
const plan = await callMistral([
  { role: 'system', content: 'You are a certified personal trainer' },
  { role: 'user', content: 'Create a 30-minute full-body workout' }
])

// Smart fallback (tries Groq first, falls back to Mistral)
const advice = await callAI([
  { role: 'user', content: 'How to build muscle effectively?' }
])
```
