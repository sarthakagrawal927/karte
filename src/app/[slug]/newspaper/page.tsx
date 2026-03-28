import { notFound } from 'next/navigation';
import { getPageBySlug, getGeneratedPage } from '../_lib/get-page-data';
import { resolveThemeConfig } from '@/lib/themes';
import { auth } from '@/lib/auth';
import type { NewspaperContent } from '@/lib/generated-page-types';
import { NewspaperFrontPage } from '@/components/public/newspaper/newspaper-front-page';
import { GenerateNewspaper } from '@/components/public/newspaper/generate-newspaper';

export default async function NewspaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await getPageBySlug(slug);
  if (!page) notFound();
  if (!page.newspaperEnabled) notFound();

  const theme = resolveThemeConfig(page.themeConfig as any);
  const generatedPage = await getGeneratedPage(page.id, 'newspaper');

  const existingNewspaper =
    generatedPage?.status === 'ready' && generatedPage.content
      ? (generatedPage.content as unknown as NewspaperContent)
      : null;

  if (existingNewspaper) {
    return (
      <NewspaperFrontPage
        content={existingNewspaper}
        displayName={page.displayName}
        avatarUrl={page.avatarUrl ?? null}
        slug={slug}
        accentColor={theme.accentColor}
      />
    );
  }

  // Only show generate UI to the page owner
  const session = await auth().catch(() => null);
  const isOwner = session?.user?.id === page.userId;
  if (!isOwner) notFound();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <GenerateNewspaper
        pageId={page.id}
        slug={slug}
        accentColor={theme.accentColor}
      />
    </div>
  );
}
