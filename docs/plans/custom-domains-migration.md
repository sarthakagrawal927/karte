# Plan — Custom Domains via Workers for Platforms

**Status:** Parked behind feature flag `CUSTOM_DOMAINS_LIVE = false` in
`src/components/dashboard/domain-editor.tsx`. Users see a "Notify me" CTA that
emits a `custom_domain_interest` PostHog event when clicked.

**Background:** see `docs/custom-domains.md` § "Known platform limitation."
Custom hostnames register and verify cleanly via Cloudflare for SaaS, but the
fallback-origin proxy path can't reach a bare Worker — it tries a real TCP
connection to the origin IP, bypassing Worker routes. CF's supported pattern
for this exact case is **Workers for Platforms** (dispatch namespaces).

---

## Trigger conditions (any one)

Execute this plan when one of these fires:

1. **PostHog event count ≥ 20.** Query `custom_domain_interest` event in
   PostHog (already wired). At ~20 distinct user signals, the demand is real
   enough to justify the +$20/mo and the migration time.
2. **One paying-tier user explicitly asks** in support, with intent to use it.
3. **Pre-launch checklist** — if doing a public/PR launch and want the feature
   working out of the box, ship it before launch regardless of signal count.

---

## What changes (and what doesn't)

**Stays the same:**

- All existing code in `src/middleware.ts`, `src/lib/page-domains.ts`,
  `src/lib/cloudflare-domains.ts`, `src/app/api/pages/[pageId]/domains/*`,
  `src/components/dashboard/domain-editor.tsx`
- `pageDomains` table + verification flow
- The Next.js app code (Worker entrypoint, routes, RSC)
- karte.cc serving its landing + dashboard + `/<slug>` profiles

**Changes:**

- Cloudflare plan: $5 Workers Paid → **$25 Workers for Platforms** (self-serve
  upgrade in CF dashboard)
- New thin **dispatcher worker** in `workers/dispatcher/` that delegates to
  the user worker via dispatch namespace
- Existing `linkchat` worker is published *into* a dispatch namespace instead
  of as a standalone worker
- Custom hostnames re-attach to the dispatch namespace (per-hostname or via
  the API once)
- Flip `CUSTOM_DOMAINS_LIVE` to `true` in `domain-editor.tsx`

---

## Step-by-step checklist

### 1. Subscribe to Workers for Platforms

- [ ] CF Dashboard → Workers & Pages → upgrade plan → **Workers for Platforms** ($25/mo)
- [ ] Verify billing went through (or use the trial if eligible)

### 2. Create the dispatch namespace

- [ ] `pnpm exec wrangler dispatch-namespace create karte-tenants`
- [ ] Confirm in dashboard: Workers & Pages → Workers for Platforms → `karte-tenants` exists

### 3. Move the existing `linkchat` worker into the namespace

