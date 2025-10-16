# Gym-Bro MVP Quick Start Checklist

**Use this checklist to get started with development immediately!**

---

## 🏃 How to Run and Test (CURRENT STATUS)

### ✅ What's Complete
- **Phase 0:** Setup (100%)
- **Phase 0.5:** Authentication System (100%)
- **Phase 1:** Onboarding (100%)
- **Phase 2:** AI Plan Generation + UI (100%)
- **Phase 3:** Dashboard Enhancements & Plan Management (100%)
- **Phase 3.5:** ExerciseDB Integration & Alternative Exercises (100%)
- **Overall Progress:** 85% of MVP

### ⚠️ IMPORTANT: Supabase Setup Required

**Before testing, you MUST set up Supabase:**

1. **Create Supabase Project:**
   - Go to https://supabase.com and create a new project
   - Wait for project to be provisioned (~2 minutes)

2. **Get API Credentials:**
   - Go to Project Settings → API
   - Copy "Project URL" and "anon public" key
   - Update `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Configure Authentication:**
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Enable "Confirm email" option
   - Go to Authentication → Email Templates
   - Customize templates (optional but recommended)

4. **Configure OTP Settings:**
   - Go to Authentication → Settings
   - Set OTP expiry to 600 seconds (10 minutes)
   - Set OTP length to 8 digits (if available, otherwise use default 6)

### 🚀 Running the Application

**1. Start the development server:**
```bash
npm run dev
```

**2. Open in browser:**
```
http://localhost:3000
```

**3. Test the complete authentication + onboarding flow:**

**Step-by-step testing:**

1. **Landing Page** (`http://localhost:3000`)
   - Click "Get Started" button
   - Should navigate to `/auth/register`

2. **Registration Page** (`/auth/register`)
   - Enter First Name and Last Name
   - Enter Email address
   - Enter Password (try show/hide toggle)
   - Enter Confirm Password (should match)
   - Check "I agree to Terms and Conditions"
   - Click "Sign up"
   - Should see success toast
   - Should navigate to `/auth/verify-email`

3. **Email Verification** (`/auth/verify-email`)
   - Read instructions
   - Check your email inbox
   - Click verification link in email
   - Should redirect to `/onboarding`

4. **Login Page** (`/auth/login`)
   - Enter Email and Password
   - Click "Log in"
   - Should see "OTP sent to your email!" toast
   - Should navigate to `/auth/verify-otp`

5. **OTP Verification** (`/auth/verify-otp`)
   - Check your email for 8-digit code (or 6-digit if using default)
   - Enter the code in the input fields
   - Click "Verify"
   - Should redirect to `/dashboard`
   - If code expired, click "Resend OTP"

6. **Onboarding Start** (`/onboarding`)
   - Review the 4-step overview
   - Click "Start Onboarding"
   - Should navigate to `/onboarding/physical`

7. **Step 1: Physical Metrics** (`/onboarding/physical`)
   - Toggle between Metric and Imperial units
   - Enter height (try both cm and ft/in)
   - Enter weight (try both kg and lbs)
   - Enter age (18-100)
   - Select gender
   - Click "Next: Fitness Goals"
   - Should navigate to `/onboarding/fitness`

8. **Step 2: Fitness Goals** (`/onboarding/fitness`)
   - Select fitness level (beginner/intermediate/advanced)
   - Select primary goal (5 options)
   - Click "Next: Activity Level"
   - Should navigate to `/onboarding/activity`

9. **Step 3: Activity Level** (`/onboarding/activity`)
   - Select activity level (5 options)
   - Note the multiplier displayed
   - Click "Next: Dietary Preferences"
   - Should navigate to `/onboarding/dietary`

10. **Step 4: Dietary Preferences** (`/onboarding/dietary`)
    - Select dietary preference (6 options)
    - Add allergies (optional) - type and click "Add"
    - Adjust meals per day slider (3-6)
    - Click "Review & Submit"
    - Should navigate to `/onboarding/review`

11. **Review & Submit** (`/onboarding/review`)
    - Verify all your data is displayed correctly
    - Check calculated metrics (BMR, TDEE, Target Calories, Macros)
    - Try clicking "Edit" buttons to go back to steps
    - Click "Create My Profile"
    - Should see success toast
    - Should redirect to `/dashboard`

12. **Dashboard** (`/dashboard`)
    - Verify stats cards show your data
    - Verify macros display correctly
    - See "Generate Meal Plan" and "Generate Workout Plan" buttons
    - Click "Profile" button (will need to create this page in future)

