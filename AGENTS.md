# LinkChat

Personal link-in-bio pages with an AI chatbot that answers questions about you using RAG.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, React Compiler enabled)
- **Language:** TypeScript (strict)
- **Database:** Turso (libSQL) via Drizzle ORM
- **Auth:** NextAuth v5 (beta 30) with Google provider, Drizzle adapter
- **Styling:** Tailwind CSS v4 (dark theme, glassmorphism aesthetic)
- **Image Storage:** Cloudflare R2 via AWS S3 SDK
- **AI Chat:** SaaS Maker RAG API (vector search + streaming chat completions)
- **Analytics/Feedback:** SaaS Maker widgets (feedback, testimonials, changelog, analytics)
- **Package Manager:** pnpm
- **Deployment:** Vercel

## Architecture

```
src/
  app/
    page.tsx                    # Landing page (marketing)
    login/page.tsx              # Auth page
    [slug]/page.tsx             # Public profile page (SSR)
    dashboard/
      layout.tsx                # Auth guard + sidebar
      page.tsx                  # Redirects to /dashboard/links
      links/                    # Manage profile links
      projects/                 # Manage portfolio projects
      sections/                 # Manage custom page sections
      appearance/               # Theme/appearance settings
      memory/                   # AI chatbot memory (info blocks + AI key)
      leads/                    # Contact form submissions
      analytics/                # Page view/click analytics
      chats/                    # Chat conversation history
    api/
      auth/[...nextauth]/       # NextAuth route handler
      pages/                    # CRUD for pages, links, projects, info blocks, sections, chat config
      chat/[slug]/              # Public chat endpoint (streaming) + conversations + messages
      contact/[slug]/           # Public contact form submission
      track/[slug]/             # Analytics event tracking
      settings/ai-key/          # AI API key management
      uploads/images/           # R2 image upload
  components/
    dashboard/                  # Dashboard UI (sidebar, editors for links/projects/sections/etc)
    public/                     # Public-facing (glass-card, link-card, project-card, chat-widget, contact form)
  db/
    schema.ts                   # Drizzle schema (all tables)
    index.ts                    # DB client + runtime table creation helpers
  lib/
    auth.ts                     # NextAuth config
    themes.ts                   # Theme presets + resolver
    saasmaker.ts                # SaaS Maker API client (indexes, documents, search, RAG chat)
    r2.ts                       # Cloudflare R2 upload helpers
    rate-limit.ts               # In-memory sliding window rate limiter (20 req/min/IP)
    validation.ts               # Input validators (slug, URL, email, content length limits)
    visitor-id.ts               # Client-side anonymous visitor ID (localStorage)
    page-sections.ts            # Section type definitions (text, social, testimonial, CTA, contact)
  proxy.ts                      # Auth proxy for /dashboard/*
```

### Data Model

- **users** -- extended NextAuth users with `smProjectId`, `smApiKey`, `smIndexId` for SaaS Maker integration
- **pages** -- user profile pages with slug, theme config, chat toggle, system prompt
- **links** -- sortable links on a page
- **projects** -- portfolio entries with image, description, URL
- **infoBlocks** -- content blocks fed into RAG (types: text, resume, faq), synced to SaaS Maker via `smDocumentId`
- **pageSections** -- modular public page blocks (text, social, testimonial, CTA, contact form)
- **contactSubmissions** -- leads from public contact forms
- **pageEvents** -- native analytics (page views, clicks, section views)
- **conversations/messages** -- chat history per visitor

### Key Flows

1. **Auth:** Google OAuth -> NextAuth -> Drizzle adapter -> Turso
2. **Public page:** `[slug]/page.tsx` fetches page + links + projects + sections from DB, renders SSR with theme
3. **AI Chat:** Visitor sends message -> `/api/chat/[slug]` -> rate limit check -> SaaS Maker RAG streaming response
4. **Image uploads:** Dashboard -> `/api/uploads/images` -> R2 bucket -> public URL stored in DB
5. **Analytics:** Client-side tracker fires events to `/api/track/[slug]`, stored in `pageEvents`

## Conventions

- **Path alias:** `@/*` maps to `./src/*`
- **API pattern:** Next.js Route Handlers with `auth()` guard, return `NextResponse.json()`
- **DB queries:** Drizzle query builder, not raw SQL
- **IDs:** UUID v4 via `crypto.randomUUID()` as text primary keys
- **Validation:** Centralized in `src/lib/validation.ts`, applied at API boundaries
- **Components:** Server components by default, `'use client'` only when needed
- **Sorting:** `sortOrder` integer column on all list-type tables

## Commands

```bash
pnpm dev              # Dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # ESLint

# Database
pnpm drizzle-kit generate   # Generate migrations
pnpm drizzle-kit push       # Push schema to DB
pnpm drizzle-kit studio     # DB browser UI
```

## Environment Variables

```bash
# Auth
AUTH_SECRET=                  # NextAuth secret
AUTH_GOOGLE_ID=               # Google OAuth client ID
AUTH_GOOGLE_SECRET=           # Google OAuth client secret

# Database
TURSO_DATABASE_URL=           # Turso DB URL (or file:local.db for local dev)
TURSO_AUTH_TOKEN=             # Turso auth token (not needed for local)

# Cloudflare R2 (optional -- image uploads)
CLOUDFLARE_ACCOUNT_ID=
R2_BUCKET_NAME=linkchat-images
R2_PUBLIC_BASE_URL=           # Public R2 URL
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# SaaS Maker (required for AI chat)
SAASMAKER_API_URL=            # SaaS Maker API base URL
SAASMAKER_ADMIN_KEY=          # Admin key for index/document management

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Current State

**Done:**
- Full auth flow (Google OAuth)
- Page creation with slug, display name, bio, avatar
- Link management (CRUD, sorting, enable/disable)
- Project portfolio (CRUD with image uploads to R2)
- Custom page sections (text, social, testimonial, CTA, contact form)
- Theme system (4 presets with custom colors, chat position)
- AI chat widget with streaming responses (SaaS Maker RAG)
- Chat conversation history (persisted per visitor)
- Contact form with lead capture
- Native analytics (page views, link clicks, section views)
- Rate limiting on chat API (20 req/min/IP)
- Input validation on all API endpoints
- SaaS Maker widgets (feedback, testimonials, changelog, analytics)

**Not done:**
- No tests (unit, integration, or e2e)
- No pre-push/pre-pull hooks
- No proper DB migrations (uses runtime `CREATE TABLE IF NOT EXISTS` for some tables)
- No custom domain support
- No multi-page support (one page per user)
- Rate limiter is in-memory (resets on deploy)
