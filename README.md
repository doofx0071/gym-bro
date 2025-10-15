# 💪 Gym Bro - AI-Powered Fitness & Nutrition Companion

**Status:** Production Ready + Phase 3 Complete  
**Version:** 0.3.0  
**Last Updated:** October 15, 2025

## 🎯 Overview

Gym Bro is a comprehensive AI-powered fitness and nutrition companion that provides personalized workout routines and meal plans tailored to your fitness goals.

## ✨ Key Features

### ✅ Phase 1: Core Features (Complete)
- **Authentication System** - Email/password with OTP verification
- **4-Step Onboarding** - Physical metrics, fitness goals, activity level, dietary preferences
- **Personalized Dashboard** - Stats overview, macros, and quick actions
- **Profile Management** - View and edit personal information
- **Settings** - Dark mode, notifications, security
- **Responsive Design** - Desktop sidebar + mobile bottom navigation

### ✅ Phase 2: AI Plan Generation (Complete)
- **AI Meal Plans** - Filipino-focused meal plans with recipes and nutrition info
- **AI Workout Plans** - Personalized workout routines with exercises and instructions
- **Background Processing** - Async generation with status polling
- **Tabbed Navigation** - Day-by-day plan viewing with current day detection
- **Mobile Optimized** - Fully responsive plan detail pages

### ✅ Phase 3: Dashboard Enhancements & Plan Management (Complete)
- **Today's Meal Card** - Dashboard card showing current day's meals
- **Today's Workout Card** - Dashboard card showing current day's workout
- **Plan Regeneration** - Regenerate plans with confirmation dialogs
- **Plan Deletion** - Delete plans from detail and list pages
- **Enhanced List Pages** - Fully functional dropdown menus with actions
- **Toast Notifications** - User feedback for all operations
- **Cursor Pointer Styling** - Consistent interactive element feedback

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.4 (App Router, Turbopack)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI (New York style)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI Services:** Mistral AI (primary), Groq (fallback)
- **Images:** Unsplash API

## 📦 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/doofx0071/gym-bro.git
cd gym-bro
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create `.env.local` in the root directory:
```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Unsplash (required)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key

# AI Services (required for plan generation)
MISTRAL_API_KEY=your_mistral_api_key
GROQ_API_KEY=your_groq_api_key  # optional fallback
MISTRAL_MODEL=mistral-large-latest
GROQ_MODEL=llama-3.1-8b-instant
```

4. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Project Structure

```
gym-bro/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── onboarding/        # Onboarding flow
│   │   ├── dashboard/         # Main dashboard
│   │   ├── meal-plans/        # Meal plan pages
│   │   ├── workout-plans/     # Workout plan pages
│   │   ├── profile/           # User profile
│   │   ├── settings/          # Settings page
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   └── plans/            # Plan-specific components
│   ├── contexts/              # React contexts
│   ├── lib/                   # Utilities & services
│   │   ├── ai.ts             # AI integration
│   │   ├── calculations.ts   # BMR/TDEE calculations
│   │   └── supabase/         # Supabase clients
│   ├── types/                 # TypeScript types
│   └── hooks/                 # Custom hooks
├── mds/                       # Documentation
└── public/                    # Static assets
```

## 🎮 Usage

### First-Time Setup
1. Visit the app and click "Sign Up"
2. Create an account with email/password
3. Verify your email
4. Complete the 4-step onboarding process
5. Generate your first meal and workout plans!

### Generating Plans
1. Navigate to "Meal Plans" or "Workout Plans"
2. Click "Generate New Plan"
3. Fill in preferences (optional)
4. Wait for AI generation (30-60 seconds)
5. View your personalized plan!

### Managing Plans
- **Regenerate:** Get a fresh plan with new recipes/exercises
- **Delete:** Remove plans you no longer need
- **View Today:** See today's meals and workout on the dashboard

## 📚 Documentation

Comprehensive documentation available in the `mds/` folder:
- `WARP.md` - Development guidelines and project overview
- `PHASE_3_COMPLETION.md` - Phase 3 feature documentation
- `COMPLETION_SUMMARY.md` - Previous phase summaries

## 🧪 Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

## 🎨 Features in Detail

### AI-Powered Meal Plans
- Filipino cuisine focus with authentic dishes
- Personalized to your calorie and macro targets
- 7-day weekly plans with full recipes
- Ingredient lists and cooking instructions
- Prep time and nutrition info for each meal

### AI-Powered Workout Plans
- Tailored to your fitness level and goals
- Customizable days per week (1-7)
- Exercise blocks (warmup, main, accessory, cooldown)
- Sets, reps, rest periods, and RPE guidance
- Equipment and muscle group information

### Dashboard Experience
- Today's meal card with quick meal overview
- Today's workout card with exercise preview
- Quick stats (calories, macros, TDEE)
- Direct links to full plans

## 🚀 Deployment

Recommended platforms:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**

Ensure all environment variables are set in your deployment platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Shadcn UI](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Supabase](https://supabase.com) - Backend services
- [Mistral AI](https://mistral.ai) - AI plan generation
- [Unsplash](https://unsplash.com) - Fitness images

---

**Built with 💪 by the Gym Bro Team**

For detailed documentation, see the `mds/` folder or visit [WARP.md](./WARP.md).