**9. Test Data Persistence:**
   - Refresh the page during onboarding
   - Your data should persist
   - Complete onboarding and refresh dashboard
   - Your profile should persist

**10. Test Unit Conversion:**
   - Go back to Step 1
   - Toggle between Metric and Imperial
   - Verify conversions are accurate:
     * 170 cm = 5'7"
     * 70 kg = 154 lbs

### 🐛 What to Look For

**Potential Issues:**
- Form validation errors
- Unit conversion accuracy
- Navigation between steps
- Data persistence on refresh
- Mobile responsiveness
- Loading states
- Error messages

**Report any bugs you find!**

### 📱 Mobile Testing

**Test on different screen sizes:**
```bash
# In browser DevTools:
- Mobile: 375px width (iPhone)
- Tablet: 768px width (iPad)
- Desktop: 1440px width
```

**Or test on real devices:**
- Find your local IP in terminal output
- Open `http://[YOUR-IP]:3000` on mobile device

---

## 🚀 Phase 0: Setup (Day 1) ✅ COMPLETE

### Environment Setup
- [x] Node.js 18+ installed
- [x] Code editor ready (VS Code recommended)
- [x] Git repository initialized
- [x] Project dependencies installed (`npm install`)

### API Keys & Environment
- [ ] Create OpenAI account (needed for Phase 2)
- [ ] Get OpenAI API key (needed for Phase 2)
- [ ] Create `.env.local` file (needed for Phase 2)
- [ ] Add `OPENAI_API_KEY=sk-...` (needed for Phase 2)
- [ ] Add `.env.local` to `.gitignore` (needed for Phase 2)

### Install shadcn/ui Components
```bash
# ✅ COMPLETED - All components installed
npx shadcn@latest add button input label form select radio-group slider progress card separator tabs badge skeleton dialog sheet sonner
```

**Installed Components:**
- [x] button, input, label, form, select
- [x] radio-group, slider, progress
- [x] card, separator, tabs
- [x] badge, skeleton, dialog, sheet
- [x] sonner (toast replacement)

### Project Structure Setup
- [x] Create `src/components/onboarding/` folder
- [ ] Create `src/components/dashboard/` folder (not needed yet)
- [ ] Create `src/components/meal-plan/` folder (Phase 2)
- [ ] Create `src/components/workout/` folder (Phase 3)
- [ ] Create `src/components/shared/` folder (Phase 4)
- [x] Create `src/contexts/` folder
- [x] Create `src/types/` folder
- [ ] Create `src/lib/ai.ts` file (Phase 2)
- [x] Create `src/lib/calculations.ts` file

---

## 📋 Phase 1: Onboarding (Week 1-2) ✅ COMPLETE

### Landing Page
- [x] Create `src/app/page.tsx` (landing page)
- [x] Add hero section with app description
- [x] Add "Get Started" CTA button
- [x] Add features overview (3 feature cards)
- [x] Add "How It Works" section
- [x] Make mobile responsive
- [x] Add auto-redirect to dashboard if user exists

### Onboarding Layout
- [x] Create `src/app/onboarding/layout.tsx`
- [x] Add progress indicator component (`OnboardingProgress`)
- [x] Add navigation (back/next buttons on each step)
- [x] Add step counter (Step 1 of 4)

### Step 1: Physical Metrics
- [x] Create `src/app/onboarding/physical/page.tsx`
- [x] Form integrated directly in page (no separate component needed)
- [x] Add height input with unit toggle (cm/ft+in)
- [x] Add weight input with unit toggle (kg/lbs)
- [x] Add age input (18-100)
- [x] Add gender selection (radio group - 4 options)
- [x] Add form validation with Zod
- [x] Create unit conversion utilities in `calculations.ts`
- [x] Create `UnitToggle` component

### Step 2: Fitness Goals
- [x] Create `src/app/onboarding/fitness/page.tsx`
- [x] Form integrated directly in page
- [x] Add fitness level selection (beginner/intermediate/advanced)
- [x] Add primary goal selection (5 options with icons)
- [x] Add descriptions for each option
- [x] Add form validation with Zod

### Step 3: Activity Level
- [x] Create `src/app/onboarding/activity/page.tsx`
- [x] Form integrated directly in page
- [x] Add activity level selection (5 options)
- [x] Add detailed descriptions for each level
- [x] Add activity multipliers display (1.2x - 1.9x)
- [x] Add helpful tips
- [x] Add form validation with Zod

