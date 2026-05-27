'use client';

export function LinkCard({
  id,
  title,
  url,
  icon,
  accentColor,
}: {
  id?: string;
  title: string;
  url: string;
  icon?: string | null;
  accentColor?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-track-type="link"
      data-track-id={id ?? url}
      data-track-label={title}
      className="group flex min-h-16 w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 py-4 text-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-white/[0.20] hover:bg-white/[0.05]"
      style={accentColor ? { borderColor: `${accentColor}28` } : undefined}
    >
      <span className="text-base font-semibold text-karte-text group-hover:text-white/90">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </span>
    </a>
  );
}
