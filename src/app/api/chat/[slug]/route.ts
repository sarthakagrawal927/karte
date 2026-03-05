import { db } from '@/db';
import { pages, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { chatCompletion } from '@/lib/saasmaker';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await req.json();
  const { query } = body;

  if (!query?.trim()) {
    return new Response(JSON.stringify({ error: 'query required' }), { status: 400 });
  }

  // Get page + user + saas-maker config
  const [page] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.published, true)));
  if (!page || !page.chatEnabled) {
    return new Response(JSON.stringify({ error: 'Chat not available' }), { status: 404 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, page.userId));
  if (!user?.smApiKey || !user?.smIndexId) {
    return new Response(JSON.stringify({ error: 'Chat not configured' }), { status: 503 });
  }

  try {
    const stream = await chatCompletion(
      user.smApiKey,
      user.smIndexId,
      query,
      page.chatSystemPrompt || `You are a helpful assistant that answers questions about ${page.displayName}. Use only the provided context to answer. If you don't know, say so.`
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Chat service unavailable' }), { status: 502 });
  }
}
