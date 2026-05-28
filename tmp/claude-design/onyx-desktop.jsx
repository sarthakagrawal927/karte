// ── ONYX (desktop) ───────────────────────────────────────────────────────
// Five luxe card-screens. Less stuff. More breathing.

function OnyxLanding() {
  return (
    <div className="onyx-deck">
      <style>{onyxCss}</style>

      <OnyxCard idx="i"   serial="№ 00471" kicker="DIGITAL CARD · CARD V2026"
                footL="karte.cc/yourhandle" footR="Free · 60-second import">
        <OnyxHero />
      </OnyxCard>

      <OnyxCard idx="ii"  serial="№ 00472" kicker="HOW IT WORKS · CARD II"
                footL="Three steps · one afternoon" footR="Scroll for next →">
        <OnyxHow />
      </OnyxCard>

      <OnyxCard idx="iii" serial="№ 00473" kicker="THE FLIP · CARD III"
                footL="One memory · four living surfaces" footR="Same sources">
        <OnyxSurfaces />
      </OnyxCard>

      <OnyxCard idx="iv"  serial="№ 00474" kicker="FOR THE AGENTS · CARD IV"
                footL="Issued to humans · &amp; to their agents" footR="karte.cc/agents">
        <OnyxAgents />
      </OnyxCard>

      <OnyxCard idx="v"   serial="№ 00475" kicker="CLAIM YOUR NAME · LAST CARD"
                footL="One link · four surfaces · free forever" footR="© MMXXVI · Karte">
        <OnyxCta />
      </OnyxCard>
    </div>
  );
}

// ── Card frame ────────────────────────────────────────────────────────────
function OnyxCard({ idx, serial, kicker, footL, footR, children }) {
  const ref = React.useRef(null);
  const [mx, setMx] = React.useState(50);
  const [my, setMy] = React.useState(50);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    setMx(((e.clientX - r.left) / r.width) * 100);
    setMy(((e.clientY - r.top) / r.height) * 100);
  };
  return (
    <div
      ref={ref}
      className="onyx-screen"
      onMouseMove={onMove}
      style={{ '--mx': `${mx}%`, '--my': `${my}%` }}
    >
      <div className="onyx-screen-sheen"></div>
      <div className="onyx-screen-foil"></div>
      <div className="onyx-screen-corner tl">◆</div>
      <div className="onyx-screen-corner tr">◆</div>
      <div className="onyx-screen-corner bl">◆</div>
      <div className="onyx-screen-corner br">◆</div>

      <header className="onyx-screen-head">
        <div className="onyx-screen-mark">
          <span className="onyx-screen-diamond">◆</span>
          <span className="onyx-screen-brand">Karte</span>
        </div>
        <div className="onyx-screen-kicker">{kicker}</div>
        <div className="onyx-screen-serial">{serial}</div>
      </header>

      <div className="onyx-screen-body">{children}</div>

      <footer className="onyx-screen-foot">
        <span dangerouslySetInnerHTML={{ __html: footL }}></span>
        <span className="onyx-screen-rule"></span>
        <span>{footR}</span>
      </footer>

      <div className="onyx-screen-idx">card {idx} / v</div>
    </div>
  );
}

// ── CARD I · Hero ────────────────────────────────────────────────────────
function OnyxHero() {
  return (
    <div className="onyx-hero">
      <div className="onyx-eyebrow">
        <span className="onyx-eyebrow-dot"></span>
        The link-in-bio, upgraded
      </div>
      <h1 className="onyx-hero-h1">
        Your link‑in‑bio,<br/>
        <em>that answers back.</em>
      </h1>
      <p className="onyx-hero-sub">
        Same one link. But this one knows what you'd say —
        and handles it in your voice, before it hits your inbox.
      </p>
      <div className="onyx-hero-actions">
        <button className="onyx-btn-primary">Claim your name <span>→</span></button>
        <button className="onyx-btn-ghost">See it live <span>↗</span></button>
      </div>
      <div className="onyx-hero-fine">
        Free · no card · 60-second import from Linktree, Beacons, or Bento.
      </div>
    </div>
  );
}

