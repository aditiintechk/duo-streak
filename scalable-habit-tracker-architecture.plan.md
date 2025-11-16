<!-- befb7154-3db4-422e-9d26-4534db799341 6fe05eb1-4215-4751-a359-2d288d99ca44 -->
# Scalable Habit Tracker & Todo List Architecture

## Tech Stack

### Core Framework

- **Next.js 14+** (App Router) - Server components, streaming, optimized rendering
- **TypeScript** - Type safety and better DX
- **React 18+** - Concurrent features, server components

### Database & ORM

- **PostgreSQL** (via Supabase/Neon or standalone) - Relational data, ACID compliance
- **Prisma ORM** - Type-safe database access, migrations, connection pooling
- **Redis** (Upstash) - Caching, rate limiting, real-time pub/sub

### Authentication & Authorization

- **NextAuth.js v5** - Authentication with multiple providers
- **Row Level Security (RLS)** - Database-level permissions
- **JWT tokens** - Session management

### Real-time & State Management

- **Supabase Realtime** or **Pusher** - WebSocket connections for live updates
- **Zustand** or **Jotai** - Client-side state management
- **React Query (TanStack Query)** - Server state, caching, optimistic updates

### UI & Styling

- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Deployment & Infrastructure

- **Vercel** - Hosting, edge functions, analytics
- **Vercel Postgres** or **Supabase** - Managed database
- **Upstash Redis** - Managed Redis
- **Vercel Blob** or **Cloudinary** - File storage (if needed)

## Architecture Flow

### Data Model

```
User
├── id, email, name, avatar
├── created_at, updated_at

HabitGroup (shared workspace)
├── id, name, description, color
├── created_by, created_at
├── members[] (UserHabitGroup join table)
│   ├── user_id, role (owner/member/viewer)
│   └── joined_at

Habit
├── id, name, description, icon, color
├── habit_group_id (FK)
├── frequency (daily/weekly/custom)
├── target_count, current_streak
├── created_by, created_at

HabitEntry (daily check-ins)
├── id, habit_id (FK), user_id (FK)
├── date, completed, notes
├── created_at, updated_at
├── UNIQUE(habit_id, user_id, date)

TodoList (shared list)
├── id, name, description, color
├── habit_group_id (FK) - links to workspace
├── created_by, created_at

TodoItem
├── id, todo_list_id (FK)
├── title, description, priority
├── completed, due_date
├── assigned_to (FK to User)
├── created_by, created_at, updated_at
```

### Application Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx (protected route)
│   ├── page.tsx (overview)
│   ├── groups/
│   │   ├── [groupId]/
│   │   │   ├── page.tsx (group dashboard)
│   │   │   ├── habits/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [habitId]/
│   │   │   └── todos/
│   │   │       ├── page.tsx
│   │   │       └── [listId]/
│   │   └── new/
│   └── settings/
├── api/
│   ├── auth/[...nextauth]/
│   ├── groups/
│   ├── habits/
│   ├── todos/
│   └── realtime/
├── components/
│   ├── ui/ (shadcn components)
│   ├── habits/
│   ├── todos/
│   ├── groups/
│   └── shared/
└── lib/
    ├── db/ (Prisma client)
    ├── auth.ts
    ├── realtime.ts
    └── utils.ts
```

### Key Features & Implementation

#### 1. Real-time Collaboration

- **WebSocket connections** via Supabase Realtime or Pusher
- **Optimistic UI updates** with React Query
- **Conflict resolution** using timestamps and last-write-wins
- **Presence indicators** showing who's online
- **Activity feed** for group actions

#### 2. Authentication Flow

- NextAuth.js with email/password + OAuth
- Protected routes using middleware
- Session management with JWT
- Role-based access control (owner/member/viewer)

#### 3. Data Fetching Strategy

- **Server Components** for initial data (SEO, performance)
- **React Query** for client-side mutations and caching
- **Incremental Static Regeneration (ISR)** for public data
- **Streaming SSR** for authenticated content

#### 4. API Routes (App Router)

- RESTful API routes in `app/api/`
- Server Actions for mutations (better DX)
- Rate limiting with Upstash Redis
- Input validation with Zod

#### 5. Performance Optimizations

- **Database indexing** on foreign keys and date fields
- **Connection pooling** with Prisma
- **Redis caching** for frequently accessed data
- **Image optimization** with next/image
- **Code splitting** and dynamic imports
- **Edge functions** for lightweight operations

#### 6. Scalability Considerations

- **Horizontal scaling** - Stateless API routes
- **Database read replicas** for heavy read workloads
- **CDN** for static assets (Vercel Edge Network)
- **Queue system** (BullMQ/Inngest) for background jobs
- **Monitoring** with Vercel Analytics + Sentry

### Development Workflow

1. **Database Schema** - Prisma schema with migrations
2. **API Layer** - Type-safe routes with Zod validation
3. **UI Components** - Reusable, accessible components
4. **Real-time Layer** - WebSocket integration
5. **Testing** - Unit tests (Vitest), E2E (Playwright)
6. **CI/CD** - GitHub Actions → Vercel

### Security

- **CSRF protection** (Next.js built-in)
- **SQL injection prevention** (Prisma parameterized queries)
- **XSS protection** (React escaping)
- **Rate limiting** on API routes
- **Input sanitization** with Zod
- **Row Level Security** in database

### Future Scaling Path

- **Microservices** - Extract real-time service
- **GraphQL** - If complex querying needed
- **Event sourcing** - For audit trails
- **CQRS** - Separate read/write models
- **Multi-region** - Edge functions + database replicas

### To-dos

- [ ] Set up PostgreSQL database with Prisma ORM, define schema for Users, HabitGroups, Habits, HabitEntries, TodoLists, and TodoItems with proper relationships and indexes
- [ ] Configure NextAuth.js v5 with email/password and OAuth providers, implement protected routes middleware, and set up session management
- [ ] Build RESTful API routes for groups, habits, todos with Zod validation, rate limiting, and proper error handling
- [ ] Integrate real-time updates using Supabase Realtime or Pusher for live collaboration, presence indicators, and optimistic UI updates
- [ ] Create reusable UI components with shadcn/ui, build habit tracking UI, todo list interface, and group management screens
- [ ] Implement caching strategies with React Query, add database indexes, set up Redis caching, and optimize with server components