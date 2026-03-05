# LinkChat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a SaaS personal page builder with linktree-style links and AI chat, powered by saas-maker as an invisible backend.

**Architecture:** Next.js 15 App Router app. Users sign up, configure their profile/links/info in a dashboard. Each user gets a public `/{username}` page with glassmorphism styling. Content is indexed into saas-maker for RAG chat. Visitors can chat with an AI about the page owner.

**Tech Stack:** Next.js 15, Tailwind CSS v4, NextAuth.js v5, Turso (libSQL), Drizzle ORM, saas-maker API (indexing + chat + analytics)

---

## Prerequisites

- Node.js 22+, pnpm 10+
- Turso CLI (`brew install tursodatabase/tap/turso`)
- A saas-maker API key (for dev, use the local saas-maker dev server)

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `drizzle.config.ts`, `.env.example`, `.gitignore`

**Step 1: Initialize Next.js project**

```bash
cd /Users/sarthakagrawal/Desktop/linkchat
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack
```

Accept defaults. This creates the full Next.js 15 scaffold.

**Step 2: Install dependencies**

```bash
pnpm add next-auth@beta @auth/drizzle-adapter @libsql/client drizzle-orm
pnpm add -D drizzle-kit
```

**Step 3: Create `.env.example`**

Create file `.env.example`:
```
# Auth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Database
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# SaaS Maker
SAASMAKER_API_URL=https://api.sassmaker.com
SAASMAKER_ADMIN_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 4: Update `.gitignore`**

Append to `.gitignore`:
```
.env
.env.local
```

**Step 5: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Next.js 15 project with deps"
```

---

### Task 2: Database Schema (Drizzle + Turso)

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/index.ts`
- Create: `drizzle.config.ts`

**Step 1: Create Drizzle config**

Create file `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

**Step 2: Create schema**

Create file `src/db/schema.ts`:
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  smProjectId: text('sm_project_id'),
  smApiKey: text('sm_api_key'),
  smIndexId: text('sm_index_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  themeConfig: text('theme_config', { mode: 'json' }).$type<{
    gradientFrom?: string;
    gradientTo?: string;
    accentColor?: string;
  }>(),
  published: integer('published', { mode: 'boolean' }).default(false),
  chatEnabled: integer('chat_enabled', { mode: 'boolean' }).default(false),
  chatSystemPrompt: text('chat_system_prompt'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const links = sqliteTable('links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
});

export const infoBlocks = sqliteTable('info_blocks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'text', 'resume', 'faq'
  title: text('title'),
  content: text('content').notNull(),
  sortOrder: integer('sort_order').default(0),
});
```

**Step 3: Create DB client**

Create file `src/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

**Step 4: Create local Turso DB and push schema**

```bash
turso dev --db-file local.db &
# In .env.local set TURSO_DATABASE_URL=http://127.0.0.1:8080
pnpm drizzle-kit push
```

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add database schema with Drizzle + Turso"
```

---

### Task 3: Authentication (NextAuth v5)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`

**Step 1: Create auth config**

Create file `src/lib/auth.ts`:
```typescript
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [Google, GitHub],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
```

**Step 2: Create auth route**

Create file `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

**Step 3: Create middleware**

Create file `src/middleware.ts`:
```typescript
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

**Step 4: Verify auth works**

```bash
pnpm dev
```
Visit `http://localhost:3000/api/auth/providers` — should return JSON with google and github providers.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add NextAuth v5 with Google + GitHub providers"
```

---

### Task 4: SaaS Maker Integration Layer

**Files:**
- Create: `src/lib/saasmaker.ts`

**Step 1: Create saas-maker client**

Create file `src/lib/saasmaker.ts`:
```typescript
const API_URL = process.env.SAASMAKER_API_URL!;
const ADMIN_KEY = process.env.SAASMAKER_ADMIN_KEY!;

interface SaasMakerOptions {
  apiKey?: string; // per-project key, or use admin key
}

function headers(opts?: SaasMakerOptions): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Project-Key': opts?.apiKey || ADMIN_KEY,
  };
}

