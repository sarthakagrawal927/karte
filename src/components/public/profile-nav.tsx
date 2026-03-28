'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type EnabledPages = {
  encyclopedia: boolean;
  roast: boolean;
  newspaper: boolean;
};

export function ProfileNav({
  slug,
  accentColor,
  enabledPages,
}: {
  slug: string;
  accentColor: string;
  enabledPages: EnabledPages;
}) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Profile', href: `/${slug}`, exact: true },
    ...(enabledPages.encyclopedia
      ? [{ label: 'Encyclopedia', href: `/${slug}/encyclopedia`, exact: false }]
      : []),
    ...(enabledPages.roast
      ? [{ label: 'Roast Me', href: `/${slug}/roast`, exact: false }]
      : []),
    ...(enabledPages.newspaper
      ? [{ label: 'Newspaper', href: `/${slug}/newspaper`, exact: false }]
      : []),
  ];

  // Don't show nav if only the profile tab exists
  if (tabs.length <= 1) return null;

  return (
    <nav className="mt-6 w-full">
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: `${accentColor}22`,
                      boxShadow: `0 0 20px ${accentColor}15`,
                      color: accentColor,
                    }
                  : undefined
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
