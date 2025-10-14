# Gym-Bro Documentation Index

Welcome to the **gym-bro** project documentation! This folder contains comprehensive guides and references for developing with this Next.js + shadcn/ui application.

---

## 📚 Documentation Files

### 1. [about.md](./about.md)
**Comprehensive Project Overview**

- Project configuration and setup details
- Complete technology stack breakdown
- Theme and styling configuration
- shadcn/ui component catalog
- Installation instructions and best practices
- Resource links

**Use this when:** You need to understand the project structure, configuration, or get an overview of available components.

---

### 2. [codebase-scan.md](./codebase-scan.md)
**Complete Codebase Inventory**

- File-by-file breakdown of the entire project
- Line counts and file purposes
- Directory structure visualization
- Code statistics and analysis
- Dependency breakdown
- Current project status

**Use this when:** You need to locate specific files, understand the codebase structure, or get statistics about the project.

---

### 3. [shadcn-guide.md](./shadcn-guide.md)
**shadcn/ui Installation & Usage Guide**

- Complete component installation instructions
- Component categories and organization
- Usage examples for common components
- Special installation requirements
- Customization guidelines
- Troubleshooting tips

**Use this when:** You're adding new UI components, need usage examples, or troubleshooting component issues.

---

### 4. [development-guide.md](./development-guide.md)
**Development Workflow & Best Practices**

- Getting started instructions
- Daily development workflow
- Creating components and pages
- Routing and API routes
- Styling guidelines
- TypeScript best practices
- Common development tasks

**Use this when:** You're actively developing features, creating new components, or need guidance on project conventions.

---

## 🚀 Quick Start

### First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Add your first component:**
   ```bash
   npx shadcn@latest add button
   ```

---

## 📖 Common Use Cases

### I want to...

#### Add a new UI component
→ See [shadcn-guide.md](./shadcn-guide.md) - Component Categories section

#### Create a new page
→ See [development-guide.md](./development-guide.md) - Routing & Pages section

#### Understand the project structure
→ See [about.md](./about.md) - Project Structure section

#### Find a specific file
→ See [codebase-scan.md](./codebase-scan.md) - File Inventory section

#### Learn styling conventions
→ See [development-guide.md](./development-guide.md) - Styling Guidelines section

#### Customize a component
→ See [shadcn-guide.md](./shadcn-guide.md) - Customization Guide section

#### Set up forms
→ See [shadcn-guide.md](./shadcn-guide.md) - Form Component example

#### Add dark mode
→ See [development-guide.md](./development-guide.md) - Adding Dark Mode Toggle

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15.5.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Library:** shadcn/ui (New York style)
- **Icons:** Lucide React
- **Bundler:** Turbopack
- **AI Services:** Groq (Llama 3.1 8B) + Mistral AI (Small 2503)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth

---

## 📱 Project Structure

```
gym-bro/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Custom components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts (user state)
│   ├── lib/             # Utilities & AI services
│   │   └── ai.ts        # AI integration (Groq + Mistral)
│   ├── hooks/           # Custom hooks
│   └── examples/        # AI usage examples
├── public/              # Static assets
├── mds/                 # Documentation (you are here!)
└── [config files]       # Various configuration files
```

---

## 🎨 Component Installation Quick Reference

### Essential Components
```bash
npx shadcn@latest add button card input label form dialog toast
```

### Form Components
```bash
npx shadcn@latest add form input textarea select checkbox radio-group switch
```

### Layout Components
```bash
npx shadcn@latest add card separator sidebar table
```

### Navigation Components
```bash
npx shadcn@latest add navigation-menu breadcrumb tabs pagination
```

### Overlay Components
```bash
npx shadcn@latest add dialog sheet drawer popover tooltip
```

---

## 🤖 AI Services Integration

### Dual AI Setup
- **Groq AI**: Ultra-fast inference (llama-3.1-8b-instant)
- **Mistral AI**: High-quality responses (mistral-small-2503)
- **Auto-fallback**: If one service fails, automatically uses the other

### Environment Variables
```bash
# Add to .env.local
GROQ_API_KEY=your_groq_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
MISTRAL_MODEL=mistral-small-2503
```

