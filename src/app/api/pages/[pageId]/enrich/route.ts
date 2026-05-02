import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth-server';
import { autoEnrichProfileFromLinks } from '@/lib/profile-auto-enrich';

function readPositiveInt(value: unknown, fallback: number, max: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageId } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const result = await autoEnrichProfileFromLinks(pageId, {
      userId: session.user.id,
      apply: Boolean(body.apply),
      updateBio: body.updateBio !== false,
      replaceExisting: body.replaceExisting !== false,
      maxUrls: readPositiveInt(body.maxUrls, 12, 20),
    });

    return NextResponse.json({
      plan: result.plan,
      sources: result.sources.map((source) => ({
        url: source.url,
        title: source.title,
        description: source.description,
      })),
      applied: result.applied,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'PAGE_NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    console.error('Failed to auto-enrich profile from links', error);
    return NextResponse.json(
      { error: 'Failed to auto-enrich profile' },
      { status: 500 },
    );
  }
}
