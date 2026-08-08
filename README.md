# Huayu Hub - Team Management System

A Modern SaaS Dashboard for AI x Chinese Learning Community - Team Management System.

## Features

- **Authentication**: Email/Password login with Remember Me, Forgot Password
- **Dashboard**: Hero Banner, Stat Cards, Timeline, Mini Calendar, Quick Actions, Recent Notifications
- **Organization Info**: View and edit organization details, certificates
- **Org Chart**: Interactive organization chart with team hierarchy and member profiles
- **News Feed**: Posts with comments, replies, mentions, visibility settings
- **Activities**: Extracurricular activities with calendar integration
- **Announcements**: Admin posting system with priority levels
- **Documents**: Google Drive, Google Photos, Certificate Website links
- **Profile**: Personal profile with avatar upload and edit
- **Calendar**: Month/Week/Day/Agenda views with event types (Activity, Deadline, Birthday)
- **Notifications**: Realtime notification system with bell icon and dropdown
- **Global Search**: Search across posts, members, events, activities, announcements
- **Multi-language**: Vietnamese, English, Chinese (i18n)
- **Responsive**: Desktop, Laptop, Tablet, Mobile with collapsible sidebar

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Row Level Security)
- **i18n**: next-intl
- **Fonts**: Inter, Poppins

## Design System

- **Colors**: Beige #F6F1E8, Red #C62828, White, Dark Gray #1a1a1a, Gold #D4AF37
- **Style**: Glassmorphism, Soft Shadow, Border Radius 18-20px
- **Animations**: Hover, Fade, Slide, Card Elevation, Smooth Transition, Loading Skeleton
- **Icons**: Lucide React (Outline)

## Project Structure

```
huayu-hub/
├── app/
│   ├── [locale]/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Dashboard main page
│   │   │   ├── layout.tsx            # Dashboard layout (Sidebar + Topbar)
│   │   │   ├── organization/
│   │   │   ├── news-feed/
│   │   │   ├── activities/
│   │   │   ├── org-chart/
│   │   │   ├── members/
│   │   │   ├── announcements/
│   │   │   ├── documents/
│   │   │   ├── profile/
│   │   │   ├── calendar/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── layout.tsx               # Locale layout with i18n
│   ├── globals.css                  # Global styles, glassmorphism, animations
│   └── layout.tsx                   # Root layout
├── components/ui/
│   ├── sidebar.tsx                  # Sidebar navigation
│   └── topbar.tsx                   # Topbar with search, notifications, language
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── login-form.tsx
│   │   └── hooks/
│   │       └── use-auth.ts
│   ├── dashboard/
│   │   └── components/
│   │       ├── hero-banner.tsx
│   │       ├── stat-cards.tsx
│   │       ├── quick-actions.tsx
│   │       ├── timeline.tsx
│   │       ├── mini-calendar.tsx
│   │       └── recent-notifications.tsx
│   ├── organization/
│   ├── org-chart/
│   ├── news-feed/
│   ├── activities/
│   ├── announcements/
│   ├── documents/
│   ├── profile/
│   ├── calendar/
│   ├── notifications/
│   └── search/
├── lib/
│   ├── supabase.ts                  # Browser Supabase client
│   └── supabase-server.ts           # Server Supabase client
├── types/
│   └── index.ts                     # Core TypeScript types
├── utils/
│   └── cn.ts                        # cn() helper (clsx + tailwind-merge)
├── messages/
│   ├── vi.json                      # Vietnamese translations
│   ├── en.json                      # English translations
│   └── zh.json                      # Chinese translations
├── supabase/
│   └── schema.sql                   # Database schema with RLS policies
├── middleware.ts                     # i18n routing middleware
├── i18n.ts                          # i18n configuration
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Database Schema

### Tables
- `roles` - User roles (Founder, Co-Founder, Admin, Member)
- `profiles` - User profiles with team and role
- `teams` - Organization teams (Media, Design, Content, Teaching, Operation, Partner)
- `organization` - Organization details
- `organization_websites` - Certificate websites
- `posts` - News feed posts
- `comments` - Post comments with nested replies
- `events` - Extracurricular activities
- `calendar_events` - Calendar events (activity, deadline, birthday)
- `announcements` - Official announcements
- `documents` - External document links (Drive, Photos, Certificate)
- `notifications` - User notifications with types
- `activity_sources` - Activity sources

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- **Founder/Co-Founder**: Full access to all tables
- **Admin**: Manage members, posts, events, announcements
- **Member**: Create posts, comments, edit own profile, view events

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database setup
1. Create a new Supabase project
2. Go to SQL Editor
3. Copy contents of `supabase/schema.sql`
4. Run the SQL script

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production
```bash
npm run build
npm start
```

## Authentication

Users log in with email and password. No public registration - accounts are created by admins.

- Email: admin@huayuhub.com
- Password: (set in Supabase Auth)

New users are automatically assigned the "Member" role.

## Multi-language

Switch languages via the globe icon in the topbar:
- Vietnamese (vi) - Default
- English (en)
- Chinese (zh)

All UI text is fully internationalized using next-intl.

## Permissions

| Role | Permissions |
|------|-------------|
| Founder | Full access to all features |
| Co-Founder | Nearly full access |
| Admin | Manage members, content, events |
| Member | Create posts, comments, edit profile, view events |

## Design Features

- **Glassmorphism**: Backdrop blur with semi-transparent backgrounds
- **Soft Shadows**: Subtle depth without harsh contrasts
- **Smooth Animations**: Framer Motion for page transitions and hover effects
- **Responsive**: Collapsible sidebar on tablet/mobile, grid layouts
- **Loading States**: Skeleton screens for async content
- **Toast Notifications**: Animated notification toasts

## Contributing

This is a private project for Huayu Hub organization.

## License

MIT
