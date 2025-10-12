# Gym-Bro MVP Quick Start Checklist

**Use this checklist to get started with development immediately!**

---

## 🏃 How to Run and Test (CURRENT STATUS)

### ✅ What's Complete
- **Phase 0:** Setup (100%)
- **Phase 0.5:** Authentication System (100%)
- **Phase 1:** Onboarding (100%)
- **Overall Progress:** 45% of MVP

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

## 🍽️ Phase 2: Meal Plan (Week 3-4) - NEXT PHASE

### Calculations
- [x] Create `src/lib/calculations.ts` ✅
- [x] Implement BMR calculation (Mifflin-St Jeor) ✅
- [x] Implement TDEE calculation ✅
- [x] Implement target calorie calculation ✅
- [x] Implement macro calculation ✅
- [ ] Add unit tests for calculations (optional for MVP)

### API Endpoints
- [ ] Create `src/app/api/calculate-metrics/route.ts`
- [ ] Create `src/app/api/generate-meal-plan/route.ts`
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add rate limiting

### AI Integration
- [ ] Create `src/lib/ai.ts`
- [ ] Install OpenAI SDK (`npm install openai`)
- [ ] Create meal plan prompt
- [ ] Test prompt with sample data
- [ ] Implement response parsing
- [ ] Add error handling

### Meal Plan Components
- [ ] Create `src/components/meal-plan/meal-card.tsx`
- [ ] Create `src/components/meal-plan/macro-breakdown.tsx`
- [ ] Create `src/components/meal-plan/meal-calendar.tsx`
- [ ] Create `src/components/meal-plan/recipe-detail.tsx`

### Meal Plan Pages
- [ ] Create `src/app/meal-plan/page.tsx`
- [ ] Create `src/app/meal-plan/[day]/page.tsx`
- [ ] Add weekly calendar view
- [ ] Add daily meal breakdown
- [ ] Add recipe detail modal
- [ ] Add loading skeletons

### Context Updates
- [ ] Add meal plan to UserContext
- [ ] Add `generateMealPlan()` function
- [ ] Add loading states
- [ ] Add error handling
- [ ] Persist to local storage

### Testing
- [ ] Test meal plan generation
- [ ] Verify calorie accuracy
- [ ] Verify macro calculations
- [ ] Test dietary restrictions
- [ ] Test on mobile

---

## 💪 Phase 3: Workout Plan (Week 5)

### API Endpoints
- [ ] Create `src/app/api/generate-workout/route.ts`
- [ ] Add input validation
- [ ] Add error handling

### AI Integration
- [ ] Create workout plan prompt
- [ ] Test prompt with sample data
- [ ] Implement response parsing
- [ ] Add workout split logic
- [ ] Add progressive overload suggestions

### Workout Components
- [ ] Create `src/components/workout/workout-card.tsx`
- [ ] Create `src/components/workout/exercise-list.tsx`
- [ ] Create `src/components/workout/workout-calendar.tsx`
- [ ] Create `src/components/workout/exercise-detail.tsx`

### Workout Pages
- [ ] Create `src/app/workout-plan/page.tsx`
- [ ] Create `src/app/workout-plan/[day]/page.tsx`
- [ ] Add weekly calendar view
- [ ] Add daily workout breakdown
- [ ] Add exercise detail modal
- [ ] Add loading skeletons

### Context Updates
- [ ] Add workout plan to UserContext
- [ ] Add `generateWorkoutPlan()` function
- [ ] Add loading states
- [ ] Add error handling
- [ ] Persist to local storage

### Testing
- [ ] Test workout generation
- [ ] Verify difficulty matches fitness level
- [ ] Verify volume is appropriate
- [ ] Test rest days
- [ ] Test on mobile

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

