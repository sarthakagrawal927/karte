# landing-astro

Static Astro port of the karte.cc `/` route — the Onyx Deck. Deploys to
Cloudflare Pages, intended to take over `/` from the Next.js Workers
deploy once verified.

## Why a separate project?

The deck is fully static: no DB, no auth, no per-user content. The
Next.js Workers deploy hit p75 LCP ≈ 2.9 s on desktop because OpenNext
was re-rendering the deck every request and shipping a React runtime
for the LCP path. The reference Astro setup at
`fleet/sarthakagrawal/` lands p75 LCP ≈ 360 ms on the same Pages
runtime; this project mirrors that config (output: `'static'`,
`inlineStylesheets: 'always'`, Lightning CSS transformer + minifier).

## Stack

- Astro 5 — `output: 'static'`
- Lightning CSS — transformer + minifier (fleet web-stack standard,
  see `../AGENTS.md` → "Fleet web stack standard")
- `@astrojs/sitemap`
- Cloudflare Pages — see `wrangler.toml` (`pages_build_output_dir =
  "dist"`)

No SSR adapter, no React, no client JS. The Onyx Deck visuals (gold
foil, sheen, corner glyphs, deck numbering) are all pure CSS — the
copied `src/styles/landing.css` does the heavy lifting unchanged.

## Commands

```bash
pnpm install
pnpm dev      # astro dev → http://localhost:4321
pnpm build    # static HTML → dist/
pnpm preview  # serve dist/ locally
```

## Structure

```
landing-astro/
  astro.config.mjs          # Mirrors sarthakagrawal — output: 'static',
                            # inlineStylesheets: 'always', Lightning CSS.
  wrangler.toml             # CF Pages, pages_build_output_dir = "dist".
  src/
    pages/index.astro       # Composes the six OnyxCard sections.
    layouts/Layout.astro    # Meta tags, font preloads (Playfair + Inter).
    components/             # Six .astro ports of the React components.
    styles/landing.css      # Copied verbatim from src/app/landing.css.
  public/_headers           # CF Pages cache headers.
```

## Compromises vs. the Next.js original

The React landing had three places with real interactivity. The static
port handles each as follows:

- **OnyxCard sheen** — the React version tracked the cursor and fed
  `--mx`/`--my` CSS vars to a radial-gradient overlay. Dropped. The
  CSS already defaults `--mx: 50%; --my: 50%`, which is what touch
  devices and no-hover users always saw.
- **OnyxCta form** — React version called `router.push('/create?slug=…')`
  with client-side sanitisation. Replaced with a native
  `<form action="/create" method="GET">` + `<input name="slug">`.
  Browser produces the same URL. The on-type lowercase/regex filter
  is gone; `/create` re-validates server-side.
- **OnyxAgents waitlist** — the React version opened an inline AJAX
  POST to `/api/agent-waitlist`. The static port renders only the
  "Coming soon — claim a card" CTA, pointing to `/create`. The proper
  waitlist returns when the agent-subtype flow ships
  (`docs/plans/agent-subtype-spec.md`).
- **PostHog click events** — `landing_hero_*`, `landing_samples_*`,
  `landing_cta_*` are not fired on this build. The Next.js Worker
  still owns every funnel route (`/create`, `/dashboard`, the public
  slugs) so the downstream events still fire on conversion. Add
  PostHog later via an Astro layout `<script>` if the upper-funnel
  attribution turns out to matter.
- **OG / Twitter image** — Next.js generates `/opengraph-image` via the
  `opengraph-image.tsx` file convention. The Astro layout points
  `og:image` at `https://karte.cc/opengraph-image`; post-cutover the
  Worker still owns that route, so the URL keeps resolving.

## Cutover (NOT done yet)

This deploy is **additive**. The Next.js Workers deploy at
`linkchat.sarthakagrawal927.workers.dev` is untouched: same
`wrangler.jsonc`, same `package.json`, same routes. Cutover is a
follow-up step:

1. `cd landing-astro && pnpm install && pnpm build` — verify clean.
2. `wrangler pages deploy dist/` (or wire the CF dashboard build) to a
   preview URL. QA the deck against the Next.js version.
3. In the Cloudflare dashboard, route `karte.cc/` (exact) → Pages
   project, leave `karte.cc/*` on the Worker. Verify the Worker still
   owns `/<slug>`, `/dashboard/*`, `/api/*`, `/create`, `/login`,
   `/welcome`, `/about`, `/privacy`, `/terms`.
4. Run psi-swarm against `karte.cc/`, confirm LCP < 500 ms p75 desktop.
5. Delete `src/app/page.tsx`, `src/components/landing/*`, and
   `src/app/landing.css` from the linkchat root **only after**
   the route is observably stable for ~a week.

Do not delete the React landing until the Pages route is the source of
truth in production.
