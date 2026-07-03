const FAQ_ENTRIES: { question: string; answer: string }[] = [
  {
    question: 'What is Karte?',
    answer:
      'Karte is a link-in-bio platform with AI-enhanced profile modes. It offers chat, encyclopedia, roast, and newspaper modes that transform how visitors interact with your profile. Built on Next.js 16 and deployed on Cloudflare Workers, Karte turns a single page into a conversational digital calling card.',
  },
  {
    question: 'Is Karte free?',
    answer:
      'Karte offers a free tier with core link-in-bio features including links, projects, and bio sections. AI-enhanced modes — chat, encyclopedia, roast, and newspaper — become available once you configure an AI provider key in the dashboard. Custom domains and analytics are included at no cost.',
  },
  {
    question: 'What AI modes does Karte offer?',
    answer:
      'Karte offers four AI-enhanced modes: chat lets visitors converse with your profile, encyclopedia generates a knowledge entry about you, roast delivers a humorous AI critique, and newspaper reformats your profile as a news article. Each mode is generated from your profile infoBlocks and cached for fast reuse.',
  },
  {
    question: 'How is Karte different from Linktree?',
    answer:
      'Karte adds AI-enhanced interactive modes on top of standard link-in-bio features. Beyond listing links, visitors can chat with profiles, read AI-generated encyclopedic entries, or see profiles reformatted as newspaper articles. Karte also includes first-party analytics and custom domains, deployed on Cloudflare Workers.',
  },
  {
    question: 'Does Karte support analytics?',
    answer:
      'Yes. Karte includes visitor analytics with anonymous tracking via a first-party cookie and localStorage. Page views and events are recorded through the dashboard, letting you see traffic without third-party scripts. Visitor identity stays stable across sessions using a two-year cookie and a localStorage fallback.',
  },
  {
    question: 'Can I use Karte with my own domain?',
    answer:
      'Yes. Karte deploys on Cloudflare Workers and supports custom domains. Each profile gets a public slug-based URL like karte.cc/yourhandle, and you can point your own domain at your profile. Profiles are server-rendered for fast load times and SEO indexing.',
  },
  {
    question: 'What tech stack does Karte use?',
    answer:
      'Karte uses Next.js 16 with the App Router and React Compiler, deployed on Cloudflare Workers via OpenNext. App data lives in Turso (libSQL) through Drizzle ORM, auth uses better-auth with Google OAuth backed by Cloudflare D1, and images are stored in Cloudflare R2.',
  },
];

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ENTRIES.map((entry) => ({
    '@type': 'Question',
    name: entry.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: entry.answer,
    },
  })),
};

/**
 * FAQ section for the Karte landing page.
 *
 * Added for Generative Engine Optimization (GEO): AI search engines
 * lift 35-60 word factual passages, so each answer is self-contained
 * and within that range. Rendered outside the scroll-snap Onyx deck so
 * the existing card indices (card i / vi) are untouched. Styled to
 * match the Onyx dark + gold-foil theme.
 */
export function OnyxFaq() {
  return (
    <section className="onyx-faq" aria-label="Frequently asked questions">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <div className="onyx-faq-inner">
        <p className="onyx-eyebrow center">
          <span className="onyx-eyebrow-dot" aria-hidden="true" />
          FAQ · CARD VII
        </p>
        <h2 className="onyx-h2 center">
          Questions, <em>answered</em>
        </h2>
        <ol className="onyx-faq-list">
          {FAQ_ENTRIES.map((entry) => (
            <li key={entry.question} className="onyx-faq-item">
              <h3 className="onyx-faq-q">{entry.question}</h3>
              <p className="onyx-faq-a">{entry.answer}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
