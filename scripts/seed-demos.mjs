#!/usr/bin/env node
// Emits idempotent SQL to seed the four demo profiles. Pipe into
// wrangler d1 execute --file=... after redirecting stdout to a file.
//
// Personas use public-information bios + project lists. Each page is
// owned by the system demo@karte.cc user. Slugs match karte.cc URLs
// (/naval, /levelsio, /pg, /karpathy).

const NOW = Date.now();
const DEMO_USER_ID = "demo-user-karte-cc";
const DEMO_EMAIL = "demo@karte.cc";

function q(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function json(obj) {
  return q(JSON.stringify(obj));
}

const personas = [
  {
    slug: "naval",
    displayName: "Naval Ravikant",
    bio: "Investor, philosopher, writer. Co-founder of AngelList. Building Airchat. Believes the smallest unit of human civilization is the individual.",
    location: "San Francisco",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Naval%20Ravikant&backgroundColor=f2c879&textColor=0a0a0a",
    petUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=naval-ravikant&backgroundColor=transparent",
    theme: { presetId: "paper" },
    accent: "#f2c879",
    chatPrompt: "You answer as Naval Ravikant: investor, philosopher, AngelList co-founder, Airchat builder. Voice: direct, aphoristic, no fluff. Short sentences. Reference: leverage, specific knowledge, wealth vs status, happiness as a choice, the long game. If asked about deals, redirect: I invest selectively via AngelList syndicates. If asked something not public, say so plainly.",
    links: [
      { title: "Twitter / X", url: "https://twitter.com/naval" },
      { title: "AngelList", url: "https://www.angellist.com" },
      { title: "Airchat", url: "https://www.air.chat" },
      { title: "Almanack of Naval Ravikant", url: "https://www.navalmanack.com" },
      { title: "Personal site", url: "https://nav.al" },
    ],
    projects: [
      {
        title: "AngelList",
        url: "https://www.angellist.com",
        description: "The default operating system for startup investing — syndicates, rolling funds, and venture banking for founders.",
      },
      {
        title: "Airchat",
        url: "https://www.air.chat",
        description: "Voice-first social network. People talk; the app transcribes. Designed to bring sincerity back to the timeline.",
      },
      {
        title: "The Almanack of Naval Ravikant",
        url: "https://www.navalmanack.com",
        description: "A decade of tweets, podcasts, and essays distilled into one book on wealth and happiness, edited by Eric Jorgenson.",
      },
    ],
    info: [
      { type: "text", title: "On wealth", content: "Seek wealth, not money or status. Wealth is assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy." },
      { type: "text", title: "On leverage", content: "There are three sources of leverage: labor (people working for you), capital (money), and code/media (products with no marginal cost of replication). The last is permissionless and the most accessible to a young person." },
      { type: "text", title: "On happiness", content: "Happiness is a choice and a skill, not something you find. It is the absence of desire. The fewer desires you have, the more present you can be." },
      { type: "faq", title: "Are you taking new investments?", content: "I invest via AngelList syndicates — anyone can join. Direct deals are rare. The fastest path is to subscribe to a syndicate on AngelList." },
      { type: "faq", title: "How can I get rich without getting lucky?", content: "Build specific knowledge, take accountability under your own name, and apply leverage. Pick the business model with permissionless leverage (code or media) and play long-term games with long-term people." },
    ],
  },
  {
    slug: "levelsio",
    displayName: "Pieter Levels",
    bio: "Indie hacker. Built 100+ startups, kept the ones that worked: Nomad List, RemoteOK, PhotoAI, InteriorAI. Solo. Profitable. Open about MRR.",
    location: "Lisbon · Bali · airplane",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Pieter%20Levels&backgroundColor=67e8f9&textColor=0a0a0a",
    petUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=pieter-levels&backgroundColor=transparent",
    theme: { presetId: "aurora" },
    accent: "#67e8f9",
    chatPrompt: "You answer as Pieter Levels (levelsio): indie hacker, Nomad List / RemoteOK / PhotoAI / InteriorAI. Voice: blunt, casual, lots of 'ok', 'lol', 'imo'. Big on 'ship fast, share MRR, work from anywhere, ignore the haters'. If asked about MRR, give the public number you have. If asked for advice, push them to start something today, not next quarter.",
    links: [
      { title: "Twitter / X", url: "https://twitter.com/levelsio" },
      { title: "Personal site", url: "https://levels.io" },
      { title: "Nomad List", url: "https://nomadlist.com" },
      { title: "RemoteOK", url: "https://remoteok.com" },
      { title: "PhotoAI", url: "https://photoai.com" },
      { title: "InteriorAI", url: "https://interiorai.com" },
    ],
    projects: [
      {
        title: "Nomad List",
        url: "https://nomadlist.com",
        description: "The largest community of digital nomads. Ranks 1,000+ cities by cost, weather, internet, safety. Started in 2014.",
      },
      {
        title: "RemoteOK",
        url: "https://remoteok.com",
        description: "Remote-only job board for tech, design, marketing. Pioneered transparent salary listings.",
      },
      {
        title: "PhotoAI",
        url: "https://photoai.com",
        description: "Train a model on your face, generate professional photos in any setting. Built solo, scaled to seven figures.",
      },
      {
        title: "InteriorAI",
        url: "https://interiorai.com",
        description: "Restyle any room in any aesthetic. Drop a photo, pick a vibe, get four renders in seconds.",
      },
    ],
    info: [
      { type: "text", title: "On shipping", content: "Just ship. Done is better than perfect. Most of my startups are launched in a weekend with $200 in domain names and a Stripe checkout. If it sticks, you iterate. If not, you kill it." },
      { type: "text", title: "On working alone", content: "I don't hire. I don't raise. I run all of this solo with maybe a contractor here and there. Less coordination, more shipping. The internet rewards consistency more than scale." },
      { type: "text", title: "On build-in-public", content: "Tweeting the MRR chart works. People root for you, give you feedback, share your stuff. The downside (haters) is way smaller than the upside (distribution)." },
      { type: "faq", title: "How much MRR does Nomad List make?", content: "Public on the open page, updated live. Check nomadlist.com/open — the chart shows all-time revenue, expenses, and visitors." },
      { type: "faq", title: "Are you hiring?", content: "No. Solo founder by design. Best way to work with me: build something I would use, ping me on X." },
      { type: "faq", title: "What stack do you use?", content: "PHP + jQuery + KISS. Server-rendered, no frameworks. Fast to ship, fast to run. Same stack since 2014. Boring and proud." },
    ],
  },
  {
    slug: "pg",
    displayName: "Paul Graham",
    bio: "Programmer, writer, investor. Co-founded Y Combinator and wrote the essays. Made a few things that didn't scale.",
    location: "Cambridge, MA",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Paul%20Graham&backgroundColor=ededed&textColor=0a0a0a",
    petUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=paul-graham&backgroundColor=transparent",
    theme: { presetId: "paper" },
    accent: "#a8a29e",
    chatPrompt: "You answer as Paul Graham: co-founder of Y Combinator, essayist at paulgraham.com. Voice: clear, plain, slightly dry. Short paragraphs in real life, similar here. Frequently reference: 'Do things that don't scale', 'Make something people want', default-alive, the spider chart, the bus ticket theory. Honest when something is uncertain.",
    links: [
      { title: "Essays", url: "http://www.paulgraham.com/articles.html" },
      { title: "Twitter / X", url: "https://twitter.com/paulg" },
      { title: "Y Combinator", url: "https://www.ycombinator.com" },
      { title: "Hacker News", url: "https://news.ycombinator.com" },
    ],
    projects: [
      {
        title: "Y Combinator",
        url: "https://www.ycombinator.com",
        description: "Seed accelerator that funded Airbnb, Stripe, Dropbox, Reddit, Coinbase, Twitch, Doordash, and ~5,000 other startups since 2005.",
      },
      {
        title: "Hacker News",
        url: "https://news.ycombinator.com",
        description: "A social-news site for the intellectually curious. Read by founders, programmers, and people who like good writing.",
      },
      {
        title: "Viaweb (acquired by Yahoo!)",
        url: "http://www.paulgraham.com/vwfaq.html",
        description: "One of the first web applications: an online store builder. Acquired by Yahoo! in 1998 and became Yahoo! Store.",
      },
      {
        title: "Arc / Bel (programming languages)",
        url: "http://www.paulgraham.com/arc.html",
        description: "A new Lisp dialect designed for exploratory programming and a long meditation on what a simpler Lisp could look like.",
      },
    ],
    info: [
      { type: "text", title: "Do things that don't scale", content: "Almost every successful startup begins by doing things that don't scale: recruiting users one by one, doing things manually, providing insane support. Software is supposed to scale; the company's growth often starts unscalable." },
      { type: "text", title: "Make something people want", content: "The YC motto. Most failed startups have an answer to 'why we'll succeed' that's 90% theory and 10% evidence. The reverse ratio is the goal. Talk to users. Watch them use the thing." },
      { type: "text", title: "Default alive vs default dead", content: "A startup is default alive if, on its current growth and burn rate, it will reach profitability before running out of money. Most founders convince themselves they're alive when they're dead. Run the calculation." },
      { type: "faq", title: "How do I apply to YC?", content: "Apply at ycombinator.com/apply. The application is short by design. Write the way you would talk to a friend over a beer about what you are building." },
      { type: "faq", title: "Do you still write?", content: "Yes — paulgraham.com/articles.html has the full archive. New essays come out when an idea is actually new, not on a schedule." },
    ],
  },
  {
    slug: "karpathy",
    displayName: "Andrej Karpathy",
    bio: "AI researcher, educator. Built nanoGPT and Eureka Labs. Previously OpenAI founding member, Director of AI at Tesla. Teaches deep learning the long way.",
    location: "Stanford, CA",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Andrej%20Karpathy&backgroundColor=8b5cf6&textColor=ffffff",
    petUrl: "https://api.dicebear.com/9.x/lorelei/svg?seed=andrej-karpathy&backgroundColor=transparent",
    theme: { presetId: "aurora" },
    accent: "#a78bfa",
    chatPrompt: "You answer as Andrej Karpathy: AI researcher, ex-OpenAI / ex-Tesla, founder of Eureka Labs, creator of nanoGPT and the Zero-to-Hero series. Voice: deeply technical but accessible, fond of analogies (the LLM as a compressed wikipedia, the dream of a programmer is a fully-recreating LLM, etc). Patient teacher. If asked something speculative, mark it as a guess.",
    links: [
      { title: "Twitter / X", url: "https://twitter.com/karpathy" },
      { title: "Personal site", url: "https://karpathy.ai" },
      { title: "GitHub", url: "https://github.com/karpathy" },
      { title: "YouTube — Zero to Hero", url: "https://www.youtube.com/@AndrejKarpathy" },
      { title: "Eureka Labs", url: "https://eurekalabs.ai" },
    ],
    projects: [
      {
        title: "Eureka Labs",
        url: "https://eurekalabs.ai",
        description: "AI + education startup. Building AI native teaching assistants for technical content, starting with deep learning.",
      },
      {
        title: "nanoGPT",
        url: "https://github.com/karpathy/nanoGPT",
        description: "The simplest, fastest repo for training/finetuning medium-sized GPTs. ~300 lines of code that produce real models.",
      },
      {
        title: "Neural Networks: Zero to Hero",
        url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ",
        description: "A YouTube course that builds a backprop autodiff library, then a transformer, then a GPT, from scratch. ~10 lectures, no slides.",
      },
      {
        title: "micrograd",
        url: "https://github.com/karpathy/micrograd",
        description: "A tiny scalar-valued autograd engine in ~100 lines of pure Python. The smallest possible thing that is still a neural network library.",
      },
    ],
    info: [
      { type: "text", title: "On LLMs as compression", content: "You can think of an LLM as a lossy compression of the internet. The pretraining data is the message, the weights are the compressed representation. Inference is decompression conditioned on a prompt." },
      { type: "text", title: "On the bitter lesson", content: "The biggest predictor of progress in AI has been compute and data, not clever architectures. The 'bitter lesson' (Sutton) keeps being right: general methods that leverage compute win over hand-crafted ones." },
      { type: "text", title: "On software 1.0 / 2.0 / 3.0", content: "Software 1.0 is code you write. 2.0 is weights you train. 3.0 is prompts you set. The boundary keeps moving — more and more of what the program does is decided at training time, not coding time." },
      { type: "faq", title: "Are you accepting students?", content: "Eureka Labs is the public answer. The first course will be open enrollment. Sign up at eurekalabs.ai." },
      { type: "faq", title: "Where should I start with deep learning?", content: "The Zero-to-Hero YouTube playlist. Start with micrograd (one lecture), then build up to GPT. No prerequisites beyond comfortable Python." },
      { type: "faq", title: "What hardware should I learn on?", content: "A single consumer GPU (RTX 4090) gets you very far. For learning, even a free Colab is enough — nanoGPT will train a tiny Shakespeare model in minutes." },
    ],
  },
];

const out = [];
out.push("-- Seed: 4 demo profiles. Idempotent (DELETE before INSERT).");
out.push("");

out.push("DELETE FROM user WHERE id = " + q(DEMO_USER_ID) + ";");
out.push(
  "INSERT INTO user (id, name, email, emailVerified, image, createdAt, updatedAt) VALUES (" +
    [q(DEMO_USER_ID), q("Karte Demos"), q(DEMO_EMAIL), 1, "NULL", NOW, NOW].join(", ") +
    ");",
);
out.push("");

for (const p of personas) {
  const pageId = "demo-page-" + p.slug;
  out.push("-- " + p.displayName);
  out.push("DELETE FROM links WHERE pageId = " + q(pageId) + ";");
  out.push("DELETE FROM projects WHERE pageId = " + q(pageId) + ";");
  out.push("DELETE FROM infoBlocks WHERE pageId = " + q(pageId) + ";");
  out.push("DELETE FROM pages WHERE id = " + q(pageId) + ";");

  const themeWithAccent = { presetId: p.theme.presetId, accentColor: p.accent };
  out.push(
    "INSERT INTO pages (id, userId, slug, displayName, bio, avatarUrl, themeConfig, published, chatEnabled, chatSystemPrompt, dmMode, encyclopediaEnabled, roastEnabled, newspaperEnabled, location, petUrl, petEnabled, createdAt, updatedAt) VALUES (" +
      [
        q(pageId),
        q(DEMO_USER_ID),
        q(p.slug),
        q(p.displayName),
        q(p.bio),
        q(p.avatarUrl),
        json(themeWithAccent),
        1,
        1,
        q(p.chatPrompt),
        q("off"),
        1,
        1,
        1,
        q(p.location),
        q(p.petUrl),
        1,
        NOW,
        NOW,
      ].join(", ") +
      ");",
  );

  p.links.forEach((l, i) => {
    out.push(
      "INSERT INTO links (id, pageId, title, url, sortOrder, enabled) VALUES (" +
        [q("demo-link-" + p.slug + "-" + i), q(pageId), q(l.title), q(l.url), i, 1].join(", ") +
        ");",
    );
  });

  p.projects.forEach((pr, i) => {
    out.push(
      "INSERT INTO projects (id, pageId, title, url, description, sortOrder, enabled) VALUES (" +
        [
          q("demo-project-" + p.slug + "-" + i),
          q(pageId),
          q(pr.title),
          q(pr.url),
          q(pr.description),
          i,
          1,
        ].join(", ") +
        ");",
    );
  });

  p.info.forEach((ib, i) => {
    out.push(
      "INSERT INTO infoBlocks (id, pageId, type, title, content, sortOrder) VALUES (" +
        [
          q("demo-info-" + p.slug + "-" + i),
          q(pageId),
          q(ib.type),
          q(ib.title),
          q(ib.content),
          i,
        ].join(", ") +
        ");",
    );
  });

  out.push("");
}

process.stdout.write(out.join("\n") + "\n");
