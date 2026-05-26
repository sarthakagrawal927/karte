'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Links', href: '/dashboard/links' },
  { label: 'Projects', href: '/dashboard/projects' },
  { label: 'Profile Modes', href: '/dashboard/pages' },
  { label: 'AI Revamp', href: '/dashboard/revamp' },
  { label: 'AI Chat', href: '/dashboard/memory' },
  { label: 'Inbox', href: '/dashboard/inbox' },
  { label: 'Lead Radar', href: '/dashboard/leads' },
  { label: 'Analytics', href: '/dashboard/analytics' },
  { label: 'Experiments', href: '/dashboard/experiments' },
  { label: 'Chats', href: '/dashboard/chats' },
  { label: 'Blocks & Blogs', href: '/dashboard/sections' },
  { label: 'Appearance', href: '/dashboard/appearance' },
  { label: 'Domains', href: '/dashboard/domains' },
  { label: 'Encyclopedia', href: '/dashboard/encyclopedia' },
];

export function Sidebar({ slug }: { slug?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const activeItem = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const pageTitle = activeItem?.label ?? 'Dashboard';

  function renderNav({
    mobile = false,
    onNavigate,
  }: {
    mobile?: boolean;
    onNavigate?: () => void;
  }) {
    return (
      <>
        <nav className={`flex-1 space-y-0.5 ${mobile ? 'px-4 pb-4' : 'px-3'}`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`block rounded-lg px-3 py-2 text-[14px] font-medium transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {slug && (
          <div className={`border-t border-white/[0.06] ${mobile ? 'px-4 py-4' : 'px-3 py-4'}`}>
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px] font-medium text-zinc-200 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
            >
              View page
              <span className="text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-300">↗</span>
            </a>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-40 -mx-4 mb-6 border-b border-white/[0.06] bg-[#0a0a0a]/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
              <span className="text-cyan-300/80">·</span> Karte
            </p>
            <p className="truncate text-[15px] font-semibold tracking-[-0.005em] text-white">
              {pageTitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {slug && (
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.08] bg-transparent px-3 py-1.5 text-[12px] font-medium text-zinc-200 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/20 hover:bg-white/[0.04]"
              >
                View
              </a>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-full border border-white/[0.08] bg-transparent px-3 py-1.5 text-[12px] font-medium text-zinc-200 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/20 hover:bg-white/[0.04]"
              aria-label="Open dashboard menu"
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[85vw] max-w-xs flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <BrandMark />
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
                  Karte
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-zinc-200 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04]"
                aria-label="Close dashboard menu"
              >
                Close
              </button>
            </div>

            {renderNav({ mobile: true, onNavigate: () => setMobileOpen(false) })}
          </aside>
        </div>
      )}

      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0a] lg:flex">
        <div className="px-5 py-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90">
            <BrandMark />
            <span className="text-[16px] font-semibold tracking-[-0.01em] text-white">
              Karte
            </span>
          </Link>
        </div>

        {renderNav({})}
      </aside>
    </>
  );
}

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      className="h-[22px] w-[22px]"
    >
      <rect width="32" height="32" rx="7" fill="#0a0a0a" />
      <path
        d="M8 7 h16 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-9 l-4 4 v-4 h-3 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 4 -4 Z"
        fill="#67e8f9"
      />
      <circle cx="13" cy="15.5" r="1.25" fill="#0a0a0a" />
      <circle cx="16.5" cy="15.5" r="1.25" fill="#0a0a0a" />
      <circle cx="20" cy="15.5" r="1.25" fill="#0a0a0a" />
    </svg>
  );
}