export async function createProject(name: string): Promise<{ id: string; api_key: string }> {
  // This requires an admin/dashboard endpoint in saas-maker
  // For now, projects are created manually in saas-maker dashboard
  // and the API key is stored in LinkChat
  throw new Error('TODO: implement when saas-maker has project creation API');
}

export async function createIndex(apiKey: string, name: string): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/v1/indexes`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create index: ${await res.text()}`);
  return res.json();
}

export async function ingestDocument(
  apiKey: string,
  indexId: string,
  content: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string; chunks_created: number }> {
  const res = await fetch(`${API_URL}/v1/indexes/${indexId}/documents`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({ content, metadata }),
  });
  if (!res.ok) throw new Error(`Failed to ingest document: ${await res.text()}`);
  return res.json();
}

export async function deleteDocument(apiKey: string, indexId: string, docId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/indexes/${indexId}/documents/${docId}`, {
    method: 'DELETE',
    headers: headers({ apiKey }),
  });
  if (!res.ok) throw new Error(`Failed to delete document: ${await res.text()}`);
}

export async function search(
  apiKey: string,
  indexId: string,
  query: string,
  topK = 5
): Promise<{ results: { document_id: string; chunk_content: string; score: number }[] }> {
  const res = await fetch(`${API_URL}/v1/indexes/${indexId}/search`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error(`Failed to search: ${await res.text()}`);
  return res.json();
}

export async function chatCompletion(
  apiKey: string,
  indexId: string,
  query: string,
  systemPrompt?: string
): Promise<ReadableStream> {
  const res = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: headers({ apiKey }),
    body: JSON.stringify({
      index_id: indexId,
      query,
      system_prompt: systemPrompt,
      stream: true,
    }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${await res.text()}`);
  return res.body!;
}
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add saas-maker API client"
```

---

### Task 5: Dashboard Layout & Navigation

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/components/dashboard/sidebar.tsx`
- Create: `src/components/dashboard/user-menu.tsx`

**Step 1: Create login page**

Create file `src/app/login/page.tsx`:
```tsx
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">LinkChat</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to manage your page</p>
        </div>
        <div className="space-y-3">
          <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/dashboard' }); }}>
            <button type="submit" className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition">
              Continue with Google
            </button>
          </form>
          <form action={async () => { 'use server'; await signIn('github', { redirectTo: '/dashboard' }); }}>
            <button type="submit" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition">
              Continue with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create sidebar**

Create file `src/components/dashboard/sidebar.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: 'home' },
  { href: '/dashboard/links', label: 'Links', icon: 'link' },
  { href: '/dashboard/info', label: 'Info & Content', icon: 'file-text' },
  { href: '/dashboard/chat', label: 'Chat Settings', icon: 'message-circle' },
  { href: '/dashboard/appearance', label: 'Appearance', icon: 'palette' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-gray-950 p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-white">LinkChat</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 3: Create dashboard layout**

Create file `src/app/dashboard/layout.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 4: Create dashboard overview page**

Create file `src/app/dashboard/page.tsx`:
```tsx
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  const session = await auth();
  const userPages = await db.select().from(pages).where(eq(pages.userId, session!.user!.id!));
  const page = userPages[0]; // users get one page for now

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      {page ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-gray-300">Your page: <a href={`/${page.slug}`} className="text-blue-400 underline">/{page.slug}</a></p>
          <p className="text-sm text-gray-500 mt-1">{page.published ? 'Published' : 'Draft'}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-gray-400">No page yet. Let's create one!</p>
          <a href="/dashboard/settings" className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition">
            Create Page
          </a>
        </div>
      )}
    </div>
  );
}
```

**Step 5: Verify layout loads**

```bash
pnpm dev
```
Visit `http://localhost:3000/dashboard` — should redirect to login, or show dashboard with sidebar if logged in.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add dashboard layout, sidebar, login page"
```

---

### Task 6: Page CRUD + Links Management

**Files:**
- Create: `src/app/api/pages/route.ts`
- Create: `src/app/api/pages/[pageId]/links/route.ts`
- Create: `src/app/dashboard/links/page.tsx`
- Create: `src/components/dashboard/link-editor.tsx`

**Step 1: Create page API route**

Create file `src/app/api/pages/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userPages = await db.select().from(pages).where(eq(pages.userId, session.user.id));
  return NextResponse.json({ data: userPages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { slug, displayName, bio } = body;

  if (!slug || !displayName) {
    return NextResponse.json({ error: 'slug and displayName required' }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await db.select().from(pages).where(eq(pages.slug, slug));
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
  }

  const [page] = await db.insert(pages).values({
    userId: session.user.id,
    slug,
    displayName,
    bio,
  }).returning();

  return NextResponse.json(page, { status: 201 });
}
```

**Step 2: Create links API route**

Create file `src/app/api/pages/[pageId]/links/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { links, pages } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

async function verifyPageOwner(pageId: string, userId: string) {
  const [page] = await db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, userId)));
  return page;
}

