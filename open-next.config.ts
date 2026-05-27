import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Enables Next.js ISR / `revalidate` on Cloudflare Workers.
//
// Two layers of caching are stacked:
//
//   1. R2 incremental cache — the source of truth. Rendered HTML is
//      stored in the linkchat-cache R2 bucket keyed by route. A Durable
//      Object queue handles background revalidation when entries go
//      stale (revalidate=60 + stale-while-revalidate=300).
//
//   2. Regional cache (CF Cache API) wrapping R2 — every Cloudflare PoP
//      keeps its own short-lived copy of the R2 response, so repeat
//      visits within a PoP don't even hit R2 (~10-20ms vs ~100-200ms).
//      This is what gives us actual millisecond TTFB.
//
// "long-lived" mode tells the regional cache to honor the upstream
// cache-control headers — matching what we set in next.config.ts
// (`s-maxage=60, stale-while-revalidate=300`).
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived",
  }),
  queue: doQueue,
});