### Step 4: Dietary Preferences
- [x] Create `src/app/onboarding/dietary/page.tsx`
- [x] Form integrated directly in page
- [x] Add dietary preference selection (6 options)
- [x] Add allergies input with tag management
- [x] Add meals per day slider (3-6)
- [x] Add dynamic descriptions
- [x] Add form validation with Zod

### Review & Submit
- [x] Create `src/app/onboarding/review/page.tsx`
- [x] Display all collected data in organized cards
- [x] Add edit buttons for each section
- [x] Add calculated metrics preview (BMR, TDEE, macros)
- [x] Add submit button
- [x] Show loading state during submission
- [x] Add error handling with toast notifications

### Dashboard
- [x] Create `src/app/dashboard/page.tsx`
- [x] Add welcome section
- [x] Add stats overview (calories, goal, TDEE)
- [x] Add macros display
- [x] Add meal plan card with generate CTA
- [x] Add workout plan card with generate CTA
- [x] Add quick actions section
- [x] Add redirect to onboarding if no user

### State Management
- [x] Create `src/contexts/user-context.tsx`
- [x] Create `src/types/index.ts` with TypeScript interfaces
- [x] Implement UserContext with state
- [x] Add local storage persistence
- [x] Add loading/error states
- [x] Add functions: updateOnboardingData, completeOnboarding, updateUser, generateMealPlan, generateWorkoutPlan

### Testing
- [ ] Test complete onboarding flow (READY TO TEST)
- [ ] Test back navigation
- [ ] Test form validation
- [ ] Test unit conversion
- [ ] Test on mobile devices

---

## 🍽️ Phase 2: Meal Plan & Workout Generation + UI ✅ COMPLETE (October 15, 2025)

### Calculations
- [x] Create `src/lib/calculations.ts` ✅
- [x] Implement BMR calculation (Mifflin-St Jeor) ✅
- [x] Implement TDEE calculation ✅
- [x] Implement target calorie calculation ✅
- [x] Implement macro calculation ✅

### API Endpoints
- [x] Create `src/app/api/meal-plans/generate/route.ts` ✅
- [x] Create `src/app/api/workout-plans/generate/route.ts` ✅
- [x] Add input validation with Zod schemas ✅
- [x] Add comprehensive error handling ✅
- [x] Implement background processing with status tracking ✅

### AI Integration
- [x] Create `src/lib/ai.ts` with dual provider support ✅
- [x] Install Mistral AI SDK ✅
- [x] Create Filipino meal plan prompts with JSON mode ✅
- [x] Create workout plan prompts with JSON mode ✅
- [x] Implement robust JSON parsing and validation ✅
- [x] Add comprehensive error handling with fallbacks ✅

### Database Schema
- [x] Enhance meal_plans table with status tracking ✅
- [x] Enhance workout_plans table with status tracking ✅
- [x] Add nullable model and prompt fields ✅
- [x] Add started_at, completed_at, error fields ✅

### Type System
- [x] Create `src/types/plans.ts` with complete types ✅
- [x] Create `src/lib/validation/plans.ts` with Zod schemas ✅
- [x] Support nullable model and prompt fields ✅
- [x] Add proper error type handling ✅

### UI/UX Enhancements
- [x] Implement tabbed day navigation for meal plans ✅
- [x] Implement tabbed day navigation for workout plans ✅
- [x] Add auto-select current day functionality ✅
- [x] Add "Today" indicator badge ✅
- [x] Mobile responsive design (320px+) ✅
- [x] Fix page reload redirect issues ✅
- [x] Fix skeleton loading flash on tab changes ✅

### Testing
- [x] Test meal plan generation with Mistral AI ✅
- [x] Test workout plan generation with Mistral AI ✅
- [x] Verify Filipino cuisine focus in meal plans ✅
- [x] Verify 7-day meal plan generation ✅
- [x] Test background processing and status updates ✅
- [x] Verify proper error handling and recovery ✅
- [x] Test mobile responsiveness on 320px, 768px, 1440px ✅
- [x] Test tab navigation and current day detection ✅

---

## 💪 Phase 3.5: ExerciseDB Integration & Alternative Exercises ✅ COMPLETE (October 16, 2025)

### ExerciseDB API Integration
- [x] Integrate ExerciseDB API (1300+ exercises) ✅
- [x] Create exercise type interfaces (Exercise, ExerciseDB) ✅
- [x] Build `exercisedb.ts` API client ✅
- [x] Create helper utilities (`exercisedb-helper.ts`) ✅
- [x] Implement similarity algorithm for alternative exercises ✅

