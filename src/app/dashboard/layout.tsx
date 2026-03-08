import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/sidebar';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const page = await db.query.pages.findFirst({
    where: eq(pages.userId, session.user.id!),
    columns: { slug: true },
  });

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar slug={page?.slug} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
