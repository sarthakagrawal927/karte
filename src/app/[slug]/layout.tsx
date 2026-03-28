import { notFound } from 'next/navigation';
import { getPageBySlug } from './_lib/get-page-data';
import type { Metadata } from 'next';

export const runtime = 'edge';

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: 'Not Found' };

  return {
    title: page.displayName,
    description: page.bio ?? `${page.displayName}'s links`,
    openGraph: {
      title: page.displayName,
      description: page.bio ?? `${page.displayName}'s links`,
      ...(page.avatarUrl && { images: [page.avatarUrl] }),
    },
  };
}

export default async function SlugLayout({ params, children }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return <>{children}</>;
}