- [ ] In `wrangler.jsonc`, add `"workers_dev": false` to the linkchat config
      (it'll be invoked via the dispatcher, not its own URL)
- [ ] Add a top-level `"dispatch_namespace": "karte-tenants"` *or* use the
      `--dispatch-namespace karte-tenants` flag on `wrangler deploy`. Pick
      one based on whatever wrangler 4.x docs say at the time.
- [ ] Rename the worker if needed — convention is `karte-app` or similar.
      Update `wrangler.jsonc` `name` field.
- [ ] `pnpm deploy:cf` → verify it lands in the namespace

### 4. Create the dispatcher worker

Create `workers/dispatcher/wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "karte-dispatcher",
  "main": "src/index.ts",
  "compatibility_date": "2026-01-01",
  "compatibility_flags": ["nodejs_compat_v2"],
  "routes": [
    { "pattern": "karte.cc/*", "zone_name": "karte.cc" },
    { "pattern": "*.karte.cc/*", "zone_name": "karte.cc" }
  ],
  "dispatch_namespaces": [
    { "binding": "DISPATCHER", "namespace": "karte-tenants" }
  ]
}
```

And `workers/dispatcher/src/index.ts` (the entire thing, ~25 lines):

```ts
interface Env {
  DISPATCHER: { get: (name: string) => { fetch: (req: Request) => Promise<Response> } };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const userWorker = env.DISPATCHER.get('karte-app');
      return await userWorker.fetch(request);
    } catch (err) {
      // Dispatch failures should never leak — log and return a clean 500.
      console.error('dispatcher error:', err);
      return new Response('Service temporarily unavailable', {
        status: 503,
        headers: { 'content-type': 'text/plain' },
      });
    }
  },
};
```

- [ ] `cd workers/dispatcher && pnpm exec wrangler deploy`

### 5. Move worker route bindings

- [ ] Remove `routes` from the linkchat (user worker) `wrangler.jsonc` — those
      patterns now belong to the dispatcher, not the user worker
- [ ] Confirm dispatcher's routes catch `karte.cc` traffic correctly
      (smoke-test `https://karte.cc/`)

### 6. Attach custom hostnames to the dispatch namespace

For each `pageDomains` row with status `verified`:

```bash
curl -X PATCH \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "custom_origin_server": "karte-dispatcher.<account>.workers.dev"
  }' \
  "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames/<hostname-id>"
```

Or update `src/lib/cloudflare-domains.ts` `addDomain()` to set
`custom_origin_server` automatically on new registrations, then re-run for
existing rows.

### 7. Clean up debugging-era state

These are leftovers from the failed CF-for-SaaS-on-Workers attempt:

- [ ] Delete the karte.cc apex A record (id `1af8abfa3cb10586db4157eb64ba9dac`,
      points to 192.0.2.1). Worker routes now catch karte.cc traffic via the
      dispatcher.
- [ ] Delete the `origin.karte.cc` Worker Custom Domain entry from
      `wrangler.jsonc` routes
- [ ] Reset CF for SaaS fallback origin (or leave; it's irrelevant once
      custom_origin_server is set per-hostname)

### 8. Flip the feature flag

- [ ] In `src/components/dashboard/domain-editor.tsx`, set
      `CUSTOM_DOMAINS_LIVE = true`
- [ ] Remove the "Notify me" card path — it'll auto-hide via the flag, but
      consider deleting `NotifyCard` outright once you don't need to revert
- [ ] Commit + deploy

### 9. Smoke-test

- [ ] Hit `https://karte.cc/` — should render landing
- [ ] Hit `https://karte.cc/sarthak` (or any slug) — should render profile
- [ ] Add a fresh test hostname via the dashboard, complete validation
- [ ] Hit the test hostname — should render the associated user's profile,
      Host header preserved, middleware rewrites correctly
- [ ] Check Cloudflare Workers analytics: dispatcher invocation count + user
      worker invocation count both incrementing

### 10. Notify the waitlist

- [ ] Query PostHog for users who fired `custom_domain_interest`
- [ ] Send a one-shot email: "It's live. Add yours at karte.cc/dashboard/domains."

---

## Cost projection

| Component | Cost |
|---|---|
| Workers for Platforms base | $25/mo |
| Requests above 20M/mo | $0.30/M |
| CPU above 60M ms/mo | $0.02/M |
| Scripts (1000 included, you'll use 2) | $0 |
| CF for SaaS per-hostname (100 free, $0.10/each after) | $0 until ~100 paid users with custom domains |

For your scale: **~$25/mo flat** for the foreseeable future.

---

## Rollback plan

If migration goes sideways:

1. Re-deploy the user worker as a standalone (not in dispatch namespace) by
   removing the namespace flag
2. Restore the `routes` block in its `wrangler.jsonc`
3. Set `CUSTOM_DOMAINS_LIVE = false` and re-deploy the app
4. Custom hostnames will go back to 522 but the rest of the site (landing,
   dashboard, profiles) keeps working

The user-facing impact during rollback is zero unless someone is actively
visiting a custom hostname mid-rollback.

---

## Open questions to resolve at execution time

- [ ] Wrangler 4.x syntax for dispatch namespace deployment — verify against
      current docs, the snippet above may be stale by then
- [ ] Whether `dispatch_namespaces` binding name matters for our code (we
      hardcoded `DISPATCHER` and `karte-app` — adjust if cleaner names exist)
- [ ] Whether the user worker should keep its own `workers_dev: true` for
      debugging access, or be fully namespaced
- [ ] If multiple regions/edges cause dispatcher cold-starts to noticeably
      increase tail latency, may need to pre-warm