### Usage Examples
```typescript
import { callAI, callGroq, callMistral } from '@/lib/ai'

// Quick response (uses Groq for speed)
const quickTip = await callGroq([
  { role: 'user', content: 'Give me a 30-second workout tip' }
])

// Detailed response (uses Mistral for quality)
const detailedPlan = await callMistral([
  { role: 'system', content: 'You are a fitness expert' },
  { role: 'user', content: 'Create a detailed workout plan' }
])

// Smart fallback (tries Groq first, falls back to Mistral)
const smartResponse = await callAI([
  { role: 'user', content: 'Best exercises for strength?' }
])
```

---

## 🎆 Development Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Component Management
npx shadcn@latest add [component]    # Add single component
npx shadcn@latest add --all          # Add all components
```

---

## 🎨 Theme Colors

The project uses a **Zinc** color scheme with full dark mode support:

- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive`
- `card` / `card-foreground`
- `popover` / `popover-foreground`
- `border` / `input` / `ring`

All colors are defined in `src/app/globals.css` using CSS variables.

---

## 🔧 Configuration Files

- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `package.json` - Dependencies and scripts

---

## 📝 Best Practices

### Component Creation
1. Use TypeScript for all components
2. Define proper interfaces for props
3. Use the `cn()` utility for className merging
4. Follow kebab-case for file names
5. Add `"use client"` for interactive components

### Styling
1. Use Tailwind utility classes
2. Use theme colors via CSS variables
3. Maintain dark mode compatibility
4. Use responsive design utilities

### File Organization
1. Components → `src/components/`
2. UI Components → `src/components/ui/`
3. Pages → `src/app/`
4. Utilities → `src/lib/`
5. Hooks → `src/hooks/`

---

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [Lucide Icons](https://lucide.dev)

---

## 📊 Project Statistics

- **Total Source Files:** 25+
- **Configuration Files:** 8
- **Documentation Files:** 5
- **Lines of Code:** ~2,500+
- **Dependencies:** 24 packages (including AI SDKs)
- **Framework Version:** Next.js 15.5.4
- **React Version:** 19.1.0
- **AI Services:** 2 integrated (Groq + Mistral)

---

## 🆘 Getting Help

### Common Issues

**Component not found after installation**
- Restart your development server
- Check that the component is in `src/components/ui/`

**Styling not working**
- Ensure `globals.css` is imported in `layout.tsx`
- Check that Tailwind classes are spelled correctly

**TypeScript errors**
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` for proper configuration

**Dark mode not working**
- Add `dark` class to `<html>` element
- Check CSS variables in `globals.css`

---

## 📅 Documentation Maintenance

**Last Updated:** 2025-10-13  
**Created By:** Augment Agent  
**Project Version:** 0.2.0 (AI Integration Complete)

---

## 🔧 Recent Updates & Fixes (October 2025)

### ✅ AI Integration Completed
- **Dual AI Setup**: Groq + Mistral AI with automatic fallback
- **Type-Safe Integration**: Full TypeScript support with proper error handling
- **Usage Examples**: Complete examples in `src/examples/ai-usage.ts`
- **Environment Configuration**: Simple .env.local setup

### ✅ Bug Fixes Completed
- **TypeScript Errors**: Fixed all compilation errors in user contexts and hooks
- **Linting Issues**: Resolved all ESLint warnings and errors
- **Build System**: Successful production build with all optimizations
- **Type Safety**: Enhanced AI library with proper content type handling
- **Context Management**: Fixed circular imports and unused variables

### ✅ Build Status
- **TypeScript Check**: ✅ Passing (`npx tsc --noEmit`)
- **ESLint Check**: ✅ Passing (`npm run lint`)
- **Production Build**: ✅ Successful (`npm run build`)
- **AI Services**: ✅ Tested and working

---

## 🎆 Next Steps

1. **Explore the documentation** - Read through each guide
2. **Install components** - Add the components you need
3. **Create your first page** - Build a custom page
4. **Customize the theme** - Adjust colors and styles
5. **Build AI features** - Use the integrated AI services
6. **Build features** - Start developing your gym app!

---

## 📧 Documentation Feedback

If you find any issues with this documentation or have suggestions for improvement, please update the relevant markdown files in the `mds/` directory.

---

**Happy Coding! 💪🏋️‍♂️**

