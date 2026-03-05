import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ChatSettings } from '@/components/dashboard/chat-settings';

export default async function ChatSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const page = await db.query.pages.findFirst({
    where: eq(pages.userId, session.user.id),
  });

  if (!page) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Chat Settings</h1>
        <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center backdrop-blur-xl">
          <p className="mb-4 text-gray-400">
            Create a page first before configuring chat settings.
          </p>
          <a
            href="/dashboard/settings"
            className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
          >
            Create Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <ChatSettings
      pageId={page.id}
      initialChatEnabled={page.chatEnabled ?? false}
      initialSystemPrompt={page.chatSystemPrompt ?? ''}
    />
  );
}