export async function GET(_req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!await verifyPageOwner(pageId, session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await db.select().from(links).where(eq(links.pageId, pageId)).orderBy(asc(links.sortOrder));
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!await verifyPageOwner(pageId, session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { title, url, icon } = body;

  if (!title || !url) {
    return NextResponse.json({ error: 'title and url required' }, { status: 400 });
  }

  // Get max sort order
  const existing = await db.select().from(links).where(eq(links.pageId, pageId));
  const maxOrder = existing.reduce((max, l) => Math.max(max, l.sortOrder ?? 0), -1);

  const [link] = await db.insert(links).values({
    pageId,
    title,
    url,
    icon,
    sortOrder: maxOrder + 1,
  }).returning();

  return NextResponse.json(link, { status: 201 });
}
```

**Step 3: Create link editor component**

Create file `src/components/dashboard/link-editor.tsx`:
```tsx
'use client';

import { useState } from 'react';

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  enabled: boolean;
  sortOrder: number;
}

export function LinkEditor({ pageId, initialLinks }: { pageId: string; initialLinks: Link[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  async function addLink() {
    if (!title || !url) return;
    const res = await fetch(`/api/pages/${pageId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url }),
    });
    if (res.ok) {
      const link = await res.json();
      setLinks([...links, link]);
      setTitle('');
      setUrl('');
    }
  }

  async function deleteLink(linkId: string) {
    const res = await fetch(`/api/pages/${pageId}/links/${linkId}`, { method: 'DELETE' });
    if (res.ok) {
      setLinks(links.filter(l => l.id !== linkId));
    }
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="font-medium text-white">{link.title}</p>
            <p className="text-sm text-gray-400">{link.url}</p>
          </div>
          <button onClick={() => deleteLink(link.id)} className="text-sm text-red-400 hover:text-red-300">
            Remove
          </button>
        </div>
      ))}

      <div className="flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Link title"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button onClick={addLink} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition">
          Add
        </button>
      </div>
    </div>
  );
}
```

**Step 4: Create links dashboard page**

Create file `src/app/dashboard/links/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages, links } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { LinkEditor } from '@/components/dashboard/link-editor';

export default async function LinksPage() {
  const session = await auth();
  const userPages = await db.select().from(pages).where(eq(pages.userId, session!.user!.id!));
  const page = userPages[0];

  if (!page) redirect('/dashboard');

  const pageLinks = await db.select().from(links).where(eq(links.pageId, page.id)).orderBy(asc(links.sortOrder));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Links</h2>
      <LinkEditor pageId={page.id} initialLinks={pageLinks} />
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add page CRUD and links management"
```

---

### Task 7: Info Blocks Management

**Files:**
- Create: `src/app/api/pages/[pageId]/info/route.ts`
- Create: `src/app/dashboard/info/page.tsx`
- Create: `src/components/dashboard/info-editor.tsx`

**Step 1: Create info API route**

Create file `src/app/api/pages/[pageId]/info/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { infoBlocks, pages } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { ingestDocument, deleteDocument } from '@/lib/saasmaker';

async function verifyPageOwner(pageId: string, userId: string) {
  const [page] = await db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, userId)));
  return page;
}

export async function GET(_req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!await verifyPageOwner(pageId, session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await db.select().from(infoBlocks).where(eq(infoBlocks.pageId, pageId)).orderBy(asc(infoBlocks.sortOrder));
  return NextResponse.json({ data });
}

export async function POST(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const page = await verifyPageOwner(pageId, session.user.id);
  if (!page) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { type, title, content } = body;

  if (!type || !content) {
    return NextResponse.json({ error: 'type and content required' }, { status: 400 });
  }

  const existing = await db.select().from(infoBlocks).where(eq(infoBlocks.pageId, pageId));
  const maxOrder = existing.reduce((max, b) => Math.max(max, b.sortOrder ?? 0), -1);

  const [block] = await db.insert(infoBlocks).values({
    pageId,
    type,
    title,
    content,
    sortOrder: maxOrder + 1,
  }).returning();

  // TODO: Ingest into saas-maker index when sm_api_key and sm_index_id are configured
  // This will be wired up after saas-maker integration is complete

  return NextResponse.json(block, { status: 201 });
}
```

**Step 2: Create info editor component**

Create file `src/components/dashboard/info-editor.tsx`:
```tsx
'use client';

import { useState } from 'react';

interface InfoBlock {
  id: string;
  type: string;
  title: string | null;
  content: string;
  sortOrder: number;
}

const blockTypes = [
  { value: 'text', label: 'About / Bio' },
  { value: 'resume', label: 'Resume / Experience' },
  { value: 'faq', label: 'FAQ' },
];

export function InfoEditor({ pageId, initialBlocks }: { pageId: string; initialBlocks: InfoBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [type, setType] = useState('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function addBlock() {
    if (!content) return;
    const res = await fetch(`/api/pages/${pageId}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, content }),
    });
    if (res.ok) {
      const block = await res.json();
      setBlocks([...blocks, block]);
      setTitle('');
      setContent('');
    }
  }

  async function deleteBlock(blockId: string) {
    const res = await fetch(`/api/pages/${pageId}/info/${blockId}`, { method: 'DELETE' });
    if (res.ok) {
      setBlocks(blocks.filter(b => b.id !== blockId));
    }
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <div key={block.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-xs text-gray-300">{block.type}</span>
              {block.title && <p className="mt-1 font-medium text-white">{block.title}</p>}
              <p className="mt-1 text-sm text-gray-400 line-clamp-3">{block.content}</p>
            </div>
            <button onClick={() => deleteBlock(block.id)} className="text-sm text-red-400 hover:text-red-300">
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2 text-sm text-white"
          >
            {blockTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Section title (optional)"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content..."
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button onClick={addBlock} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition">
          Add Block
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Create info dashboard page**

Create file `src/app/dashboard/info/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages, infoBlocks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { InfoEditor } from '@/components/dashboard/info-editor';

export default async function InfoPage() {
  const session = await auth();
  const userPages = await db.select().from(pages).where(eq(pages.userId, session!.user!.id!));
  const page = userPages[0];

  if (!page) redirect('/dashboard');

  const blocks = await db.select().from(infoBlocks).where(eq(infoBlocks.pageId, page.id)).orderBy(asc(infoBlocks.sortOrder));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Info & Content</h2>
      <p className="text-sm text-gray-400">Add information that the AI chat can use to answer visitor questions.</p>
      <InfoEditor pageId={page.id} initialBlocks={blocks} />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add info blocks management"
```

---

### Task 8: Public Page - Glassmorphism Linktree

**Files:**
- Create: `src/app/[slug]/page.tsx`
- Create: `src/components/public/link-card.tsx`
- Create: `src/components/public/glass-card.tsx`

**Step 1: Create glass card component**

Create file `src/components/public/glass-card.tsx`:
```tsx
export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}
```

**Step 2: Create link card component**

Create file `src/components/public/link-card.tsx`:
```tsx
'use client';

export function LinkCard({ title, url, icon }: { title: string; url: string; icon?: string | null }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-center backdrop-blur-lg transition-all duration-300 hover:border-white/30 hover:bg-white/20 hover:shadow-lg hover:shadow-white/5 hover:scale-[1.02]"
    >
      <span className="text-sm font-medium text-white group-hover:text-white/90">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </span>
    </a>
  );
}
```

**Step 3: Create public page**

Create file `src/app/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { pages, links, infoBlocks } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { GlassCard } from '@/components/public/glass-card';
import { LinkCard } from '@/components/public/link-card';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.published, true)));
  if (!page) return {};
  return {
    title: `${page.displayName} | LinkChat`,
    description: page.bio || `${page.displayName}'s personal page`,
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const [page] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.published, true)));
  if (!page) notFound();

  const pageLinks = await db.select().from(links)
    .where(and(eq(links.pageId, page.id), eq(links.enabled, true)))
    .orderBy(asc(links.sortOrder));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gray-950">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-purple-600/20 blur-[128px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-blue-600/20 blur-[128px]" style={{ animationDelay: '2s' }} />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-pink-600/10 blur-[128px]" style={{ animationDelay: '4s' }} />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center px-4 py-16">
        {/* Profile card */}
        <GlassCard className="mb-8 w-full p-8 text-center">
          {page.avatarUrl && (
            <img
              src={page.avatarUrl}
              alt={page.displayName}
              className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-white/20 object-cover"
            />
          )}
          <h1 className="text-2xl font-bold text-white">{page.displayName}</h1>
          {page.bio && <p className="mt-2 text-sm text-gray-300">{page.bio}</p>}
        </GlassCard>

        {/* Links */}
        <div className="w-full space-y-3">
          {pageLinks.map((link) => (
            <LinkCard key={link.id} title={link.title} url={link.url} icon={link.icon} />
          ))}
        </div>

        {/* Chat widget will be added in Task 10 */}

        <footer className="mt-12 text-xs text-gray-500">
          Powered by LinkChat
        </footer>
      </div>
    </div>
  );
}
```

**Step 4: Add CSS animations to globals**

In `src/app/globals.css`, ensure this animation utility exists (Tailwind v4 may handle `animate-pulse` natively, but verify).

**Step 5: Verify page renders**

```bash
pnpm dev
```
Create a test page in the DB, visit `http://localhost:3000/testslug`.

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add public glassmorphism linktree page"
```

---

### Task 9: Chat API Route (Proxy to saas-maker)

**Files:**
- Create: `src/app/api/chat/[slug]/route.ts`

**Step 1: Create chat API route**

Create file `src/app/api/chat/[slug]/route.ts`:
```typescript
import { db } from '@/db';
import { pages, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatCompletion } from '@/lib/saasmaker';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  const { query } = body;

  if (!query?.trim()) {
    return new Response(JSON.stringify({ error: 'query required' }), { status: 400 });
  }

  // Get page + user + saas-maker config
  const [page] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.published, true)));
  if (!page || !page.chatEnabled) {
    return new Response(JSON.stringify({ error: 'Chat not available' }), { status: 404 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, page.userId));
  if (!user?.smApiKey || !user?.smIndexId) {
    return new Response(JSON.stringify({ error: 'Chat not configured' }), { status: 503 });
  }

  try {
    const stream = await chatCompletion(
      user.smApiKey,
      user.smIndexId,
      query,
      page.chatSystemPrompt || `You are a helpful assistant that answers questions about ${page.displayName}. Use only the provided context to answer. If you don't know, say so.`
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Chat service unavailable' }), { status: 502 });
  }
}
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add chat API route proxying to saas-maker"
```

---

### Task 10: Chat Widget on Public Page

**Files:**
- Create: `src/components/public/chat-widget.tsx`
- Modify: `src/app/[slug]/page.tsx` (add chat widget)

**Step 1: Create chat widget**

Create file `src/components/public/chat-widget.tsx`:
```tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget({ slug, displayName }: { slug: string; displayName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                assistantMsg += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMsg };
                  return updated;
                });
              }
            } catch { /* skip malformed lines */ }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 hover:scale-110"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-gray-950/80 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="border-b border-white/10 p-4">
            <p className="text-sm font-medium text-white">Chat with {displayName}</p>
            <p className="text-xs text-gray-400">Ask me anything</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-sm text-gray-500 mt-8">Ask a question to get started</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'border border-white/10 bg-white/5 text-gray-200'
                }`}>
                  {msg.content || '...'}
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 2: Add chat widget to public page**

Modify `src/app/[slug]/page.tsx` — add import and render `ChatWidget` after the links section:
```tsx
// Add import at top:
import { ChatWidget } from '@/components/public/chat-widget';

