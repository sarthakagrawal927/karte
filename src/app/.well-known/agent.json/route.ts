import { NextResponse } from 'next/server';

import { buildKarteAgentDiscoveryCard } from '@/lib/karte-agent-skill';

export async function GET() {
  return NextResponse.json(buildKarteAgentDiscoveryCard(), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