// ── CARD II · How ────────────────────────────────────────────────────────
function OnyxHow() {
  const steps = [
    { i: 'I',   t: 'Feed it your memory',  b: 'Links, projects, FAQs, voice, boundaries.' },
    { i: 'II',  t: 'Pick your modes',       b: 'Chat, Encyclopedia, Newspaper, Roast.' },
    { i: 'III', t: 'Share one link',        b: 'Same link, every visitor. The page does the talking.' },
  ];
  return (
    <div className="onyx-how">
      <div className="onyx-eyebrow center">·  HOW IT WORKS  ·</div>
      <h2 className="onyx-h2 center">Three steps. <em>One afternoon.</em></h2>
      <div className="onyx-how-grid">
        {steps.map((s) => (
          <div key={s.i} className="onyx-how-step">
            <div className="onyx-how-num">{s.i}</div>
            <div className="onyx-how-rule"></div>
            <div className="onyx-how-title">{s.t}</div>
            <div className="onyx-how-body">{s.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CARD III · Four surfaces (lean) ─────────────────────────────────────
function OnyxSurfaces() {
  const surfaces = [
    { i: 'i.',   t: 'Chat',         b: 'Your AI version, on call.' },
    { i: 'ii.',  t: 'Encyclopedia', b: 'The official record.' },
    { i: 'iii.', t: 'Newspaper',    b: 'Above the fold. Daily.' },
    { i: 'iv.',  t: 'Roast',        b: 'Built for screenshots.' },
  ];
  return (
    <div className="onyx-surfaces">
      <div className="onyx-eyebrow center">·  THE FLIP  ·</div>
      <h2 className="onyx-h2 center">One memory.<br/><em>Four living surfaces.</em></h2>
      <ol className="onyx-surfaces-list">
        {surfaces.map((s) => (
          <li key={s.i}>
            <span className="onyx-sf-i">{s.i}</span>
            <span className="onyx-sf-t">{s.t}</span>
            <span className="onyx-sf-dots"></span>
            <span className="onyx-sf-b">{s.b}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── CARD IV · For the agents, too ───────────────────────────────────────
function OnyxAgents() {
  return (
    <div className="onyx-agents">
      <div className="onyx-agents-left">
        <div className="onyx-eyebrow">·  ISSUED → ANY AGENT  ·</div>
        <h2 className="onyx-h2">
          For the agents,<br/>
          <em>too.</em>
        </h2>
        <p className="onyx-agents-p">
          Your agent has a rate, a stack, a set of boundaries.
          It should have a card, too. Karte issues one to any agent
          you put on the open web.
        </p>
        <div className="onyx-agents-actions">
          <button className="onyx-btn-primary">Issue an agent card <span>→</span></button>
        </div>
      </div>
      <div className="onyx-agents-right">
        <div className="onyx-agent-mini">
          <div className="onyx-agent-mini-foil"></div>
          <div className="onyx-agent-mini-top">
            <span>AGENT EDITION</span>
            <span>№ a-0042</span>
          </div>
          <div className="onyx-agent-mini-mid">
            <div className="onyx-agent-mini-avatar">○</div>
            <div className="onyx-agent-mini-name">Atlas·4</div>
            <div className="onyx-agent-mini-rule"></div>
            <div className="onyx-agent-mini-role"><em>Coding agent · on call</em></div>
          </div>
          <div className="onyx-agent-spec">
            <div><b>rate</b><span>$0.12 / call</span></div>
            <div><b>stack</b><span>TS · Rust · Postgres</span></div>
            <div><b>scopes</b><span>read · propose · ship (with review)</span></div>
          </div>
          <div className="onyx-agent-mini-bot">
            <span>karte.cc / atlas</span>
            <span>ISSUED → AGENT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CARD V · CTA ────────────────────────────────────────────────────────
function OnyxCta() {
  const [slug, setSlug] = React.useState('yourname');
  return (
    <div className="onyx-cta">
      <div className="onyx-eyebrow center">·  CLAIM YOUR NAME  ·</div>
      <h2 className="onyx-cta-h">
        Build the profile<br/>
        <em>they talk to.</em>
      </h2>
      <p className="onyx-cta-sub">
        One link. Four surfaces. Conversations that travel. Free forever.
      </p>
      <div className="onyx-cta-form">
        <span className="onyx-cta-prefix">karte.cc /</span>
        <input
          className="onyx-cta-input"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
        />
        <button className="onyx-btn-primary">Claim <span>→</span></button>
      </div>
      <div className="onyx-cta-fine">
        Free · no card · 60-second import.
      </div>
    </div>
  );
}

// ── styles ──────────────────────────────────────────────────────────────
const onyxCss = `
.onyx-deck { width: 100%; background: #0a0805; color: #e8dfca; font-family: "Inter", system-ui, sans-serif; display: flex; flex-direction: column; }

/* Every section is a card */
.onyx-screen {
  position: relative; width: 100%; height: 820px;
  padding: 56px 72px; box-sizing: border-box;
  background: radial-gradient(120% 80% at 50% 0%, #1c1813 0%, #0d0a07 55%, #050403 100%);
  border-bottom: 1px solid rgba(196,164,107,0.08);
  display: flex; flex-direction: column; overflow: hidden;
}
.onyx-screen-sheen {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.55;
  background: radial-gradient(420px 480px at var(--mx,50%) var(--my,50%),
    rgba(255,225,170,0.14) 0%, rgba(255,225,170,0) 65%);
  mix-blend-mode: screen;
}
.onyx-screen-foil {
  position: absolute; inset: 26px; pointer-events: none; border-radius: 4px;
  background: linear-gradient(135deg, rgba(196,164,107,0.55), rgba(255,225,170,0.06) 30%, rgba(255,225,170,0.06) 70%, rgba(196,164,107,0.55)) border-box;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  border: 0.75px solid transparent;
}
.onyx-screen::after {
  content: ''; position: absolute; inset: 30px; pointer-events: none;
  border: 1px solid rgba(196,164,107,0.1); border-radius: 2px;
}
.onyx-screen-corner { position: absolute; color: #c4a46b; font-size: 12px; opacity: 0.9; }
.onyx-screen-corner.tl { top: 38px; left: 38px; }
.onyx-screen-corner.tr { top: 38px; right: 38px; }
.onyx-screen-corner.bl { bottom: 38px; left: 38px; }
.onyx-screen-corner.br { bottom: 38px; right: 38px; }

.onyx-screen-head {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px;
  padding: 0 30px 22px; border-bottom: 1px dotted rgba(196,164,107,0.22);
  position: relative; z-index: 2;
}
.onyx-screen-mark { display: flex; align-items: baseline; gap: 10px; }
.onyx-screen-diamond { color: #c4a46b; font-size: 12px; }
.onyx-screen-brand { font-family: "Playfair Display", serif; font-size: 22px; letter-spacing: 0.02em; color: #f0e6cf; }
.onyx-screen-kicker { text-align: center; font-size: 10px; letter-spacing: 0.32em; color: #c4a46b; }
.onyx-screen-serial { text-align: right; font-family: "Playfair Display", serif; font-style: italic; font-size: 15px; color: rgba(232,223,202,0.6); }

.onyx-screen-body { flex: 1; position: relative; z-index: 2; padding: 40px 30px 20px; display: flex; flex-direction: column; justify-content: center; }

.onyx-screen-foot {
  display: flex; align-items: center; gap: 18px;
  padding: 18px 30px 0; border-top: 1px dotted rgba(196,164,107,0.22);
  font-size: 10px; letter-spacing: 0.26em; color: rgba(196,164,107,0.7);
  text-transform: uppercase; position: relative; z-index: 2;
}
.onyx-screen-rule { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(196,164,107,0.25), transparent, rgba(196,164,107,0.25)); }
.onyx-screen-idx {
  position: absolute; bottom: 56px; right: 78px; z-index: 3;
  font-family: "Playfair Display", serif; font-style: italic; font-size: 11px;
  color: rgba(196,164,107,0.45); letter-spacing: 0.08em;
}

/* Shared type & buttons */
.onyx-eyebrow { font-size: 11px; letter-spacing: 0.32em; color: #c4a46b; display: inline-flex; align-items: center; gap: 10px; }
.onyx-eyebrow.center { text-align: center; justify-content: center; }
.onyx-eyebrow-dot { width: 5px; height: 5px; background: #c4a46b; transform: rotate(45deg); }
.onyx-h2 {
  font-family: "Playfair Display", serif; font-weight: 500;
  font-size: 76px; line-height: 1.02; letter-spacing: -0.02em;
  margin: 14px 0 24px; color: #f4ebd4;
}
.onyx-h2.center { text-align: center; }
.onyx-h2 em { font-style: italic; color: #c4a46b; font-weight: 400; }

.onyx-btn-primary {
  appearance: none; border: 0; cursor: pointer;
  background: linear-gradient(180deg, #e2c081 0%, #b8924f 100%);
  color: #1a1206; padding: 16px 28px; border-radius: 999px;
  font: 500 12px/1 "Inter", sans-serif; letter-spacing: 0.14em; text-transform: uppercase;
  box-shadow: 0 1px 0 rgba(255,230,180,0.6) inset, 0 16px 30px rgba(160,120,40,0.18);
  display: inline-flex; align-items: center; gap: 12px;
}
.onyx-btn-primary span { opacity: 0.7; }
.onyx-btn-ghost {
  appearance: none; cursor: pointer; background: transparent; color: #e8dfca;
  border: 1px solid rgba(196,164,107,0.4); padding: 16px 24px; border-radius: 999px;
  font: 500 12px/1 "Inter", sans-serif; letter-spacing: 0.14em; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 10px;
}
.onyx-btn-ghost span { color: #c4a46b; }

/* ── CARD I — HERO ───────────────────────────────────────────────────── */
.onyx-hero { max-width: 920px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 28px; }
.onyx-hero-h1 {
  font-family: "Playfair Display", serif; font-weight: 500;
  font-size: 120px; line-height: 0.95; letter-spacing: -0.025em;
  margin: 6px 0 0; color: #f4ebd4;
}
.onyx-hero-h1 em {
  font-style: italic; font-weight: 400;
  background: linear-gradient(180deg, #f6e5b8 0%, #c4a46b 60%, #8a6b34 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.onyx-hero-sub { font-size: 20px; line-height: 1.55; max-width: 560px; color: rgba(232,223,202,0.78); margin: 0; }
.onyx-hero-actions { display: flex; gap: 14px; align-items: center; }
.onyx-hero-fine { font-size: 11px; letter-spacing: 0.16em; color: rgba(232,223,202,0.5); text-transform: uppercase; }

/* ── CARD II — HOW ───────────────────────────────────────────────────── */
.onyx-how { max-width: 1100px; margin: 0 auto; width: 100%; }
.onyx-how-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
  border-top: 1px dotted rgba(196,164,107,0.22);
  border-bottom: 1px dotted rgba(196,164,107,0.22);
  margin-top: 18px;
}
.onyx-how-step { padding: 56px 36px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; border-right: 1px dotted rgba(196,164,107,0.22); }
.onyx-how-step:last-child { border-right: 0; }
.onyx-how-num {
  font-family: "Playfair Display", serif; font-style: italic; font-size: 56px;
  background: linear-gradient(180deg, #f6e5b8 0%, #c4a46b 60%, #8a6b34 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.onyx-how-rule { width: 32px; height: 1px; background: rgba(196,164,107,0.5); }
.onyx-how-title { font-family: "Playfair Display", serif; font-size: 28px; color: #f0e6cf; }
.onyx-how-body { font-family: "Playfair Display", serif; font-style: italic; font-size: 16px; line-height: 1.5; color: rgba(232,223,202,0.7); max-width: 280px; }

/* ── CARD III — SURFACES (typographic list) ──────────────────────────── */
.onyx-surfaces { max-width: 900px; margin: 0 auto; width: 100%; }
.onyx-surfaces-list { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; }
.onyx-surfaces-list li {
  display: grid; grid-template-columns: 60px 240px 1fr 280px;
  align-items: baseline; gap: 24px; padding: 28px 0;
  border-top: 1px dotted rgba(196,164,107,0.22);
}
.onyx-surfaces-list li:last-child { border-bottom: 1px dotted rgba(196,164,107,0.22); }
.onyx-sf-i { font-family: "Playfair Display", serif; font-style: italic; font-size: 22px; color: #c4a46b; }
.onyx-sf-t { font-family: "Playfair Display", serif; font-size: 36px; color: #f0e6cf; line-height: 1; }
.onyx-sf-dots { border-bottom: 1px dotted rgba(196,164,107,0.4); height: 1px; transform: translateY(-6px); }
.onyx-sf-b { font-family: "Playfair Display", serif; font-style: italic; font-size: 18px; color: rgba(232,223,202,0.8); }

/* ── CARD IV — AGENTS ────────────────────────────────────────────────── */
.onyx-agents { max-width: 1180px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; }
.onyx-agents-left { display: flex; flex-direction: column; gap: 22px; }
.onyx-agents-p { font-size: 18px; line-height: 1.6; color: rgba(232,223,202,0.78); max-width: 460px; margin: 0; }
.onyx-agents-actions { display: flex; gap: 14px; align-items: center; margin-top: 6px; }
.onyx-agents-right { display: flex; justify-content: center; }

.onyx-agent-mini {
  position: relative; width: 380px; padding: 22px 22px 18px; border-radius: 5px;
  background: linear-gradient(140deg, #11161a 0%, #070a0c 60%, #03050a 100%);
  border: 1px solid rgba(140,180,210,0.25);
  box-shadow: 0 40px 60px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.4);
  display: flex; flex-direction: column; gap: 14px; overflow: hidden;
}
.onyx-agent-mini-foil {
  position: absolute; inset: 12px; pointer-events: none; border-radius: 3px;
  background: linear-gradient(135deg, rgba(140,180,210,0.55), rgba(220,235,250,0.08) 30%, rgba(220,235,250,0.08) 70%, rgba(140,180,210,0.55)) border-box;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  border: 0.5px solid transparent;
}
.onyx-agent-mini-top, .onyx-agent-mini-bot {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 0.26em;
  color: rgba(168,200,220,0.7); text-transform: uppercase;
}
.onyx-agent-mini-bot { padding-top: 10px; border-top: 0.5px dotted rgba(140,180,210,0.2); }
.onyx-agent-mini-mid { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 0 6px; }
.onyx-agent-mini-avatar {
  width: 56px; height: 56px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 30% 30%, #e8f0ff, #88aacc 55%, #2a4060);
  color: #0a121c; font: 300 30px/1 "Inter", sans-serif;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
.onyx-agent-mini-name {
  font-family: "Playfair Display", serif; font-size: 30px; line-height: 1;
  background: linear-gradient(180deg, #d8e6ff 0%, #88aacc 55%, #345a7a 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.onyx-agent-mini-rule { width: 40px; height: 1px; background: linear-gradient(90deg, transparent, rgba(140,180,210,0.7), transparent); }
.onyx-agent-mini-role { font-family: "Playfair Display", serif; font-style: italic; font-size: 13px; color: rgba(232,236,245,0.75); }
.onyx-agent-spec {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; gap: 6px;
  padding: 14px 16px; border: 0.5px solid rgba(140,180,210,0.22); border-radius: 3px;
  background: rgba(140,180,210,0.04);
}
.onyx-agent-spec > div { display: grid; grid-template-columns: 64px 1fr; align-items: baseline; gap: 8px; }
.onyx-agent-spec b { font-family: "JetBrains Mono", "Menlo", monospace; font-weight: 400; font-size: 9px; letter-spacing: 0.22em; color: rgba(168,200,220,0.65); text-transform: uppercase; }
.onyx-agent-spec span { font-family: "Playfair Display", serif; font-size: 13px; color: rgba(232,236,245,0.85); line-height: 1.3; }

/* ── CARD V — CTA ────────────────────────────────────────────────────── */
.onyx-cta { max-width: 880px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 22px; }
.onyx-cta-h {
  font-family: "Playfair Display", serif; font-weight: 500;
  font-size: 128px; line-height: 0.95; letter-spacing: -0.025em;
  margin: 6px 0 4px; color: #f4ebd4;
}
.onyx-cta-h em {
  font-style: italic; font-weight: 400;
  background: linear-gradient(180deg, #f6e5b8 0%, #c4a46b 60%, #8a6b34 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.onyx-cta-sub { font-size: 19px; line-height: 1.5; color: rgba(232,223,202,0.74); max-width: 540px; margin: 0 0 6px; }
.onyx-cta-form {
  display: flex; align-items: center; gap: 0; background: rgba(196,164,107,0.06);
  border: 1px solid rgba(196,164,107,0.28); border-radius: 999px; padding: 8px 8px 8px 26px;
}
.onyx-cta-prefix { font-family: "Playfair Display", serif; font-size: 18px; color: rgba(232,223,202,0.65); }
.onyx-cta-input {
  appearance: none; background: transparent; border: 0; outline: none;
  color: #f4ebd4; font-family: "Playfair Display", serif; font-style: italic;
  font-size: 22px; padding: 14px 18px 14px 4px; width: 240px;
}
.onyx-cta-fine { font-size: 11px; letter-spacing: 0.16em; color: rgba(232,223,202,0.45); text-transform: uppercase; }
`;

Object.assign(window, { OnyxLanding });
