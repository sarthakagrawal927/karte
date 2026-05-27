import {
  allVariantsById,
  type LinkCardData,
  type ProjectCardData,
} from '@/components/public/widgets';
import { pickLinkVariants, pickProjectVariants } from '@/lib/widget-picker';

// Column spans per variant size, in a 6-col underlying grid. Mixing sizes
// gives us the bento mosaic without a stored layout plan — the picker
// decides shapes, we decide spans here.
const SIZE_SPAN: Record<string, string> = {
  hero: 'sm:col-span-6',
  wide: 'sm:col-span-4',
  square: 'sm:col-span-3',
  line: 'sm:col-span-6',
  tall: 'sm:col-span-3',
};

interface LayoutRendererProps {
  links: ReadonlyArray<LinkCardData>;
  projects: ReadonlyArray<ProjectCardData>;
  accentColor: string;
  slug: string;
}

/**
 * Picks a variant for every link + project and arranges them as a bento
 * mosaic. One hero (if there's a project that earns it) anchors the top;
 * the rest fill a 6-col grid where squares + wides + lines compose into
 * varied rows. Pure server-side — the picker runs at render time so this
 * stays static-renderable.
 */
export function LayoutRenderer({
  links,
  projects,
  accentColor,
  slug,
}: LayoutRendererProps) {
  if (links.length === 0 && projects.length === 0) return null;

  const linkPicks = pickLinkVariants(links);
  const projectPicks = pickProjectVariants(projects);

  // Hero block: prefer a project-hero (more visual mass) over a link-hero.
  // Whichever wins, strip it out of the bento so it doesn't render twice.
  const projectHeroIdx = projectPicks.findIndex((p) => p.variantId === 'project-hero');
  const linkHeroIdx =
    projectHeroIdx === -1 ? linkPicks.findIndex((p) => p.variantId === 'link-hero') : -1;

  const heroPick =
    projectHeroIdx !== -1
      ? projectPicks[projectHeroIdx]
      : linkHeroIdx !== -1
        ? linkPicks[linkHeroIdx]
        : null;

  const remainingProjects =
    projectHeroIdx !== -1
      ? projectPicks.filter((_, i) => i !== projectHeroIdx)
      : projectPicks;
  const remainingLinks =
    linkHeroIdx !== -1
      ? linkPicks.filter((_, i) => i !== linkHeroIdx)
      : linkPicks;

  // Interleave projects + links in the bento. Order: projects first (they
  // tend to be visual / richer), then links. Future versions of the picker
  // can reshape this.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bento: ReadonlyArray<{ data: any; variantId: string }> = [
    ...remainingProjects,
    ...remainingLinks,
  ];

  const ctx = { accentColor, slug };
  const heroVariant = heroPick ? allVariantsById[heroPick.variantId] : null;

  return (
    <div className="space-y-4">
      {heroPick && heroVariant && (
        <div className="w-full">{heroVariant.render(heroPick.data, ctx)}</div>
      )}

      {bento.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6 sm:grid-flow-dense sm:gap-4">
          {bento.map((pick) => {
            const variant = allVariantsById[pick.variantId];
            if (!variant) return null;
            const sizeClass = SIZE_SPAN[variant.size] ?? 'sm:col-span-6';
            return (
              <div key={`${pick.variantId}:${pick.data.id}`} className={sizeClass}>
                {variant.render(pick.data, ctx)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
