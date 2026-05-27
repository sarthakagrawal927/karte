
import type { WidgetVariant } from '@/lib/widget-types';

// Data shape consumed by every LinkCard variant. Mirrors the columns the
// existing LinkCard accepts plus a few optional fields for richer variants
// (image for square/hero, body for wide/tall).
export interface LinkCardData {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  imageUrl?: string | null;
  body?: string | null;
}

/**
 * `link-line` — 1-row, slim. The current default. Title + optional icon.
 * Cheap visual weight, works for stacks of >5 links.
 */
const lineVariant: WidgetVariant<LinkCardData> = {
  id: 'link-line',
  resourceType: 'link',
  size: 'line',
  budget: 'low',
  bestFor: 'Plain link in a long list. Pick when the link has no image or body.',
  requires: ['title', 'url'],
  render: (data, ctx) => (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      data-track-type="link"
      data-track-id={data.id || data.url}
      data-track-label={data.title}
      className="group flex min-h-16 w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 py-4 text-center transition-all duration-200 ease-[var(--karte-ease)] hover:-translate-y-0.5 hover:border-white/[0.20] hover:bg-white/[0.05]"
      style={ctx.accentColor ? { borderColor: `${ctx.accentColor}28` } : undefined}
    >
      <span className="text-base font-semibold text-karte-text group-hover:text-white/90">
        {data.icon && <span className="mr-2">{data.icon}</span>}
        {data.title}
      </span>
    </a>
  ),
};

/**
 * `link-square` — 1×1 tile with thumbnail. Best when the link has an image
 * (open-graph thumb, favicon-as-art, custom upload). Falls back to icon + title
 * if no image; in that case the AI should prefer `link-line` instead.
 */
const squareVariant: WidgetVariant<LinkCardData> = {
  id: 'link-square',
  resourceType: 'link',
  size: 'square',
  budget: 'medium',
  bestFor:
    'Visual link with a thumbnail. Stand-out shape; great for a portfolio piece, a launch page, or a featured destination.',
  requires: ['title', 'url'],
  render: (data, ctx) => (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      data-track-type="link"
      data-track-id={data.id || data.url}
      data-track-label={data.title}
      className="group relative flex aspect-square w-full flex-col items-start justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition-all duration-200 ease-[var(--karte-ease)] hover:-translate-y-0.5 hover:border-white/[0.20] hover:bg-white/[0.05]"
      style={ctx.accentColor ? { borderColor: `${ctx.accentColor}28` } : undefined}
    >
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50 transition-opacity duration-200 group-hover:opacity-70"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30"
          style={{ backgroundColor: ctx.accentColor || '#67e8f9' }}
        />
      )}
      <span className="relative text-2xl">
        {data.icon ?? '→'}
      </span>
      <span className="relative text-base font-semibold leading-tight text-karte-text">
        {data.title}
      </span>
    </a>
  ),
};

/**
 * `link-wide` — 2×1 tile. Title + 1-line body. Use when the link has
 * meaningful context that a one-word title can't carry.
 */
const wideVariant: WidgetVariant<LinkCardData> = {
  id: 'link-wide',
  resourceType: 'link',
  size: 'wide',
  budget: 'medium',
  bestFor:
    'Link that benefits from a 1-line description. Use for things like "Read my latest essay" where the title alone is too terse.',
  requires: ['title', 'url'],
  render: (data, ctx) => (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      data-track-type="link"
      data-track-id={data.id || data.url}
      data-track-label={data.title}
      className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-200 ease-[var(--karte-ease)] hover:-translate-y-0.5 hover:border-white/[0.20] hover:bg-white/[0.05]"
      style={ctx.accentColor ? { borderColor: `${ctx.accentColor}28` } : undefined}
    >
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{
            backgroundColor: ctx.accentColor
              ? `${ctx.accentColor}1a`
              : 'rgba(103,232,249,0.10)',
          }}
        >
          {data.icon ?? '→'}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-karte-text">{data.title}</p>
        {data.body && (
          <p className="mt-0.5 line-clamp-1 text-[13px] leading-[1.45] text-karte-text-3">
            {data.body}
          </p>
        )}
      </div>
      <span
        aria-hidden="true"
        className="shrink-0 text-karte-text-4 transition-transform duration-200 group-hover:translate-x-0.5"
      >
        ↗
      </span>
    </a>
  ),
};

/**
 * `link-hero` — full-bleed showcase. High visual weight: the AI should
 * place at most one of these per row and ideally one per page. Requires
 * an image to look intentional; without one, AI should fall back to
 * `link-wide` or `link-square`.
 */
const heroVariant: WidgetVariant<LinkCardData> = {
  id: 'link-hero',
  resourceType: 'link',
  size: 'hero',
  budget: 'high',
  bestFor:
    'A single marquee link with a strong image. Use for a primary CTA, a launch page, or a single highlighted destination. Requires an image.',
  requires: ['title', 'url', 'imageUrl'],
  render: (data, ctx) => (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      data-track-type="link"
      data-track-id={data.id || data.url}
      data-track-label={data.title}
      className="group relative flex aspect-[16/9] w-full flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.08] transition-all duration-200 ease-[var(--karte-ease)] hover:-translate-y-0.5 hover:border-white/[0.20]"
      style={ctx.accentColor ? { borderColor: `${ctx.accentColor}28` } : undefined}
    >
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${ctx.accentColor || '#67e8f9'}30, transparent 60%)`,
          }}
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative flex items-end justify-between gap-4 p-6">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
            <span style={{ color: ctx.accentColor || '#67e8f9' }}>·</span>{' '}
            Featured
          </p>
          <p className="mt-2 text-2xl font-semibold leading-tight text-white">
            {data.title}
          </p>
          {data.body && (
            <p className="mt-1.5 line-clamp-2 max-w-md text-[14px] leading-[1.5] text-white/80">
              {data.body}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-2xl text-white/80 transition-transform duration-200 group-hover:translate-x-0.5"
        >
          ↗
        </span>
      </div>
    </a>
  ),
};

export const linkCardVariants: ReadonlyArray<WidgetVariant<LinkCardData>> = [
  lineVariant,
  squareVariant,
  wideVariant,
  heroVariant,
];

export const linkCardVariantsById = Object.freeze(
  Object.fromEntries(linkCardVariants.map((v) => [v.id, v])),
) as Readonly<Record<string, WidgetVariant<LinkCardData>>>;
