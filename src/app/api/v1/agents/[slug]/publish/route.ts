import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db, ensureProjectsTable } from '@/db';
import { pages } from '@/db/schema';
import { authenticateApiKey } from '@/lib/agent-api-auth';
import { sanitizeAgentPageResponse } from '@/lib/agent-pages';

function getOrigin(req: Request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await authenticateApiKey(req.headers.get('authorization'));
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  await ensureProjectsTable();

  const page = await db.query.pages.findFirst({
    where: and(
      eq(pages.slug, slug),
      eq(pages.userId, auth.userId),
      eq(pages.pageType, 'agent'),
    ),
  });

  if (!page) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const now = new Date();
  const [updated] = await db
    .update(pages)
    .set({ published: true, updatedAt: now })
    .where(eq(pages.id, page.id))
    .returning();

  const origin = getOrigin(req);
  return NextResponse.json({
    agent: sanitizeAgentPageResponse(updated),
    urls: {
      profile: `${origin}/${updated.slug}`,
      manifest: `${origin}/${updated.slug}/agent.json`,
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await authenticateApiKey(req.headers.get('authorization'));
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  await ensureProjectsTable();

  const page = await db.query.pages.findFirst({
    where: and(
      eq(pages.slug, slug),
      eq(pages.userId, auth.userId),
      eq(pages.pageType, 'agent'),
    ),
  });

  if (!page) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const now = new Date();
  const [updated] = await db
    .update(pages)
    .set({ published: false, updatedAt: now })
    .where(eq(pages.id, page.id))
    .returning();

  return NextResponse.json({ agent: sanitizeAgentPageResponse(updated) });
}
