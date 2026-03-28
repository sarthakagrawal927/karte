'use client';

import { useState, useRef, useCallback } from 'react';
import type { RoastContent } from '@/lib/generated-page-types';
import { RoastScoreCard } from './roast-score-card';
import { RoastSection } from './roast-section';
import { ShareCard } from './share-card';

interface RoastPageClientProps {
  slug: string;
  pageId: string;
  displayName: string;
  accentColor: string;
  existingRoast: RoastContent | null;
  linkTitles: string[];
  projectTitles: string[];
}

export function RoastPageClient({
  slug,
  pageId,
  displayName,
  accentColor,
  existingRoast,
  linkTitles,
  projectTitles,
}: RoastPageClientProps) {
  const [roast, setRoast] = useState<RoastContent | null>(existingRoast);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pages/${pageId}/generate/roast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkTitles, projectTitles }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate roast');
      }
      const data: RoastContent = await res.json();
      setRoast(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [pageId, linkTitles, projectTitles]);

  const handleDownload = useCallback(async () => {
    if (!shareCardRef.current) return;
    const { toPng } = await import('html-to-image');
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        pixelRatio: 2,
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `${slug}-roast.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // silently fail
    }
  }, [slug]);

  const handleShareX = useCallback(() => {
    const url = `${window.location.origin}/${slug}/roast`;
    const text = `I just got roasted by AI on LinkChat. Vibe score: ${roast?.vibeScore}/100. Think you can handle it?`;
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  }, [slug, roast?.vibeScore]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/${slug}/roast`;
    await navigator.clipboard.writeText(url);
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-8">
        <div className="text-center space-y-6">
          <div className="text-6xl animate-spin inline-block">🔥</div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Roasting {displayName}...
            </h2>
            <p className="text-sm text-gray-500">This might take a moment. The AI is crafting the perfect burns.</p>
          </div>
          <div className="max-w-sm mx-auto space-y-3">
            <div className="h-4 rounded-full bg-white/5 animate-pulse" />
            <div className="h-4 rounded-full bg-white/5 animate-pulse w-4/5" />
            <div className="h-4 rounded-full bg-white/5 animate-pulse w-3/5" />
          </div>
        </div>
      </div>
    );
  }

  // No roast yet - show generate prompt
  if (!roast) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-8">
        <div className="border border-white/10 bg-white/5 rounded-2xl backdrop-blur-xl p-8 sm:p-12 max-w-md w-full text-center space-y-6">
          <div className="text-6xl">🔥</div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {displayName}&apos;s Roast
            </h1>
            <p className="text-gray-400">Ready to get roasted?</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: accentColor }}
          >
            Generate Roast
          </button>

          <p className="text-xs text-gray-600">
            AI-generated humor. Don&apos;t take it personally.
          </p>
        </div>
      </div>
    );
  }

  // Roast display
  return (
    <div className="w-full text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-8">
        {/* Headline */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            🔥 The Roast of{' '}
            <span style={{ color: accentColor }}>{displayName}</span>{' '}
            🔥
          </h1>
          <p
            className="text-sm font-medium px-3 py-1 rounded-full inline-block"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}
          >
            {roast.personalityType}
          </p>
        </div>

        {/* Vibe Score */}
        <RoastScoreCard vibeScore={roast.vibeScore} accentColor={accentColor} />

        {/* Main roast */}
        <div className="border border-white/10 bg-white/5 rounded-2xl backdrop-blur-xl p-6">
          <p className="text-gray-300 leading-relaxed italic text-base sm:text-lg">
            &ldquo;{roast.roast}&rdquo;
          </p>
        </div>

        {/* Section grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RoastSection
            emoji="🚩"
            title="Red Flags"
            content={roast.redFlags}
            accentColor={accentColor}
          />
          <RoastSection
            emoji="🏆"
            title="Best Link"
            content={`${roast.bestLink.title} — ${roast.bestLink.reason}`}
            accentColor={accentColor}
          />
          <RoastSection
            emoji="💀"
            title="Worst Link"
            content={`${roast.worstLink.title} — ${roast.worstLink.reason}`}
            accentColor={accentColor}
          />
          <RoastSection
            emoji="📱"
            title="Spirit Platform"
            content={roast.spiritPlatform}
            accentColor={accentColor}
          />
          <RoastSection
            emoji="⭐"
            title="Celebrity Match"
            content={roast.celebrityMatch}
            accentColor={accentColor}
          />
          <RoastSection
            emoji="🔬"
            title="Bio Autopsy"
            content={roast.bioAutopsy}
            accentColor={accentColor}
          />
          <RoastSection
            emoji="👀"
            title="First Impression"
            content={roast.firstImpression}
            accentColor={accentColor}
          />
        </div>

        {/* Share controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Card
          </button>
          <button
            onClick={handleShareX}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: accentColor, color: '#000' }}
          >
            Share on X
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy Link
          </button>
        </div>

        {/* Hidden share card for download */}
        <div className="absolute -left-[9999px] top-0" aria-hidden="true">
          <ShareCard
            ref={shareCardRef}
            displayName={displayName}
            slug={slug}
            vibeScore={roast.vibeScore}
            personalityType={roast.personalityType}
            roastSummary={roast.roast}
            accentColor={accentColor}
          />
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-600 pt-4">
          AI-generated humor. Don&apos;t take it personally.
        </p>
      </div>
    </div>
  );
}
