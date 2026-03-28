import { notFound } from 'next/navigation';
import { getPageBySlug, getGeneratedPage } from '../_lib/get-page-data';
import { resolveThemeConfig } from '@/lib/themes';
import { auth } from '@/lib/auth';
import type { EncyclopediaContent } from '@/lib/generated-page-types';
import { WikiArticle } from '@/components/public/encyclopedia/wiki-article';
import { GenerateEncyclopedia } from '@/components/public/encyclopedia/generate-encyclopedia';

export default async function EncyclopediaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await getPageBySlug(slug);
  if (!page) notFound();
  if (!page.encyclopediaEnabled) notFound();

  const theme = resolveThemeConfig(page.themeConfig as any);
  const generatedPage = await getGeneratedPage(page.id, 'encyclopedia');

  if (generatedPage?.status === 'ready' && generatedPage.content) {
    return (
      <WikiArticle
        content={generatedPage.content as unknown as EncyclopediaContent}
        displayName={page.displayName}
        avatarUrl={page.avatarUrl ?? null}
        accentColor={theme.accentColor}
      />
    );
  }

  // Only show generate UI to the page owner
  const session = await auth().catch(() => null);
  const isOwner = session?.user?.id === page.userId;
  if (!isOwner) notFound();

  return (
    <GenerateEncyclopedia
      pageId={page.id}
      slug={slug}
      accentColor={theme.accentColor}
    />
  );
}
