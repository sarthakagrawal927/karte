import Image from 'next/image';

import { OpenChatButton } from '@/components/public/open-chat-button';

interface QuickAction {
  label: string;
  url: string;
  icon: string;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function calendarLabel(url: string) {
  const h = hostnameOf(url);
  if (h.includes('calendly')) return 'Book on Calendly';
  if (h.includes('cal.com')) return 'Book a call';
  if (h.includes('savvycal')) return 'Book on SavvyCal';
  return 'Book time';
}

function tipLabel(url: string) {
  const h = hostnameOf(url);
  if (h.includes('ko-fi')) return 'Tip on Ko-fi';
  if (h.includes('buymeacoffee')) return 'Buy me a coffee';
  if (h.includes('stripe')) return 'Send a tip';
  if (h.includes('patreon')) return 'Support on Patreon';
  return 'Send a tip';
}

/**
 * The big, sticky-on-desktop hero column. This is the part of the page
 * that stays fixed while content scrolls past on the right — it carries
 * the brand statement: avatar, name set as typographic mass, bio, and
 * the primary actions a visitor can take (chat / book / subscribe / tip).
 *
 * On mobile this just stacks above the content. Sticky behavior only
 * kicks in at lg+ where there's room for the two-column layout.
 */
export function ProfileHero({
  displayName,
  bio,
  avatarUrl,
  location,
  accentColor,
  serifFontVar,
  chatEnabled,
  hasMessenger,
  primaryChatCta,
  calendarUrl,
  newsletterUrl,
  tipUrl,
}: {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  accentColor: string;
  serifFontVar: string;
  chatEnabled: boolean;
  hasMessenger: boolean;
  primaryChatCta: string;
  calendarUrl: string | null;
  newsletterUrl: string | null;
  tipUrl: string | null;
}) {
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const restOfName = displayName.slice(firstName.length).trim();
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || firstName[0]?.toUpperCase() || 'K';

  const quickActions: QuickAction[] = [];
  if (calendarUrl) quickActions.push({ label: calendarLabel(calendarUrl), url: calendarUrl, icon: '📅' });
  if (newsletterUrl) quickActions.push({ label: 'Subscribe to newsletter', url: newsletterUrl, icon: '✉︎' });
  if (tipUrl) quickActions.push({ label: tipLabel(tipUrl), url: tipUrl, icon: '☕' });

  return (
    <aside className="relative lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-12 lg:pr-8">
      {/* Avatar */}
      <div className="flex items-start gap-5">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={120}
            height={120}
            sizes="(min-width: 1024px) 120px, 96px"
            priority
            className="h-24 w-24 shrink-0 rounded-3xl object-cover ring-1 ring-white/[0.08] sm:h-[120px] sm:w-[120px]"
          />
        ) : (
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl text-3xl font-semibold text-zinc-950 ring-1 ring-white/[0.08] sm:h-[120px] sm:w-[120px] sm:text-4xl"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)`,
            }}
          >
            {initials}
          </div>
        )}

        {location && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-karte-text-3">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {location}
          </div>
        )}
      </div>

      {/* Name — manifesto scale */}
      <h1
        className="mt-8 text-[44px] font-semibold leading-[0.95] tracking-[-0.03em] text-karte-text sm:text-[56px] lg:text-[64px]"
      >
        {firstName}
        {restOfName && (
          <>
            <br />
            <span
              className="font-normal italic text-karte-accent-soft"
              style={{ fontFamily: serifFontVar, color: accentColor }}
            >
              {restOfName}
            </span>
          </>
        )}
      </h1>

      {/* Bio */}
      {bio && (
        <p className="mt-6 max-w-md text-[15px] leading-[1.65] tracking-[-0.005em] text-karte-text-3 sm:text-base">
          {bio}
        </p>
      )}

      {/* Primary CTAs — stacked, not pills */}
      <div className="mt-8 flex flex-col gap-2.5">
        {hasMessenger && (
          <OpenChatButton
            mode={chatEnabled ? 'chat' : 'contact'}
            className="group inline-flex items-center justify-between rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-zinc-950 transition-all duration-200 ease-[var(--karte-ease)] hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: accentColor }}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">💬</span>
              {primaryChatCta}
            </span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-[var(--karte-ease)] group-hover:translate-x-0.5"
            >
              →
            </span>
          </OpenChatButton>
        )}

        {quickActions.map((action) => (
          <a
            key={action.url}
            href={action.url}
            target="_blank"
            rel="noopener noreferrer"
            data-track-type="quick-action"
            data-track-id={action.url}
            data-track-label={action.label}
            className="group inline-flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-[14px] font-medium text-karte-text transition-all duration-200 ease-[var(--karte-ease)] hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.05]"
            style={{ borderColor: `${accentColor}1f` }}
          >
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true" className="text-[15px]">
                {action.icon}
              </span>
              {action.label}
            </span>
            <span
              aria-hidden="true"
              className="text-karte-text-4 transition-transform duration-200 ease-[var(--karte-ease)] group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}
