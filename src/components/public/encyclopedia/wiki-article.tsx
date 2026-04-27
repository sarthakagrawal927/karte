import sanitizeHtml from 'sanitize-html';
import type { EncyclopediaContent } from '@/lib/generated-page-types';
import { WikiInfobox } from './wiki-infobox';
import { WikiTocFromHtml } from './wiki-toc';

interface WikiArticleProps {
  content: EncyclopediaContent;
  displayName: string;
  avatarUrl: string | null;
  accentColor: string;
}

export function WikiArticle({ content, displayName, avatarUrl, accentColor }: WikiArticleProps) {
  return (
    <div
      className="mx-auto max-w-4xl px-4 py-6 sm:py-10"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#202122',
        backgroundColor: '#ffffff',
      }}
    >
      <article>
        {/* Article title */}
        <header className="mb-4 border-b border-[#a7d7f9] pb-2">
          <h1
            className="text-[28px] font-normal leading-tight sm:text-[32px]"
            style={{
              fontFamily: 'Linux Libertine, Georgia, "Times New Roman", serif',
              color: '#000000',
            }}
          >
            {displayName}
          </h1>
        </header>

        {/* Tagline */}
        <p
          className="mb-5 text-xs italic"
          style={{ fontFamily: 'sans-serif', color: '#54595d' }}
        >
          From LinkChat Encyclopedia, the free profile
        </p>

        {/* Infobox floated right (on desktop) */}
        <WikiInfobox
          infobox={content.infobox}
          displayName={displayName}
          avatarUrl={avatarUrl}
          accentColor={accentColor}
        />

        {/* Table of Contents (extracted from HTML headings) */}
        <WikiTocFromHtml html={content.markdown} accentColor={accentColor} />

        {/* Article body rendered from HTML — sanitized to prevent XSS */}
        <div
          className="wiki-prose clear-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.markdown) }}
        />

        {/* Categories */}
        {content.categories.length > 0 && (
          <footer className="mt-8 border border-dotted border-[#a2a9b1] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="mr-1 text-xs font-semibold"
                style={{ fontFamily: 'sans-serif', color: '#54595d' }}
              >
                Categories:
              </span>
              {content.categories.map((cat, i) => (
                <span
                  key={i}
                  className="text-xs"
                  style={{ fontFamily: 'sans-serif', color: '#3366cc' }}
                >
                  {cat}
                  {i < content.categories.length - 1 && (
                    <span className="ml-2 text-[#a2a9b1]">|</span>
                  )}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>
    </div>
  );
}