// Add before <footer>, inside the main div:
{page.chatEnabled && <ChatWidget slug={slug} displayName={page.displayName} />}
```

**Step 3: Verify chat UI renders**

```bash
pnpm dev
```
Visit a published page — chat button should appear (chat won't work until saas-maker chat endpoint exists).

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add chat widget to public page"
```

---

### Task 11: Chat Settings Dashboard Page

**Files:**
- Create: `src/app/dashboard/chat/page.tsx`
- Create: `src/app/api/pages/[pageId]/chat-config/route.ts`

**Step 1: Create chat config API**

Create file `src/app/api/pages/[pageId]/chat-config/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [page] = await db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, session.user.id)));
  if (!page) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { chatEnabled, chatSystemPrompt } = body;

  const [updated] = await db.update(pages)
    .set({
      chatEnabled: chatEnabled ?? page.chatEnabled,
      chatSystemPrompt: chatSystemPrompt ?? page.chatSystemPrompt,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, pageId))
    .returning();

  return NextResponse.json(updated);
}
```

**Step 2: Create chat settings page**

Create file `src/app/dashboard/chat/page.tsx`:
```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ChatSettings } from '@/components/dashboard/chat-settings';

export default async function ChatSettingsPage() {
  const session = await auth();
  const userPages = await db.select().from(pages).where(eq(pages.userId, session!.user!.id!));
  const page = userPages[0];

  if (!page) redirect('/dashboard');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Chat Settings</h2>
      <ChatSettings
        pageId={page.id}
        initialEnabled={page.chatEnabled ?? false}
        initialPrompt={page.chatSystemPrompt ?? ''}
      />
    </div>
  );
}
```

