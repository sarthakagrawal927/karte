'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ProfileAvatarProps {
  src: string | null;
  alt: string;
  initials: string;
  accentColor: string;
}

/**
 * Hero-sized profile avatar with a graceful fallback to gradient +
 * initials when the source URL fails to load.
 *
 * Why this exists: the third-party avatar host (DiceBear) has been
 * intermittently unreachable in the wild. next/image silently breaks
 * when its source 404s; that leaves a broken-image slot on the
 * hero — the most-seen surface on the profile. With this wrapper we
 * preload via `new Image()` and only mount the real <Image> once
 * we've confirmed the bytes are available.
 *
 * Server-rendered initial state shows the gradient placeholder so
 * the first paint is never empty.
 */
export function ProfileAvatar({
  src,
  alt,
  initials,
  accentColor,
}: ProfileAvatarProps) {
  // Status starts at 'loading' so the gradient placeholder renders
  // immediately (server + client first paint). Image swaps in once
  // the off-DOM preload succeeds.
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error',
  );

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    setStatus('loading');

    let cancelled = false;
    const img = new window.Image();
    img.onload = () => !cancelled && setStatus('loaded');
    img.onerror = () => !cancelled && setStatus('error');
    img.src = src;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (status === 'loaded' && src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={128}
        height={128}
        sizes="128px"
        priority
        className="relative h-28 w-28 rounded-3xl object-cover ring-1 ring-white/[0.10] sm:h-32 sm:w-32"
      />
    );
  }

  // Gradient + initials fallback: shown while loading AND on error.
  return (
    <div
      aria-label={alt}
      className="relative flex h-28 w-28 items-center justify-center rounded-3xl text-3xl font-semibold text-zinc-950 ring-1 ring-white/[0.10] sm:h-32 sm:w-32 sm:text-4xl"
      style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)`,
      }}
    >
      {initials}
    </div>
  );
}
