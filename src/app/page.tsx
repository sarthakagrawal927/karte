import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { PublicTopBar } from '@/components/public/public-top-bar';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
});

const signalPills = ['Projects', 'AI chat', 'Themes', 'Sections', 'Analytics beta', 'Custom domains soon'];

const narrativeCards = [
  {
    eyebrow: 'Show the work',
    title: 'Put projects next to your links instead of hiding them three clicks away.',
    description:
      'Use link stacks for quick actions, then pull real portfolio pieces, social proof, and richer sections into the same page.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
  },
  {
    eyebrow: 'Answer faster',
    title: 'Let visitors ask the obvious questions without waiting for you to reply.',
    description:
      'LinkChat turns your memory blocks into a bottom-anchored assistant that handles the repeat questions while you stay focused.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    eyebrow: 'See what landed',
    title: 'Track attention from the same dashboard you use to update the page.',
    description:
      'Views, destination clicks, section impressions, and incoming leads are already wired into the product with no extra setup.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

const featureCards = [
  {
    title: 'Projects and links together',
    description:
      'Profiles are not limited to a dead list of buttons. Add portfolio cards with titles, descriptions, URLs, and images.',
  },
  {
    title: 'Themes that feel deliberate',
    description:
      'Start from curated presets, custom accents, and avatar styling so each page feels branded instead of template-flat.',
  },
  {
    title: 'Modular sections',
    description:
      'Drop in text, testimonial, CTA, contact, and social sections, then reorder everything without touching code.',
  },
  {
    title: 'Contact capture built in',
    description:
      'Turn profile visits into leads with contact forms that land directly in your dashboard inbox.',
  },
  {
    title: 'Native analytics',
    description:
      'See page views, top destinations, and section performance from the same product that powers the page.',
  },
  {
    title: 'Uploads and AI memory',
    description:
      'Upload avatars and project images to R2, then train the chat assistant with memory blocks that reflect your actual work.',
  },
];

const aiPageFeatures = [
  {
    eyebrow: 'Encyclopedia',
    title: 'A Wikipedia-style article about you',
    description:
      'AI reads your profile, projects, and memory blocks, then generates a full wiki article with infobox, table of contents, and citations. Share your story in the most credible format on the internet.',
    gradient: 'from-blue-400/20 to-cyan-400/20',
    accentText: 'text-blue-200/80',
    iconBg: 'bg-blue-400/15 border-blue-300/25',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    eyebrow: 'Roast Me',
    title: 'A brutally honest profile review',
    description:
      'Get an AI-generated roast of your profile with scores, category breakdowns, and shareable cards. Find out what a visitor really thinks within 5 seconds of landing on your page.',
    gradient: 'from-orange-400/20 to-red-400/20',
    accentText: 'text-orange-200/80',
    iconBg: 'bg-orange-400/15 border-orange-300/25',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    eyebrow: 'Newspaper',
    title: 'A front-page story starring you',
    description:
      'AI generates a newspaper front page with headlines, columns, and pull quotes drawn from your profile data. A memorable, shareable format that makes people stop scrolling.',
    gradient: 'from-amber-400/20 to-yellow-400/20',
    accentText: 'text-amber-200/80',
    iconBg: 'bg-amber-400/15 border-amber-300/25',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
];

const upcomingItems = [
  {
    title: 'Custom domains',
    description:
      'Connect a domain you already own and publish the same profile from your own hostname. Planned next.',
  },
  {
    title: 'Safer rollout path',
    description:
      'The implementation is being scoped around Vercel domain APIs, host-based routing, and proper request-level tests.',
  },
];

const launchSteps = [
  {
    step: '01',
    title: 'Start in preview mode',
    description:
      'Draft the page visually before signup. Shape the bio, theme, username idea, and page direction with zero friction.',
  },
  {
    step: '02',
    title: 'Claim the identity',
    description:
      'When the draft feels right, log in, claim the username, and publish the page as your public profile.',
  },
  {
    step: '03',
    title: 'Keep learning from traffic',
    description:
      'Add projects, update sections, review leads, and let analytics show what is actually earning attention.',
  },
];

const heroMetrics = [
  { label: 'Page views', value: '412' },
  { label: 'Project clicks', value: '38' },
  { label: 'Leads captured', value: '7' },
];

const themeSwatches = ['#7dd3fc', '#34d399', '#f59e0b', '#f97316'];

/* ---------- Shared glass card style ---------- */
const glassCard = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl';
const glassCardLg = 'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl';

function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/90">
        {eyebrow}
      </p>
      <h2 className={`${fraunces.className} mt-5 text-3xl tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]`}>
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
        {description}
      </p>
    </div>
  );
}

function HeroStudio() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* Glow effects */}
      <div className="absolute inset-x-6 top-6 h-48 rounded-full bg-cyan-400/15 blur-[96px]" />

      {/* Browser frame mockup */}
      <div className={`relative ${glassCardLg} overflow-hidden shadow-[0_48px_120px_-70px_rgba(34,211,238,0.5)]`}>
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-gray-950/80 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <div className="ml-2 flex-1 rounded-md bg-white/5 px-3 py-1">
            <span className="text-[11px] text-white/40">linkchat.com/sarthak</span>
          </div>
        </div>

        {/* Profile preview — minimal */}
        <div className="bg-gradient-to-b from-cyan-900/20 to-gray-950 p-6 sm:p-8">
          {/* Profile card */}
          <div className="mx-auto max-w-sm rounded-2xl border border-white/15 bg-white/8 p-6 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/25 bg-gradient-to-br from-cyan-300/25 to-emerald-300/10 text-lg font-semibold text-white">
              SA
            </div>
            <h3 className={`${fraunces.className} mt-3 text-xl text-white`}>Sarthak Agrawal</h3>
            <p className="mt-1.5 text-xs text-slate-400">Building software & sharing experiments</p>
          </div>

          {/* Links */}
          <div className="mx-auto mt-4 max-w-sm space-y-2">
            {['Portfolio', 'Blog', 'LinkedIn', 'GitHub'].map((item) => (
              <div key={item} className={`${glassCard} px-4 py-2.5 text-center text-sm font-medium text-white`}>
                {item}
              </div>
            ))}
          </div>

          {/* Tabs hint */}
          <div className="mx-auto mt-4 flex max-w-sm justify-center gap-2">
            {['Profile', 'Encyclopedia', 'Roast Me', 'Newspaper'].map((tab, i) => (
              <span
                key={tab}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ${
                  i === 0
                    ? 'bg-cyan-300/15 text-cyan-300'
                    : 'text-white/30'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.1),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(circle at center, black, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 70%)',
      }} />
      <div className="pointer-events-none absolute -left-40 top-16 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-20 top-[30%] h-[360px] w-[360px] rounded-full bg-amber-300/8 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-emerald-300/6 blur-[120px]" />

      <PublicTopBar current="home" accentColor="#67e8f9" />

      {/* ===== HERO ===== */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-12 sm:px-6 lg:px-8 lg:pb-32 lg:pt-16">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Preview before login
            </p>

            <h1 className={`${fraunces.className} mt-8 text-[2.75rem] leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl`}>
              <span className="text-white">Turn your link in bio into a </span>
              <span className="bg-gradient-to-r from-cyan-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                profile people can actually use.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
              LinkChat combines links, projects, modular sections, lead capture, analytics, and an AI chat assistant in one page. Start in draft mode, then claim the username only when the page feels ready.
            </p>

            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                href="/create"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 px-8 py-4 text-sm font-semibold text-gray-950 transition-all hover:shadow-[0_0_32px_rgba(103,232,249,0.4)]"
              >
                <span className="relative z-10">Start Your Profile</span>
              </Link>
              <Link
                href="#features"
                className={`inline-flex items-center justify-center ${glassCard} px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10`}
              >
                See What Ships Today
              </Link>
            </div>

            <p className="mt-5 text-sm text-white/35">
              Draft first. Sign in only when you want to save and claim the name.
            </p>

            <div className="mt-10 flex flex-wrap gap-2">
              {signalPills.map((pill) => (
                <span
                  key={pill}
                  className={`${glassCard} px-3 py-1.5 text-xs font-medium text-slate-300`}
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ['4 theme presets', 'Custom accents and image-backed pages'],
                ['5 section types', 'Proof, CTA, contact, testimonials, socials'],
                ['1 unified dashboard', 'Editing, leads, analytics, and AI memory'],
              ].map(([title, copy]) => (
                <div key={title} className={`${glassCardLg} p-5`}>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroStudio />
        </div>
      </section>

      {/* ===== NARRATIVE / WHY IT LANDS ===== */}
      <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why it lands"
          title="Not another dead-end profile page."
          description="The best link pages do more than route traffic. They give visitors enough proof, context, and ways to act that the next step feels obvious."
          centered
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {narrativeCards.map((card, index) => (
            <div
              key={card.title}
              className={`${glassCardLg} group p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_-30px_rgba(103,232,249,0.15)]`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
                    {card.icon}
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80">
                    {card.eyebrow}
                  </p>
                </div>
                <span className="text-xs text-white/25">0{index + 1}</span>
              </div>
              <h3 className={`${fraunces.className} mt-6 text-[1.375rem] leading-tight text-white`}>
                {card.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== AI-POWERED PAGES ===== */}
      <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="AI-Powered Pages"
          title="Three new ways to present your story."
          description="Every LinkChat profile can generate unique AI-powered pages. Turn your profile data into a Wikipedia article, a brutally honest roast, or a newspaper front page."
          centered
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {aiPageFeatures.map((feature) => (
            <div
              key={feature.title}
              className={`${glassCardLg} group relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
            >
              {/* Subtle gradient glow at the top of each card */}
              <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${feature.gradient} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${feature.iconBg} text-white`}>
                    {feature.icon}
                  </span>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${feature.accentText}`}>
                    {feature.eyebrow}
                  </p>
                </div>
                <h3 className={`${fraunces.className} mt-6 text-[1.375rem] leading-tight text-white`}>
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{feature.description}</p>
                <p className="mt-5 text-xs font-medium uppercase tracking-wider text-white/30">
                  Available on every profile
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRODUCT STACK / FEATURES ===== */}
      <section id="features" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Product Stack"
          title="Everything that ships with a serious profile page."
          description="The app covers the core pieces people keep stitching together with separate tools. The point is momentum, not more setup."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className={`${glassCardLg} p-6 transition-all duration-200 hover:border-white/20`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
                Included
              </p>
              <h3 className="mt-4 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Coming soon banner */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-amber-200/12 bg-gradient-to-r from-amber-300/8 via-white/[0.03] to-cyan-300/8 p-7 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200/80">
                Coming Soon
              </p>
              <h3 className={`${fraunces.className} mt-4 text-2xl text-white sm:text-3xl`}>
                Custom domains are next on the roadmap.
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                LinkChat already handles the page, analytics, inbox, and AI layer. The next step is letting people publish that same profile on their own domain.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:w-[520px]">
              {upcomingItems.map((item) => (
                <div
                  key={item.title}
                  className={`${glassCard} p-4`}
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section id="how-it-works" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <SectionHeader
            eyebrow="Workflow"
            title="Draft, claim, publish, improve."
            description="The onboarding is deliberately lighter than a traditional page builder. You can shape the page first and commit only when it looks right."
          />

          <div className="grid gap-5">
            {launchSteps.map((item) => (
              <div
                key={item.step}
                className={`${glassCardLg} p-6 transition-all duration-200 hover:border-white/20`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-semibold text-cyan-200">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className={`${glassCard} shrink-0 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40`}>
                    LinkChat flow
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PUBLIC + OPERATOR SURFACES ===== */}
      <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className={`${glassCardLg} p-7 sm:p-8`}>
            <SectionHeader
              eyebrow="Public Surface"
              title="What visitors see should already feel complete."
              description="The public page is designed to do real work on first visit instead of just redirecting people elsewhere."
            />
            <div className="mt-8 space-y-3">
              {[
                'A branded profile with links, projects, and modular sections',
                'A bottom-anchored AI chat that can answer from your memory blocks',
                'Contact capture without sending visitors through another app',
                'A layout that keeps working on mobile instead of collapsing into a cramped list',
              ].map((item) => (
                <div
                  key={item}
                  className={`${glassCard} px-4 py-3.5 text-sm leading-6 text-slate-300`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gray-950/70 p-7 backdrop-blur-xl sm:p-8">
            <SectionHeader
              eyebrow="Operator Surface"
              title="The dashboard keeps the profile easy to maintain."
              description="A useful personal page only stays useful if updating it is fast. Editing, analytics, uploads, and inbox workflows already live together."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'Guest draft preview before login',
                'Drag-and-drop ordering for links, projects, and sections',
                'R2-backed image uploads for avatars and project cards',
                'Leads inbox, analytics beta, and AI memory editing',
              ].map((item) => (
                <div
                  key={item}
                  className={`${glassCard} px-4 py-4 text-sm leading-6 text-slate-300`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative mx-auto max-w-5xl px-5 pb-28 pt-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/12 via-white/[0.04] to-amber-300/8 p-10 shadow-[0_60px_160px_-80px_rgba(103,232,249,0.5)] backdrop-blur-2xl sm:p-12">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/15 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-300/10 blur-[60px]" />

          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
              Ready to build
            </p>
            <h2 className={`${fraunces.className} mt-5 text-4xl tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]`}>
              Build the page people keep asking you for.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-300/90">
              Start with a live draft, publish when the page feels sharp, and give visitors more than a static pile of links.
            </p>
          </div>

          <div className="relative mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-gray-950 transition-all hover:bg-slate-100 hover:shadow-[0_0_32px_rgba(255,255,255,0.2)]"
            >
              Start Drafting
            </Link>
            <Link
              href="/login"
              className={`inline-flex items-center justify-center ${glassCard} px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10`}
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
