import { NextResponse } from 'next/server';

import { buildKarteAgentSkillMarkdown } from '@/lib/karte-agent-skill';

export async function GET() {
  const body = buildKarteAgentSkillMarkdown();

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