### Exercise Library
- [x] Create exercise library page (`/exercises`) ✅
- [x] Add search and filter functionality ✅
- [x] Display exercise cards with GIFs ✅
- [x] Implement infinite scroll or pagination ✅
- [x] Mobile responsive design ✅

### Exercise Detail Pages
- [x] Create exercise detail page (`/exercises/[id]`) ✅
- [x] Display exercise GIF prominently ✅
- [x] Show target muscles and body parts ✅
- [x] Display equipment required ✅
- [x] Show detailed instructions ✅
- [x] Full-width mobile layout, sidebar on desktop ✅

### Alternative Exercise System
- [x] Create `/api/exercises/[id]/alternatives` endpoint ✅
- [x] Implement similarity matching algorithm ✅
- [x] Match based on target muscles ✅
- [x] Match based on body parts ✅
- [x] Match based on equipment ✅
- [x] Return top 5 most similar exercises ✅

### Workout Card Enhancement
- [x] Update `WorkoutExerciseCard` component ✅
- [x] Add collapsible "View Alternative Exercises" section ✅
- [x] Display alternative exercise cards with GIFs ✅
- [x] Link alternatives to detail pages ✅
- [x] Mobile responsive alternatives section ✅

### UI/UX Improvements
- [x] Add cursor-pointer to all interactive elements ✅
- [x] Fix mobile responsiveness across exercise pages ✅
- [x] Optimize touch targets for mobile ✅
- [x] Add loading states for exercise data ✅
- [x] Error handling for missing exercises ✅

### Documentation
- [x] Create `docs/exercisedb-integration.md` ✅
- [x] Document API integration details ✅
- [x] Document alternative exercise algorithm ✅
- [x] Add testing checklist ✅
- [x] Document future enhancements ✅

### Testing
- [x] Test exercise library page ✅
- [x] Test exercise detail pages ✅
- [x] Test alternative exercise suggestions ✅
- [x] Test on mobile devices ✅
- [x] Verify GIF loading and display ✅
- [x] Test with slow network (loading states) ✅

---

## 👊 Phase 3: Dashboard Enhancements & Plan Management ✅ COMPLETE (October 15, 2025)

### Dashboard Cards
- [x] Add Today's Meal Card showing current day's meals ✅
- [x] Add Today's Workout Card showing current day's workout ✅
- [x] Load active plans automatically in user context ✅
- [x] Current day detection (Monday = 0, Sunday = 6) ✅
- [x] Quick view with links to full plans ✅

### Meal Plan Display
- [x] Create `src/app/meal-plans/page.tsx` - list view ✅
- [x] Create `src/app/meal-plans/[id]/page.tsx` - detail view ✅
- [x] Add weekly calendar component (tabbed navigation) ✅
- [x] Add daily meal breakdown component ✅
- [x] Add loading skeletons ✅

### Workout Plan Display  
- [x] Create `src/app/workout-plans/page.tsx` - list view ✅
- [x] Create `src/app/workout-plans/[id]/page.tsx` - detail view ✅
- [x] Add weekly workout calendar (tabbed navigation) ✅
- [x] Add daily workout breakdown ✅
- [x] Add exercise detail cards ✅
- [x] Add loading skeletons ✅

### Plan Management
- [x] Add regenerate plan functionality (detail + list pages) ✅
- [x] Add delete plan functionality (detail + list pages) ✅
- [x] Add confirmation dialogs (AlertDialog component) ✅
- [x] Add toast notifications for all actions ✅
- [x] Status polling and real-time updates ✅
- [x] Authorization checks for plan ownership ✅

### UI/UX Enhancements
- [x] Install alert-dialog component via shadcn ✅
- [x] Add cursor-pointer to all interactive elements ✅
- [x] Add loading states (spinning icons) ✅
- [x] Add disabled states during operations ✅

### Testing
- [x] Test plan list views ✅
- [x] Test plan detail views ✅
- [x] Test regeneration flow ✅
- [x] Test deletion flow ✅
- [x] Test on mobile devices ✅
- [x] Test with slow network (loading states) ✅

---

## 📊 Phase 4: Dashboard (Week 6)

### Dashboard Layout
- [ ] Create `src/app/dashboard/layout.tsx`
- [ ] Add mobile navigation
- [ ] Add header with user info

### Dashboard Components
- [ ] Create `src/components/dashboard/dashboard-header.tsx`
- [ ] Create `src/components/dashboard/today-overview.tsx`
- [ ] Create `src/components/dashboard/weekly-calendar.tsx`
- [ ] Create `src/components/dashboard/quick-actions.tsx`
- [ ] Create `src/components/shared/stat-card.tsx`

