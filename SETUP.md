# Huayu Hub - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - from Supabase Dashboard > Project Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase Dashboard > Project Settings > API

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production
```bash
npm run build
npm start
```

## Tech Stack

| Tool | Purpose | Version |
|------|---------|---------|
| Next.js | React framework | 16.3.0 |
| React | UI library | 19.2.8 |
| TypeScript | Type safety | 5.x |
| Tailwind CSS | Styling | 4.x |
| next-intl | i18n (vi/en/zh) | 4.13.5 |
| Framer Motion | Animations | 13.x |
| Radix UI | UI primitives | latest |
| Supabase | Backend/Auth | latest |
| Lucide React | Icons | latest |

## Project Structure

```
huayu-hub/
├── app/
│   ├── [locale]/
│   │   ├── (dashboard)/      # Dashboard layout with sidebar+topbar
│   │   │   ├── page.tsx      # Dashboard home
│   │   │   ├── activities/
│   │   │   ├── announcements/
│   │   │   ├── calendar/
│   │   │   ├── documents/
│   │   │   ├── members/
│   │   │   ├── news-feed/
│   │   │   ├── notifications/
│   │   │   ├── org-chart/
│   │   │   ├── organization/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── login/            # Login page
│   │   └── layout.tsx        # Locale layout with i18n provider
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── page.tsx              # Landing page (redirects to locale)
├── components/ui/            # Reusable UI components
├── features/
│   ├── auth/                 # Authentication
│   ├── dashboard/            # Dashboard components
│   ├── activities/           # Activities feature
│   ├── announcements/        # Announcements feature
│   ├── calendar/             # Calendar feature
│   ├── documents/            # Documents feature
│   ├── news-feed/            # News feed feature
│   ├── notifications/        # Notifications feature
│   ├── org-chart/            # Organization chart
│   ├── organization/         # Organization info
│   ├── profile/              # User profile
│   └── search/               # Global search
├── lib/                      # Core utilities (Supabase clients)
├── utils/                    # Helper functions
├── types/                    # TypeScript types
├── messages/                 # i18n translations
│   ├── vi.json              # Vietnamese
│   ├── en.json              # English
│   └── zh.json              # Chinese
├── i18n/                     # i18n configuration
│   ├── request.ts           # next-intl request config
│   └── routing.ts           # i18n routing config
├── middleware.ts             # next-intl middleware
├── next.config.ts            # Next.js config
├── tailwind.config.ts        # Tailwind config
└── package.json
```

## Key Features

- **Multi-language**: Vietnamese (default), English, Chinese
- **Authentication**: Supabase Auth with email/password
- **Dashboard**: Stats, timeline, calendar, notifications
- **Activities**: Create and manage team activities
- **News Feed**: Internal social feed with comments
- **Org Chart**: Visual organization structure
- **Calendar**: Event management with views
- **Documents**: File/document management
- **Glassmorphism UI**: Modern glass-morphism design theme

## Important Notes

### Without Supabase
If you don't set up Supabase env vars, the app will:
- Show a warning in console
- Skip auth checks
- Display mock data for development

### Build Requirements
- Node.js 18+ recommended
- `npm run build` must succeed before deployment

### i18n
- Default locale: `vi` (Vietnamese)
- All pages under `app/[locale]/` are localized
- Messages in `messages/*.json`

## Deployment

### Cloudflare Pages
1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `.next/standalone` (or `.next` if using standard)

### Vercel
1. Import project to Vercel
2. Framework preset: Next.js
3. Add env vars in dashboard

## Next Steps

1. **Set up Supabase project** and copy credentials to `.env.local`
2. **Configure database schema** using Supabase SQL editor
3. **Set up Row Level Security (RLS)** policies for data access
4. **Configure Cloudflare** for custom domain and CDN

## Troubleshooting

- **Build fails with "Missing i18n keys"**: Add missing keys to all 3 message files
- **Build fails with "supabaseUrl is required"**: Set `.env.local` with Supabase vars
- **Window not defined**: Components using `window` need `"use client"`
- **Type errors**: Run `npx next build` to see exact errors

## Supabase Setup Checklist

1. Create project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy `URL` and `anon public` key
4. Paste into `.env.local`
5. Run migrations (if any)

---
Built with Next.js 16 + Tailwind 4 + next-intl v4
