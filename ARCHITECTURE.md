# Together Habit Tracker & Todo List - Architecture & Tech Stack

## 🎯 Overview

A scalable, real-time collaborative habit tracker and todo list application built with Next.js, designed to handle growth from MVP to millions of users.

---

## 🏗️ Architecture Pattern

### **Recommended: Serverless + Edge Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Next.js App)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI   │  │  Real-time   │  │   State Mgmt │  │
│  │  Components  │  │  Subscriptions│  │  (Zustand)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js App Router (Server)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   API Routes │  │ Server Actions│  │  Middleware  │  │
│  │  (REST/GraphQL)│  │  (Mutations) │  │  (Auth/Rate) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Database   │  │  Real-time   │  │   Cache      │
│  (PostgreSQL)│  │  (Ably/Pusher)│  │  (Redis/Upstash)│
│              │  │              │  │              │
│  Supabase/  │  │  WebSocket   │  │  Edge Cache  │
│  Neon/Vercel│  │  Pub/Sub     │  │  (Vercel KV) │
│  Postgres    │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   File Storage        │
              │   (S3/Vercel Blob)    │
              └───────────────────────┘
```

---

## 🛠️ Tech Stack Recommendations

### **Core Framework**

-   **Next.js 16+** (App Router) - Server components, RSC, streaming
-   **TypeScript** - Type safety at scale
-   **React 19** - Latest features, concurrent rendering

### **Styling & UI**

-   **Tailwind CSS 4** - Utility-first, JIT compilation
-   **shadcn/ui** - Accessible, customizable components
-   **Framer Motion** - Smooth animations
-   **Radix UI** - Headless UI primitives

### **Database & ORM**

**Option 1: Supabase (Recommended for MVP → Scale)**

-   PostgreSQL with real-time subscriptions built-in
-   Row-level security (RLS) for multi-tenancy
-   Built-in auth, storage, edge functions
-   Auto-scaling, managed infrastructure

**Option 2: Neon + Prisma (More Control)**

-   Serverless PostgreSQL (Neon)
-   Prisma ORM - type-safe, migrations, query builder
-   Better for complex queries and custom logic

**Option 3: Vercel Postgres + Drizzle (Edge-Ready)**

-   Edge-compatible queries
-   Drizzle ORM - lightweight, SQL-like
-   Perfect for Vercel deployment

### **Real-Time Communication**

**Option 1: Supabase Realtime (If using Supabase)**

-   Built-in PostgreSQL change streams
-   WebSocket connections
-   Free tier generous

**Option 2: Ably**

-   Enterprise-grade pub/sub
-   Presence, channels, history
-   Great for high-scale real-time

**Option 3: Pusher**

-   Simple WebSocket API
-   Good documentation
-   Moderate pricing

**Option 4: Server-Sent Events (SSE)**

-   Simpler than WebSockets
-   One-way server → client
-   Good for notifications

### **Authentication & Authorization**

-   **NextAuth.js v5 (Auth.js)** - OAuth, email, magic links
-   **Clerk** - Pre-built UI, social logins, user management
-   **Supabase Auth** - If using Supabase
-   **Row-Level Security (RLS)** - Database-level permissions

### **State Management**

-   **Zustand** - Lightweight, simple API
-   **TanStack Query (React Query)** - Server state, caching, sync
-   **Jotai** - Atomic state (for complex shared state)

### **Caching & Performance**

-   **Vercel KV (Redis)** - Edge caching, sessions
-   **React Server Components** - Reduce client bundle
-   **Next.js Image Optimization** - Automatic optimization
-   **SWR/React Query** - Client-side caching

### **API Layer**

-   **tRPC** (Optional) - End-to-end type safety
-   **Zod** - Runtime validation, schema definition
-   **Server Actions** - Direct mutations from client

### **Testing**

-   **Vitest** - Fast unit tests
-   **Playwright** - E2E testing
-   **React Testing Library** - Component tests

### **Monitoring & Analytics**

-   **Vercel Analytics** - Web vitals, performance
-   **Sentry** - Error tracking
-   **PostHog** - Product analytics (optional)

### **Deployment**

-   **Vercel** - Optimal for Next.js, edge functions, auto-scaling
-   **Docker + Kubernetes** - For self-hosting at scale

---

## 📊 Data Flow & User Journey

### **1. User Registration/Login**

```
User → NextAuth/Clerk → JWT Token →
Store in httpOnly cookie →
Middleware validates →
Access granted
```

### **2. Creating a Together Group**

```
User creates group →
Server Action →
Database insert (Group + Membership) →
Return group ID →
Redirect to /groups/[id]
```

### **3. Real-Time Updates**

```
User A completes habit →
Server Action →
Database update →
Trigger real-time event →
All connected clients receive update →
UI updates automatically
```

### **4. Todo List Collaboration**

```
User A adds todo →
Optimistic update (UI) →
Server Action →
Database insert →
Real-time broadcast →
Other users see new todo →
If conflict, server state wins
```

---

## 🗄️ Database Schema Design

### **Core Tables**

```sql
-- Users (handled by auth provider, or custom)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP
)

