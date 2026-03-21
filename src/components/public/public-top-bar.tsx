import Image from 'next/image';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';

type PublicTopBarProps = {
  accentColor?: string;
  current?: 'home' | 'create' | 'login' | 'profile';
};

function getInitials(value: string | null | undefined) {
  return (
    value
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'LC'
  );
}

export async function PublicTopBar({
  accentColor = '#ffffff',
  current = 'home',
}: PublicTopBarProps) {
  const session = await auth();

  const userPage =
    session?.user?.id
      ? await db.query.pages.findFirst({
          where: eq(pages.userId, session.user.id),
          columns: { slug: true },
        })
      : null;

  return (
    <div className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
      <Link href="/" className="text-lg font-semibold text-white transition hover:text-white/80">
        LinkChat
      </Link>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {session?.user ? (
          <>
            {userPage?.slug && current !== 'profile' && (
              <Link
                href={`/${userPage.slug}`}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 sm:text-sm"
              >
                My Profile
              </Link>
            )}
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 sm:text-sm"
            >
              Dashboard
            </Link>
            <div
              className="flex items-center gap-2 rounded-full border px-2 py-1.5 text-white"
              style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}12` }}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'Account'}
                  width={28}
                  height={28}
                  sizes="28px"
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: `${accentColor}2a` }}
                >
                  {getInitials(session.user.name)}
                </div>
              )}
              <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                {session.user.name ?? 'Account'}
              </span>
            </div>
          </>
        ) : (
          <>
            {current !== 'create' && (
              <Link
                href="/create"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 sm:text-sm"
              >
                Start Profile
              </Link>
            )}
            {current !== 'login' && (
              <Link
                href="/login"
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-gray-100 sm:text-sm"
              >
                Log In
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
