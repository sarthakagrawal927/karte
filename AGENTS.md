# agents.md — linkchat

## Purpose
A link-in-bio platform where users create AI-enhanced profile pages with links, projects, chat, encyclopedia, roast, and newspaper modes — deployed on Cloudflare via OpenNext.

## Stack
- Framework: Next.js 16 (App Router, React 19, React Compiler enabled)
- Language: TypeScript (strict)
- Styling: Tailwind CSS v4 (dark theme, glassmorphism aesthetic)
- DB: Turso (libSQL/SQLite) via Drizzle ORM — schema at `src/db/schema.ts`
- Auth: NextAuth v5 (beta 30) with Google provider + Drizzle adapter
- Testing: Playwright configured (minimal tests); no unit test framework
- Deploy: Cloudflare Workers via `@opennextjs/cloudflare` (OpenNext). `pnpm deploy:cf`
- Package manager: pnpm

## Repo structure
```
src/
  app/
    page.tsx              — Landing / marketing page
    layout.tsx            — Root layout
    login/                — Sign-in page
    create/               — Page creation wizard
    dashboard/            — Authenticated dashboard (links, projects, sections, appearance, memory, leads, analytics, chats)
    [slug]/               — Public profile page (SSR, dynamic route)
    api/
      auth/               — NextAuth handler
      pages/              — CRUD for pages, links, projects, infoBlocks, sections, chat config
      chat/[slug]/        — Public chat endpoint (streaming SSE) + conversations + messages
      contact/[slug]/     — Public contact form submission
      track/[slug]/       — Analytics event tracking
      settings/ai-key/    — AI API key management
      uploads/images/     — R2 image upload
  components/
    dashboard/            — Dashboard UI (sidebar, editors for links/projects/sections/etc.)
    public/               — Public-facing (glass-card, link-card, project-card, chat-widget, contact form)
    ui/                   — Shared UI primitives
    SaasMakerAnalytics.tsx / saasmaker-feedback.tsx
  db/
    schema.ts             — Full Drizzle schema (users, pages, links, projects, infoBlocks, pageSections, conversations, messages, pageEvents, generatedPages, contactSubmissions)
    index.ts              — Drizzle client (Turso connection)
  lib/
    auth.ts               — NextAuth v5 config (Google, DrizzleAdapter)
    ai-prompts.ts         — AI prompts for encyclopedia/roast/newspaper generation
    themes.ts             — Theme config types + presets
    scraper.ts            — URL scraping for page content enrichment
    r2.ts                 — Cloudflare R2 client (avatar uploads via @aws-sdk/client-s3)
    rate-limit.ts         — In-memory sliding window rate limiter (20 req/min/IP)
    page-sections.ts      — Section type definitions
    visitor-id.ts         — Anonymous visitor fingerprinting (localStorage)
    validation.ts         — Input validators (slug, URL, email, content length limits)
  middleware.ts           — Next.js middleware (auth guards for /dashboard/*)
docs/plans/               — Archived implementation plans (timestamped)
drizzle.config.ts         — Drizzle Kit config (Turso dialect)
wrangler.jsonc            — Cloudflare Worker config (OpenNext output)
open-next.config.ts       — OpenNext Cloudflare config (minimal)
```

## Key commands
```bash
pnpm dev              # next dev (localhost:3000)
pnpm build            # next build
pnpm lint             # eslint

# Cloudflare deployment
pnpm deploy:cf        # opennextjs-cloudflare build + deploy to CF Workers
pnpm preview          # opennextjs-cloudflare build + local preview

# Drizzle DB
pnpm drizzle-kit generate   # generate migration from schema changes
pnpm drizzle-kit push       # push schema to Turso (dev shortcut, no migration file)
pnpm drizzle-kit studio     # Drizzle Studio UI
```

## Architecture notes
- **Dual deploy target**: `pnpm dev` uses standard Next.js locally with `file:local.db`. `pnpm deploy:cf` compiles via OpenNext and deploys to Cloudflare Workers (`wrangler.jsonc` points at `.open-next/worker.js`).
- **DB**: Turso (libSQL) in production; `local.db` SQLite file for local dev. Drizzle ORM for all queries — no raw SQL. UUIDs as text primary keys via `crypto.randomUUID()`.
- **AI features**: Pages can enable `chat` (RAG via SaasMaker), `encyclopedia`, `roast`, `newspaper`. Generated content cached in `generatedPages` table with status lifecycle: `pending → generating → ready | error`.
- **R2 storage**: Avatar/project images stored in Cloudflare R2 via AWS S3-compatible SDK. Requires `CLOUDFLARE_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- **SaasMaker integration**: Each user has `smProjectId`, `smApiKey`, `smIndexId` for RAG-backed chat. `infoBlocks` are synced to SaasMaker as documents (tracked via `smDocumentId`).
- **React Compiler**: `babel-plugin-react-compiler` is installed — do not add manual `useMemo`/`useCallback` where the compiler handles it.
- **Rate limiter is in-memory** — resets on deploy. No distributed rate limiting currently.
- **No proper DB migrations** — some tables use runtime `CREATE TABLE IF NOT EXISTS`. Use `drizzle-kit push` for schema changes in dev; for production schema changes, verify migration strategy first.
- **No tests** — no unit, integration, or e2e tests written yet. Playwright is configured.
- Required env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, R2 vars, `SAASMAKER_API_URL`, `SAASMAKER_ADMIN_KEY`, `NEXT_PUBLIC_APP_URL`. See `.env.example`.
- Husky pre-push hook configured.

## Active context