**Step 3: Create chat settings component**

Create file `src/components/dashboard/chat-settings.tsx`:
```tsx
'use client';

import { useState } from 'react';

export function ChatSettings({
  pageId,
  initialEnabled,
  initialPrompt,
}: {
  pageId: string;
  initialEnabled: boolean;
  initialPrompt: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/pages/${pageId}/chat-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatEnabled: enabled, chatSystemPrompt: prompt }),
    });
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-medium text-white">Enable Chat</p>
          <p className="text-sm text-gray-400">Let visitors chat with an AI about your content</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">System Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="You are a helpful assistant that answers questions about [name]. Use only the provided context."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-500">Customize how the AI responds to visitors.</p>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add chat settings dashboard page"
```

---

### Task 12: Page Settings (Create/Edit Page + Slug + Publish)

**Files:**
- Create: `src/app/dashboard/settings/page.tsx`
- Create: `src/components/dashboard/page-settings.tsx`
- Create: `src/app/api/pages/[pageId]/route.ts`

**Step 1: Create page update API**

Create file `src/app/api/pages/[pageId]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: Request, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [page] = await db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, session.user.id)));
  if (!page) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.slug !== undefined) {
    const existing = await db.select().from(pages).where(eq(pages.slug, body.slug));
    if (existing.length > 0 && existing[0].id !== pageId) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }
    updates.slug = body.slug;
  }
  if (body.displayName !== undefined) updates.displayName = body.displayName;
  if (body.bio !== undefined) updates.bio = body.bio;
  if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl;
  if (body.published !== undefined) updates.published = body.published;

  const [updated] = await db.update(pages).set(updates).where(eq(pages.id, pageId)).returning();
  return NextResponse.json(updated);
}
```

