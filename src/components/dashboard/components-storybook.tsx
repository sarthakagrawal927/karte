'use client';

// Storybook-style preview of every AI-emittable component, with the
// sample props each render expects. Internal-only — accessed via
// /dashboard/components. Useful for sanity-checking the visual + for
// pasting screenshots into Slack when debugging the AI's picks.

import { useState } from 'react';

import {
  AskAgain,
  AvailabilityChip,
  BookCallSlot,
  EssayLink,
  HiringStatus,
  LocationCard,
  MetricCard,
  ProjectMini,
  QuoteBlock,
  RateCard,
  StackList,
  TimelineSlice,
} from '@/components/public/ai-components/registry';

const ACCENT_PRESETS: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Gold (default)', value: '#c4a46b' },
  { label: 'Cyan', value: '#67e8f9' },
  { label: 'Violet', value: '#a78bfa' },
  { label: 'Rose', value: '#fb7185' },
  { label: 'Emerald', value: '#34d399' },
];

interface StoryProps {
  name: string;
  notes?: string;
  children: React.ReactNode;
}

function Story({ name, notes, children }: StoryProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-karte-text-2">
          {name}
        </h2>
        {notes && (
          <p className="text-[11.5px] text-karte-text-4">{notes}</p>
        )}
      </header>
      <div className="rounded-xl bg-black/40 p-4">{children}</div>
    </section>
  );
}

export function ComponentsStorybook() {
  const [accent, setAccent] = useState(ACCENT_PRESETS[0].value);

  return (
    <div
      style={{ ['--karte-accent' as never]: accent } as React.CSSProperties}
    >
      {/* Accent picker */}
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-karte-text-4">
          Accent
        </span>
        {ACCENT_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setAccent(p.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition ${
              accent === p.value
                ? 'border-white/30 bg-white/[0.06] text-karte-text'
                : 'border-white/10 text-karte-text-3 hover:text-karte-text'
            }`}
          >
            <span
              aria-hidden="true"
              className="block h-3 w-3 rounded-full"
              style={{ backgroundColor: p.value }}
            />
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <Story name="AskAgain" notes="Follow-up question chips">
          <AskAgain
            suggestions={[
              "What's your stack?",
              'Are you hiring?',
              'Past clients?',
              "What's TinyGPT?",
            ]}
          />
        </Story>

        <Story name="AvailabilityChip" notes="Status pill — open / limited / closed">
          <div className="flex flex-wrap gap-3">
            <AvailabilityChip status="open" />
            <AvailabilityChip
              status="limited"
              label="One slot open in June"
            />
            <AvailabilityChip status="closed" label="Booked through Q3" />
          </div>
        </Story>

        <Story name="BookCallSlot" notes="Calendar CTA">
          <BookCallSlot
            url="https://cal.com/sarthak"
            label="Book a 20-min intro"
            duration="20 min"
          />
        </Story>

        <Story name="EssayLink" notes="Cite or recommend a post">
          <EssayLink
            title="How to Do Great Work"
            url="http://www.paulgraham.com/greatwork.html"
            excerpt="Choose a field you have a natural aptitude for, that interests you most, and offers the most scope to do great work."
            year="2023"
          />
        </Story>

        <Story name="HiringStatus" notes="What the owner is open to">
          <div className="flex flex-wrap gap-3">
            <HiringStatus status="open" />
            <HiringStatus status="fractional-only" />
            <HiringStatus status="advising-only" />
            <HiringStatus status="closed" />
          </div>
        </Story>

        <Story name="LocationCard" notes="City + tz + travel posture">
          <LocationCard
            city="Bangalore"
            timezone="GMT+5:30"
            travelStatus="Mostly Bangalore, in SF every Q2."
          />
        </Story>

        <Story name="MetricCard" notes="One big number">
          <MetricCard
            value="200k DAU"
            label="Real-time market pipeline scaled to"
            context="Front.Page, 2023"
          />
        </Story>

        <Story name="ProjectMini" notes="Single project, inline">
          <ProjectMini
            title="TinyGPT"
            description="0.8M-param transformer that trains and runs in the browser via PyTorch → WebAssembly + WebGPU."
            url="https://github.com/sarthakagrawal927/tinygpt"
            imageUrl={null}
          />
        </Story>

        <Story name="QuoteBlock" notes="Signature pull-quote">
          <QuoteBlock
            quote="It's the stuff around the happy path that matters — timeouts, retries, idempotency, downstream failures."
            attribution="Sarthak, on engineering"
          />
        </Story>

        <Story name="RateCard" notes="Pricing + booking">
          <RateCard
            tier="4-week shipping sprint"
            price="$18k"
            slots="One slot open in June"
            url="https://cal.com/sarthak"
            cta="Book June"
          />
        </Story>

        <Story name="StackList" notes="Tech / tool tokens">
          <StackList
            label="Backend"
            items={['Go', 'Node.js', 'Python', 'Kafka', 'Temporal', 'PostgreSQL', 'Redis', 'ClickHouse']}
          />
        </Story>

        <Story name="TimelineSlice" notes="N recent events, scoped">
          <TimelineSlice
            heading="Recent ships"
            events={[
              { when: 'May 2026', title: 'Released TinyGPT', where: undefined },
              { when: 'Feb 2026', title: 'Shipped free-ai', where: 'CF Workers' },
              { when: 'Nov 2025', title: 'Built CodeVetter', where: undefined },
              { when: 'Feb 2025', title: 'Joined VaultWealth', where: 'Peak XV' },
            ]}
          />
        </Story>
      </div>
    </div>
  );
}
