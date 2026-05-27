import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    '@libsql/client',
    '@libsql/hrana-client',
    '@libsql/isomorphic-ws',
    'drizzle-orm',
  ],
  async headers() {
    // CF's edge PoP cache requires explicit Cache-Control to actually
    // cache responses. Even when a page is force-static + has
    // revalidate, Next.js doesn't always set the public Cache-Control
    // header — particularly under OpenNext for Cloudflare. Force it via
    // this config so CF caches /<slug> root pages at every PoP.
    //
    // Tenant custom domains rewrite to /<slug>, so a path-based match
    // covers both karte.cc/<slug> and tenant.com/ (where middleware
    // rewrites tenant.com/ → /<slug>).
    return [
      {
        // Match exactly /<single-segment> — profile root pages. The
        // negative lookahead excludes known route names so they don't
        // get hijacked.
        source:
          '/:slug((?!api|_next|dashboard|login|create|about|privacy|terms|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|opengraph-image|manifest\\.webmanifest|\\.well-known).*[^/])',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-b339ffd5395643a28df3655ef3aa943d.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