-- Groups (shared spaces)
groups (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Group Memberships
group_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP,
  UNIQUE(group_id, user_id)
)

-- Habits
habits (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- creator
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT, -- 'daily', 'weekly', 'custom'
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Habit Completions (tracking)
habit_completions (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL,
  notes TEXT,
  UNIQUE(habit_id, user_id, DATE(completed_at)) -- One per day
)

-- Todos
todos (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- creator
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES users(id), -- optional assignment
  due_date TIMESTAMP,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- Todo Comments (optional)
todo_comments (
  id UUID PRIMARY KEY,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP
)

-- Notifications
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT, -- 'habit_completed', 'todo_assigned', etc.
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

### **Indexes for Performance**

```sql
CREATE INDEX idx_habit_completions_user_date ON habit_completions(user_id, DATE(completed_at));
CREATE INDEX idx_todos_group_completed ON todos(group_id, completed);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
```

---

## 🔄 Real-Time Architecture

### **Pattern: Optimistic Updates + Server Reconciliation**

1. **Client-side optimistic update** (instant UI feedback)
2. **Server action** (persist to database)
3. **Real-time broadcast** (sync all clients)
4. **Conflict resolution** (server state wins)

### **Implementation Example**

```typescript
// Client component
'use client'

import { useRealtimeSubscription } from '@/hooks/useRealtime'

export function HabitList({ groupId }: { groupId: string }) {
	const { habits, completeHabit } = useHabits(groupId)

	// Subscribe to real-time updates
	useRealtimeSubscription(`group:${groupId}:habits`, (event) => {
		// Update local state when others complete habits
		updateHabitsFromEvent(event)
	})

	const handleComplete = async (habitId: string) => {
		// Optimistic update
		completeHabitOptimistic(habitId)

		try {
			// Server action
			await completeHabitAction(habitId)
		} catch (error) {
			// Rollback on error
			revertOptimisticUpdate(habitId)
		}
	}
}
```

---

## 🔐 Security & Permissions

### **Row-Level Security (RLS) Policies**

If using Supabase/PostgreSQL:

```sql
-- Users can only see groups they're members of
CREATE POLICY "Users see own groups"
ON groups FOR SELECT
USING (
  id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid()
  )
);

-- Only group members can create habits
CREATE POLICY "Members can create habits"
ON habits FOR INSERT
WITH CHECK (
  group_id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid()
  )
);
```

### **API Route Protection**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
	const session = await getServerSession()

	if (!session && request.nextUrl.pathname.startsWith('/app')) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}
```

---

## 📈 Scalability Considerations

### **Phase 1: MVP (0-1K users)**

-   Single database instance
-   Basic real-time (Supabase Realtime)
-   Server Actions + API Routes
-   Vercel deployment

### **Phase 2: Growth (1K-100K users)**

-   Database read replicas
-   Redis caching layer
-   CDN for static assets
-   Rate limiting
-   Database connection pooling

### **Phase 3: Scale (100K+ users)**

-   Database sharding (by group_id)
-   Message queue (RabbitMQ/Kafka) for async tasks
-   Microservices for heavy operations
-   Edge caching (Cloudflare/Vercel Edge)
-   Load balancing
-   Monitoring & alerting

### **Performance Optimizations**

1. **Pagination** - Limit queries (e.g., 50 items per page)
2. **Infinite scroll** - Load more on scroll
3. **Debouncing** - For search/autocomplete
4. **Lazy loading** - Code splitting, dynamic imports
5. **Image optimization** - Next.js Image component
6. **Database indexes** - On frequently queried columns
7. **Query optimization** - Use select specific fields, avoid N+1

---

## 🚀 Recommended Project Structure

```
habit-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── groups/
│   │   │   ├── [id]/
│   │   │   │   ├── habits/
│   │   │   │   ├── todos/
│   │   │   │   └── settings/
│   │   │   └── new/
│   │   └── profile/
│   ├── api/
│   │   ├── auth/
│   │   ├── groups/
│   │   ├── habits/
│   │   └── todos/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn components
│   ├── habits/
│   ├── todos/
│   └── groups/
├── lib/
│   ├── db/              # Database client, queries
│   ├── auth/            # Auth utilities
│   ├── realtime/        # Real-time subscriptions
│   └── utils/
├── hooks/
│   ├── useHabits.ts
│   ├── useTodos.ts
│   └── useRealtime.ts
├── store/               # Zustand stores
├── types/               # TypeScript types
└── server/
    └── actions/         # Server Actions
```

---

## 🎨 Feature Set (MVP → Full)

### **MVP (Week 1-2)**

-   ✅ User authentication
-   ✅ Create/join groups
-   ✅ Add habits to groups
-   ✅ Mark habits complete (daily)
-   ✅ Basic todo list
-   ✅ Real-time updates

### **V1 (Month 1)**

-   📊 Habit streak tracking
-   📈 Statistics dashboard
-   🔔 Notifications
-   👥 User profiles
-   🎨 Customization (colors, icons)

### **V2 (Month 2-3)**

-   📱 Mobile app (React Native)
-   🔍 Search & filters
-   📅 Calendar view
-   🏆 Achievements/badges
-   💬 Comments on todos

### **V3 (Scale)**

-   🤖 AI habit suggestions
-   📧 Email reminders
-   📊 Advanced analytics
-   🔗 Integrations (Google Calendar, etc.)
-   💰 Premium features

---

## 🧪 Testing Strategy

1. **Unit Tests** - Utils, hooks, pure functions
2. **Integration Tests** - API routes, server actions
3. **E2E Tests** - Critical user flows (Playwright)
4. **Load Testing** - k6 or Artillery for API stress testing

---

## 📝 Next Steps

1. **Choose your stack** (Supabase recommended for fastest start)
2. **Set up authentication** (NextAuth.js or Clerk)
3. **Design database schema** (start with MVP tables)
4. **Build core features** (groups → habits → todos)
5. **Add real-time** (Supabase Realtime or Ably)
6. **Deploy to Vercel**
7. **Iterate based on feedback**

---

## 💡 Pro Tips

1. **Start simple** - MVP first, optimize later
2. **Use TypeScript strictly** - Catch errors early
3. **Monitor early** - Set up Sentry from day 1
4. **Test real-time** - Use multiple browsers/devices
5. **Plan for offline** - Service workers, optimistic updates
6. **Document APIs** - Use tRPC or OpenAPI
7. **Version your database** - Use migrations (Prisma/Drizzle)

---

## 🔗 Recommended Resources

-   [Next.js App Router Docs](https://nextjs.org/docs)
-   [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
-   [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
-   [tRPC Best Practices](https://trpc.io/docs)
-   [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023)

---

**Ready to build? Let's start with the foundation!** 🚀