### Dashboard Page
- [ ] Create `src/app/dashboard/page.tsx`
- [ ] Add hero section with welcome message
- [ ] Add today's workout summary
- [ ] Add today's meal summary
- [ ] Add quick stats (weight, goal, etc.)
- [ ] Add weekly calendar view
- [ ] Add quick action buttons

### Profile Page
- [ ] Create `src/app/profile/page.tsx`
- [ ] Display user profile data
- [ ] Add edit functionality
- [ ] Add save button
- [ ] Add regenerate plans option

### Navigation
- [ ] Create `src/components/shared/mobile-nav.tsx`
- [ ] Add navigation links
- [ ] Add active state styling
- [ ] Make mobile-friendly

### Integration
- [ ] Connect onboarding to dashboard
- [ ] Add redirect after onboarding
- [ ] Load user data on dashboard
- [ ] Handle missing data states

### Testing
- [ ] Test dashboard loads correctly
- [ ] Test today's data displays
- [ ] Test navigation works
- [ ] Test profile editing
- [ ] Test plan regeneration

---

## ✨ Phase 5: Polish (Week 7)

### Mobile Responsiveness
- [ ] Audit all pages on mobile (320px)
- [ ] Audit all pages on tablet (768px)
- [ ] Fix any layout issues
- [ ] Ensure touch targets are 44px+
- [ ] Test on real devices

### Loading States
- [ ] Add skeleton loaders to all pages
- [ ] Add loading spinners for AI generation
- [ ] Add progress indicators
- [ ] Add optimistic UI updates

### Error Handling
- [ ] Add error boundaries
- [ ] Improve error messages
- [ ] Add retry functionality
- [ ] Add fallback UI

### Accessibility
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Fix contrast issues
- [ ] Add focus indicators

### Performance
- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Add lazy loading
- [ ] Minimize bundle size
- [ ] Add caching where appropriate

### Final Testing
- [ ] Complete full user flow
- [ ] Test on Chrome, Safari, Firefox, Edge
- [ ] Test on iOS and Android
- [ ] Fix all critical bugs
- [ ] Get feedback from beta testers

---

## 🚢 Deployment

### Pre-Deployment
- [ ] Set environment variables on Vercel
- [ ] Test production build locally
- [ ] Run final Lighthouse audit
- [ ] Update README.md
- [ ] Create deployment checklist

### Deploy to Vercel
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Deploy to production
- [ ] Verify deployment works
- [ ] Test all features on production

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Share with beta testers
- [ ] Collect feedback
- [ ] Plan iterations

---

## 📝 Documentation

- [ ] Update README.md with setup instructions
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Create FAQ
- [ ] Add troubleshooting guide

---

## 🎯 Success Metrics

Track these after launch:
- [ ] 100+ completed onboardings
- [ ] 80%+ onboarding completion rate
- [ ] 50%+ return visit rate
- [ ] 4.0+ average user rating
- [ ] 90+ Lighthouse score

---

## 💡 Tips for Success

1. **Start Small:** Complete one phase at a time
2. **Test Often:** Test after each component
3. **Mobile First:** Design for mobile, then desktop
4. **User Feedback:** Get feedback early and often
5. **Iterate:** Don't aim for perfection in MVP
6. **Document:** Write notes as you build
7. **Version Control:** Commit often with clear messages
8. **Take Breaks:** Avoid burnout, pace yourself

---

## 🆘 Common Issues & Solutions

**Issue: AI generation is slow**
- Solution: Add loading states, optimize prompts

**Issue: Calculations are wrong**
- Solution: Double-check formulas, add unit tests

**Issue: Mobile layout breaks**
- Solution: Use Tailwind responsive classes, test on real devices

**Issue: Local storage not persisting**
- Solution: Check browser settings, add error handling

**Issue: API costs too high**
- Solution: Add caching, rate limiting

---

## 📚 Resources

- [MVP Plan](./MVP.md) - Full MVP documentation
- [Development Guide](./development-guide.md) - Development best practices
- [shadcn Guide](./shadcn-guide.md) - Component installation guide
- [About](./about.md) - Project overview

---

**Ready to build? Let's go! 💪🏋️‍♂️**

**Estimated Time:** 7 weeks (20-30 hours/week)  
**Difficulty:** Intermediate  
**Reward:** Amazing fitness app! 🎉

