import { notFound } from 'next/navigation';
import { getPageBySlug, getGeneratedPage, getPageLinks, getPageProjects } from '../_lib/get-page-data';
import { resolveThemeConfig } from '@/lib/themes';
import { auth } from '@/lib/auth';
import type { RoastContent } from '@/lib/generated-page-types';
import { RoastPageClient } from '@/components/public/roast/roast-page-client';

export default async function RoastPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await getPageBySlug(slug);
  if (!page) notFound();
  if (!page.roastEnabled) notFound();

  const theme = resolveThemeConfig(page.themeConfig as any);

  const [generatedPage, links, projects] = await Promise.all([
    getGeneratedPage(page.id, 'roast'),
    getPageLinks(page.id),
    getPageProjects(page.id),
  ]);

  const existingRoast =
    generatedPage?.status === 'ready' && generatedPage.content
      ? (generatedPage.content as unknown as RoastContent)
      : null;

  // If no content generated and visitor isn't the owner, 404
  const session = await auth().catch(() => null);
  const isOwner = session?.user?.id === page.userId;
  if (!existingRoast && !isOwner) notFound();

  const linkTitles = links.map((l) => l.title);
  const projectTitles = projects.map((p) => p.title);

  return (
    <RoastPageClient
      slug={slug}
      pageId={page.id}
      displayName={page.displayName}
      accentColor={theme.accentColor}
      existingRoast={existingRoast}
      linkTitles={linkTitles}
      projectTitles={projectTitles}
    />
  );
}