**Step 2: Create page settings component**

Create file `src/components/dashboard/page-settings.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageData {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  published: boolean;
}

export function PageSettings({ page }: { page: PageData | null }) {
  const router = useRouter();
  const [slug, setSlug] = useState(page?.slug ?? '');
  const [displayName, setDisplayName] = useState(page?.displayName ?? '');
  const [bio, setBio] = useState(page?.bio ?? '');
  const [published, setPublished] = useState(page?.published ?? false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    if (page) {
      await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, displayName, bio, published }),
      });
    } else {
      await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, displayName, bio }),
      });
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Username / Slug</label>
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
          <span className="pl-4 text-sm text-gray-500">linkchat.com/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 bg-transparent px-1 py-2 text-sm text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Display Name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      {page && (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="font-medium text-white">Published</p>
            <p className="text-sm text-gray-400">Make your page visible to everyone</p>
          </div>
          <button
            onClick={() => setPublished(!published)}
            className={`relative h-6 w-11 rounded-full transition ${published ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition ${published ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : page ? 'Save' : 'Create Page'}
      </button>
    </div>
  );
}
```

**Step 3: Create settings dashboard page**

Create file `src/app/dashboard/settings/page.tsx`:
```tsx
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PageSettings } from '@/components/dashboard/page-settings';

