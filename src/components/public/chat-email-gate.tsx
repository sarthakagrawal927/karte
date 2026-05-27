'use client';

import { useRef,useState } from 'react';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

interface ChatEmailGateProps {
  displayName: string;
  accentColor: string;
  accentTextColor: string;
  onSubmit: (email: string) => void;
}

/**
 * Inline gate above the chat input. Renders before the visitor's first message
 * when no email has been captured yet. Email becomes a lead tied to the page
 * owner (persisted by the chat API when the conversation is created).
 *
 * Required. There is no skip — chat is a lead-capture surface.
 */
export function ChatEmailGate({
  displayName,
  accentColor,
  accentTextColor,
  onSubmit,
}: ChatEmailGateProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      setError('Drop your email to start the chat.');
      inputRef.current?.focus();
      return;
    }

    if (!EMAIL_RE.test(normalized) || normalized.length > 254) {
      setError('That email looks off — double-check and try again.');
      inputRef.current?.focus();
      return;
    }

    setError(null);
    onSubmit(normalized);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/25 bg-white/[0.04] px-4 py-4"
      aria-label="Email gate"
    >
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/60">
        One quick step
      </p>
      <p className="mb-3 text-sm leading-5 text-karte-text">
        Drop your email to start chatting.{' '}
        <span className="text-white/60">
          {displayName} will see who reached out.
        </span>
      </p>
      <div className="flex items-stretch gap-2">
        <input
          ref={inputRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
          placeholder="you@example.com"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'chat-email-gate-error' : undefined}
          className="min-w-0 flex-1 rounded-lg border border-white/30 bg-white/5 px-3 py-2.5 text-sm text-karte-text placeholder-white/40 outline-none ring-1 ring-white/15 transition focus:border-[#f2c879] focus:ring-2 focus:ring-[#f2c879]/40"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold transition hover:brightness-110 active:scale-95"
          style={{ backgroundColor: accentColor, color: accentTextColor }}
        >
          Continue
        </button>
      </div>
      {error && (
        <p
          id="chat-email-gate-error"
          role="alert"
          className="mt-2 text-xs text-red-300"
        >
          {error}
        </p>
      )}
      <p className="mt-2 text-[10px] leading-4 text-white/30">
        We use this once so {displayName} can follow up — no spam.
      </p>
    </form>
  );
}
