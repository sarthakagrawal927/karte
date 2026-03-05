import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageId } = await params;

  const page = await db.query.pages.findFirst({
    where: and(eq(pages.id, pageId), eq(pages.userId, session.user.id)),
  });

  if (!page) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const { chatEnabled, chatSystemPrompt } = body;

  const [updated] = await db
    .update(pages)
    .set({
      chatEnabled: chatEnabled ?? page.chatEnabled,
      chatSystemPrompt:
        chatSystemPrompt !== undefined
          ? chatSystemPrompt
          : page.chatSystemPrompt,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, pageId))
    .returning();

  return NextResponse.json(updated);
}