export default async function SettingsPage() {
  const session = await auth();
  const userPages = await db.select().from(pages).where(eq(pages.userId, session!.user!.id!));
  const page = userPages[0] ?? null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{page ? 'Page Settings' : 'Create Your Page'}</h2>
      <PageSettings page={page} />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add page settings with create/edit/publish"
```

---

### Task 13: Landing Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Create landing page**

Replace `src/app/page.tsx` with:
```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Gradient blobs */}
      <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[128px]" />
      <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[128px]" />

      <div className="relative mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Your links.<br />Your story.<br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Your AI.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400">
          Create a beautiful personal page with all your links — and let visitors chat with an AI that knows everything about you.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
          <Link
            href="/demo"
            className="rounded-xl border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            See Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add landing page"
```

---

### Task 14: Cleanup & Polish

**Step 1: Update root layout**

Modify `src/app/layout.tsx` to set dark theme defaults:
- Set `<html className="dark">` and `<body className="bg-gray-950 text-white">`
- Add proper metadata (title, description)

**Step 2: Add delete link API route**

Create file `src/app/api/pages/[pageId]/links/[linkId]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { links, pages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(_req: Request, { params }: { params: Promise<{ pageId: string; linkId: string }> }) {
  const { pageId, linkId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [page] = await db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, session.user.id)));
  if (!page) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.delete(links).where(and(eq(links.id, linkId), eq(links.pageId, pageId)));
  return NextResponse.json({ ok: true });
}
```

**Step 3: Add delete info block API route**

Create file `src/app/api/pages/[pageId]/info/[blockId]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { infoBlocks, pages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(_req: Request, { params }: { params: Promise<{ pageId: string; blockId: string }> }) {
  const { pageId, blockId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [page] = await db.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.userId, session.user.id)));
  if (!page) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await db.delete(infoBlocks).where(and(eq(infoBlocks.id, blockId), eq(infoBlocks.pageId, pageId)));
  return NextResponse.json({ ok: true });
}
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add delete routes, polish layout"
```

---

## Summary

| Task | What | Depends On |
|------|------|-----------|
| 1 | Project scaffold | — |
| 2 | DB schema (Drizzle + Turso) | 1 |
| 3 | Auth (NextAuth v5) | 2 |
| 4 | SaaS Maker client | 1 |
| 5 | Dashboard layout + nav | 3 |
| 6 | Page CRUD + Links | 5 |
| 7 | Info blocks | 6 |
| 8 | Public glassmorphism page | 2 |
| 9 | Chat API route | 4, 8 |
| 10 | Chat widget UI | 9 |
| 11 | Chat settings dashboard | 5 |
| 12 | Page settings (create/edit/publish) | 5 |
| 13 | Landing page | 1 |
| 14 | Cleanup + delete routes | 6, 7 |

**Parallelizable:** Tasks 4, 8, 13 can run in parallel with Tasks 5-7.
