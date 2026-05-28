// ── ONYX MOBILE ──────────────────────────────────────────────────────────
// Five cards, sized for a phone. Hero lives "above the fold" inside an iOS
// bezel; the rest of the deck flows below at phone width. Less per card.

function OnyxMobile() {
  return (
    <div className="onyx-m-stage">
      <style>{onyxMCss}</style>

      <div className="onyx-m-deviceWrap">
        <IOSDevice dark>
          <div className="onyx-m-deck">
            <MobileScreen
              idx="i"  serial="№ 00471"
              kicker="DIGITAL CARD"
              footL="karte.cc/yourhandle"
              footR="card i / v"
              fitDevice
            >
              <MobileHero />
            </MobileScreen>
          </div>
        </IOSDevice>
        <div className="onyx-m-caption">
          <span>·  Above the fold  ·</span>
          <em>Scroll continues below ↓</em>
        </div>
      </div>

      <div className="onyx-m-deck onyx-m-deck-full">
        <MobileScreen idx="ii"  serial="№ 00472" kicker="HOW IT WORKS"   footL="Three steps · one afternoon"   footR="card ii / v"><MobileHow /></MobileScreen>
        <MobileScreen idx="iii" serial="№ 00473" kicker="THE FLIP"        footL="One memory · four surfaces"     footR="card iii / v"><MobileSurfaces /></MobileScreen>
        <MobileScreen idx="iv"  serial="№ 00474" kicker="FOR THE AGENTS"  footL="Issued to humans &amp; agents" footR="card iv / v"><MobileAgents /></MobileScreen>
        <MobileScreen idx="v"   serial="№ 00475" kicker="CLAIM YOUR NAME" footL="One link · four surfaces"        footR="© MMXXVI"   ><MobileCta /></MobileScreen>
      </div>
    </div>
  );
}

// ── Mobile card frame ────────────────────────────────────────────────────
function MobileScreen({ idx, serial, kicker, footL, footR, children, fitDevice }) {
  return (
    <div className={`onyx-m-screen ${fitDevice ? 'is-fit' : ''}`}>
      <div className="onyx-m-foil"></div>
      <div className="onyx-m-corner tl">◆</div>
      <div className="onyx-m-corner tr">◆</div>
      <div className="onyx-m-corner bl">◆</div>
      <div className="onyx-m-corner br">◆</div>

      <header className="onyx-m-head">
        <div className="onyx-m-mark">
          <span className="onyx-m-diamond">◆</span>
          <span className="onyx-m-brand">Karte</span>
        </div>
        <div className="onyx-m-serial">{serial}</div>
      </header>
      <div className="onyx-m-kicker">{kicker}</div>

      <div className="onyx-m-body">{children}</div>

      <footer className="onyx-m-foot">
        <span dangerouslySetInnerHTML={{ __html: footL }}></span>
        <span className="onyx-m-rule"></span>
        <span>{footR}</span>
      </footer>
    </div>
  );
}

// ── i · Hero ─────────────────────────────────────────────────────────────
function MobileHero() {
  return (
    <div className="onyx-m-hero">
      <div className="onyx-m-eyebrow center">
        <span className="onyx-m-eyebrowDot"></span>
        The link‑in‑bio, upgraded
      </div>
      <h1 className="onyx-m-h1 center">
        Your link‑in‑bio,<br/>
        <em>that answers back.</em>
      </h1>
      <p className="onyx-m-sub center">
        Same one link. But this one knows what you'd say —
        &amp; handles it in your voice.
      </p>
      <div className="onyx-m-hero-actions">
        <button className="onyx-m-btn-primary onyx-m-btn-block">Claim your name <span>→</span></button>
        <button className="onyx-m-btn-ghost onyx-m-btn-block">See it live <span>↗</span></button>
      </div>
      <div className="onyx-m-hero-fine">
        Free · no card · 60-second import.
      </div>
    </div>
  );
}

// ── ii · How ─────────────────────────────────────────────────────────────
function MobileHow() {
  const steps = [
    { i: 'I',   t: 'Feed it your memory', b: 'Links, projects, FAQs, voice, boundaries.' },
    { i: 'II',  t: 'Pick your modes',     b: 'Chat, Encyclopedia, Newspaper, Roast.' },
    { i: 'III', t: 'Share one link',      b: 'Same link, every visitor. The page does the talking.' },
  ];
  return (
    <div className="onyx-m-how">
      <div className="onyx-m-eyebrow center">·  HOW IT WORKS  ·</div>
      <h2 className="onyx-m-h2 center">Three steps. <em>One afternoon.</em></h2>
      <div className="onyx-m-how-list">
        {steps.map((s) => (
          <div key={s.i} className="onyx-m-step">
            <div className="onyx-m-step-i">{s.i}</div>
            <div className="onyx-m-step-c">
              <div className="onyx-m-step-t">{s.t}</div>
              <div className="onyx-m-step-b">{s.b}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── iii · Surfaces ───────────────────────────────────────────────────────
function MobileSurfaces() {
  const surfaces = [
    { i: 'i.',   t: 'Chat',         b: 'Your AI version, on call.' },
    { i: 'ii.',  t: 'Encyclopedia', b: 'The official record.' },
    { i: 'iii.', t: 'Newspaper',    b: 'Above the fold. Daily.' },
    { i: 'iv.',  t: 'Roast',        b: 'Built for screenshots.' },
  ];
  return (
    <div className="onyx-m-surfaces">
      <div className="onyx-m-eyebrow center">·  THE FLIP  ·</div>
      <h2 className="onyx-m-h2 center">One memory.<br/><em>Four living surfaces.</em></h2>
      <ol className="onyx-m-surface-list">
        {surfaces.map((s) => (
          <li key={s.i}>
            <span className="onyx-m-sf-i">{s.i}</span>
            <span className="onyx-m-sf-t">{s.t}</span>
            <span className="onyx-m-sf-b">{s.b}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── iv · Agents ──────────────────────────────────────────────────────────
function MobileAgents() {
  return (
    <div className="onyx-m-agents">
      <div className="onyx-m-eyebrow center">·  ISSUED → ANY AGENT  ·</div>
      <h2 className="onyx-m-h2 center">For the agents, <em>too.</em></h2>
      <p className="onyx-m-p center">
        Your agent has a rate, a stack &amp; a set of boundaries.
        It should have a card, too.
      </p>

      <div className="onyx-m-agent-card">
        <div className="onyx-m-agent-foil"></div>
        <div className="onyx-m-agent-top">
          <span>AGENT EDITION</span>
          <span>№ a-0042</span>
        </div>
        <div className="onyx-m-agent-mid">
          <div className="onyx-m-agent-avatar">○</div>
          <div className="onyx-m-agent-name">Atlas·4</div>
          <div className="onyx-m-agent-rule"></div>
          <div className="onyx-m-agent-role"><em>Coding agent · on call</em></div>
        </div>
        <div className="onyx-m-agent-spec">
          <div><b>rate</b><span>$0.12 / call</span></div>
          <div><b>stack</b><span>TS · Rust · Postgres</span></div>
          <div><b>scopes</b><span>read · propose · ship</span></div>
        </div>
        <div className="onyx-m-agent-bot">karte.cc / atlas  ·  ISSUED → AGENT</div>
      </div>

      <button className="onyx-m-btn-primary onyx-m-btn-block">Issue an agent card <span>→</span></button>
    </div>
  );
}

// ── v · CTA ──────────────────────────────────────────────────────────────
function MobileCta() {
  const [slug, setSlug] = React.useState('yourname');
  return (
    <div className="onyx-m-cta">
      <div className="onyx-m-eyebrow center">·  CLAIM YOUR NAME  ·</div>
      <h2 className="onyx-m-cta-h">
        Build the profile<br/>
        <em>they talk to.</em>
      </h2>
      <p className="onyx-m-p center">
        One link. Four surfaces. Free forever.
      </p>
      <div className="onyx-m-cta-form">
        <span className="onyx-m-cta-prefix">karte.cc /</span>
        <input
          className="onyx-m-cta-input"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
        />
      </div>
      <button className="onyx-m-btn-primary onyx-m-btn-block">Claim my card <span>→</span></button>
      <div className="onyx-m-cta-fine">
        Free · no card · 60-second import.
      </div>
    </div>
  );
}

// ── styles ───────────────────────────────────────────────────────────────
const onyxMCss = `
.onyx-m-stage {
  width: 100%; background: #0a0805;
  font-family: "Inter", system-ui, sans-serif; color: #e8dfca;
  padding: 24px 0 40px;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}

.onyx-m-deviceWrap { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.onyx-m-caption { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 6px; }
.onyx-m-caption span { font-size: 9px; letter-spacing: 0.32em; color: #c4a46b; text-transform: uppercase; }
.onyx-m-caption em { font-family: "Playfair Display", serif; font-style: italic; font-size: 13px; color: rgba(232,223,202,0.55); }

.onyx-m-deck { width: 100%; display: flex; flex-direction: column; }
.onyx-m-deck-full { width: 402px; max-width: 402px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); border-radius: 6px; overflow: hidden; }

.onyx-m-screen {
  position: relative; width: 100%; min-height: 800px;
  padding: 28px 22px 22px; box-sizing: border-box;
  background: radial-gradient(120% 80% at 50% 0%, #1c1813 0%, #0d0a07 55%, #050403 100%);
  border-bottom: 1px solid rgba(196,164,107,0.1);
  display: flex; flex-direction: column; overflow: hidden;
}
.onyx-m-screen.is-fit { min-height: 0; height: 100%; border-bottom: 0; }
.onyx-m-foil {
  position: absolute; inset: 14px; pointer-events: none; border-radius: 3px;
  background: linear-gradient(135deg, rgba(196,164,107,0.55), rgba(255,225,170,0.06) 30%, rgba(255,225,170,0.06) 70%, rgba(196,164,107,0.55)) border-box;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  border: 0.75px solid transparent;
}
.onyx-m-screen::after { content: ''; position: absolute; inset: 17px; pointer-events: none; border: 1px solid rgba(196,164,107,0.1); border-radius: 2px; }
.onyx-m-corner { position: absolute; color: #c4a46b; font-size: 10px; opacity: 0.9; }
.onyx-m-corner.tl { top: 24px; left: 24px; }
.onyx-m-corner.tr { top: 24px; right: 24px; }
.onyx-m-corner.bl { bottom: 24px; left: 24px; }
.onyx-m-corner.br { bottom: 24px; right: 24px; }

.onyx-m-head { display: flex; align-items: baseline; justify-content: space-between; padding: 0 18px 8px; position: relative; z-index: 2; }
.onyx-m-mark { display: flex; align-items: baseline; gap: 6px; }
.onyx-m-diamond { color: #c4a46b; font-size: 9px; }
.onyx-m-brand { font-family: "Playfair Display", serif; font-size: 15px; color: #f0e6cf; letter-spacing: 0.02em; }
.onyx-m-serial { font-family: "Playfair Display", serif; font-style: italic; font-size: 11px; color: rgba(232,223,202,0.55); }
.onyx-m-kicker {
  position: relative; z-index: 2; text-align: center;
  font-size: 8px; letter-spacing: 0.3em; color: #c4a46b;
  padding: 0 18px 10px; border-bottom: 0.75px dotted rgba(196,164,107,0.22);
  margin-bottom: 20px;
}

.onyx-m-body { flex: 1; padding: 16px 14px 18px; position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; }

.onyx-m-foot {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 18px 0; border-top: 0.75px dotted rgba(196,164,107,0.22);
  font-size: 8px; letter-spacing: 0.22em; color: rgba(196,164,107,0.7);
  text-transform: uppercase; position: relative; z-index: 2;
}
.onyx-m-rule { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(196,164,107,0.25), transparent, rgba(196,164,107,0.25)); }

/* Type & buttons */
.onyx-m-eyebrow { font-size: 9px; letter-spacing: 0.3em; color: #c4a46b; }
.onyx-m-eyebrow.center { text-align: center; }
.onyx-m-eyebrowDot { display: inline-block; width: 4px; height: 4px; background: #c4a46b; transform: rotate(45deg); margin-right: 6px; vertical-align: middle; }
.onyx-m-h1 { font-family: "Playfair Display", serif; font-weight: 500; font-size: 46px; line-height: 0.98; letter-spacing: -0.02em; margin: 18px 0 16px; color: #f4ebd4; }
.onyx-m-h1.center { text-align: center; }
.onyx-m-h1 em { font-style: italic; font-weight: 400; background: linear-gradient(180deg, #f6e5b8, #c4a46b 60%, #8a6b34); -webkit-background-clip: text; background-clip: text; color: transparent; }
.onyx-m-h2 { font-family: "Playfair Display", serif; font-weight: 500; font-size: 34px; line-height: 1.0; letter-spacing: -0.015em; margin: 12px 0 22px; color: #f4ebd4; }
.onyx-m-h2.center { text-align: center; }
.onyx-m-h2 em { font-style: italic; color: #c4a46b; font-weight: 400; }
.onyx-m-p { font-size: 14px; line-height: 1.55; color: rgba(232,223,202,0.74); margin: 0 0 20px; }
.onyx-m-p.center { text-align: center; }
.onyx-m-sub { font-size: 15px; line-height: 1.55; color: rgba(232,223,202,0.78); margin: 0 0 18px; }
.onyx-m-sub.center { text-align: center; }

.onyx-m-btn-primary {
  appearance: none; border: 0; cursor: pointer;
  background: linear-gradient(180deg, #e2c081 0%, #b8924f 100%);
  color: #1a1206; padding: 14px 22px; border-radius: 999px;
  font: 500 11px/1 "Inter", sans-serif; letter-spacing: 0.16em; text-transform: uppercase;
  box-shadow: 0 1px 0 rgba(255,230,180,0.6) inset, 0 12px 22px rgba(160,120,40,0.2);
  display: inline-flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;
}
.onyx-m-btn-primary span { opacity: 0.7; }
.onyx-m-btn-primary.onyx-m-btn-block { width: 100%; }
.onyx-m-btn-ghost {
  appearance: none; cursor: pointer; background: transparent; color: #e8dfca;
  border: 1px solid rgba(196,164,107,0.4); padding: 14px 20px; border-radius: 999px;
  font: 500 11px/1 "Inter", sans-serif; letter-spacing: 0.16em; text-transform: uppercase;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
}
.onyx-m-btn-ghost span { color: #c4a46b; }
.onyx-m-btn-ghost.onyx-m-btn-block { width: 100%; }

/* i · Hero */
.onyx-m-hero { display: flex; flex-direction: column; gap: 4px; align-items: stretch; text-align: center; }
.onyx-m-hero-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.onyx-m-hero-fine { margin-top: 8px; font-size: 10px; letter-spacing: 0.16em; color: rgba(232,223,202,0.5); text-transform: uppercase; }

/* ii · How */
.onyx-m-how-list { display: flex; flex-direction: column; }
.onyx-m-step { display: grid; grid-template-columns: 48px 1fr; gap: 16px; align-items: baseline; padding: 22px 0; border-top: 0.75px dotted rgba(196,164,107,0.22); }
.onyx-m-step:last-child { border-bottom: 0.75px dotted rgba(196,164,107,0.22); }
.onyx-m-step-i { font-family: "Playfair Display", serif; font-style: italic; font-size: 32px; background: linear-gradient(180deg, #f6e5b8, #c4a46b 60%, #8a6b34); -webkit-background-clip: text; background-clip: text; color: transparent; }
.onyx-m-step-c { display: flex; flex-direction: column; gap: 4px; }
.onyx-m-step-t { font-family: "Playfair Display", serif; font-size: 20px; color: #f0e6cf; }
.onyx-m-step-b { font-family: "Playfair Display", serif; font-style: italic; font-size: 13px; line-height: 1.5; color: rgba(232,223,202,0.7); }

/* iii · Surfaces */
.onyx-m-surface-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.onyx-m-surface-list li {
  display: grid; grid-template-columns: 38px 1fr; align-items: baseline; gap: 14px;
  padding: 20px 0; border-top: 0.75px dotted rgba(196,164,107,0.22);
}
.onyx-m-surface-list li:last-child { border-bottom: 0.75px dotted rgba(196,164,107,0.22); }
.onyx-m-sf-i { font-family: "Playfair Display", serif; font-style: italic; font-size: 18px; color: #c4a46b; }
.onyx-m-sf-t { font-family: "Playfair Display", serif; font-size: 26px; color: #f0e6cf; line-height: 1.1; }
.onyx-m-sf-b { grid-column: 2; font-family: "Playfair Display", serif; font-style: italic; font-size: 14px; color: rgba(232,223,202,0.72); margin-top: 4px; }

/* iv · Agents */
.onyx-m-agents { display: flex; flex-direction: column; align-items: stretch; gap: 4px; }
.onyx-m-agent-card {
  position: relative; padding: 18px 16px 14px; border-radius: 4px;
  background: linear-gradient(140deg, #11161a 0%, #070a0c 60%, #03050a 100%);
  border: 1px solid rgba(140,180,210,0.25);
  box-shadow: 0 18px 30px rgba(0,0,0,0.5); overflow: hidden;
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 16px;
}
.onyx-m-agent-foil {
  position: absolute; inset: 8px; pointer-events: none; border-radius: 3px;
  background: linear-gradient(135deg, rgba(140,180,210,0.5), rgba(220,235,250,0.08) 30%, rgba(220,235,250,0.08) 70%, rgba(140,180,210,0.5)) border-box;
  -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  border: 0.5px solid transparent;
}
.onyx-m-agent-top { position: relative; z-index: 2; display: flex; justify-content: space-between; font-size: 8px; letter-spacing: 0.26em; color: rgba(168,200,220,0.7); text-transform: uppercase; }
.onyx-m-agent-mid { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 4px 0; }
.onyx-m-agent-avatar {
  width: 44px; height: 44px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 30% 30%, #e8f0ff, #88aacc 55%, #2a4060);
  color: #0a121c; font: 300 22px/1 "Inter", sans-serif;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}
.onyx-m-agent-name { font-family: "Playfair Display", serif; font-size: 22px; background: linear-gradient(180deg, #d8e6ff, #88aacc 55%, #345a7a); -webkit-background-clip: text; background-clip: text; color: transparent; }
.onyx-m-agent-rule { width: 32px; height: 1px; background: linear-gradient(90deg, transparent, rgba(140,180,210,0.7), transparent); }
.onyx-m-agent-role { font-family: "Playfair Display", serif; font-style: italic; font-size: 11px; color: rgba(232,236,245,0.7); }
.onyx-m-agent-spec {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 12px; border: 0.5px solid rgba(140,180,210,0.22); border-radius: 3px;
  background: rgba(140,180,210,0.04);
}
.onyx-m-agent-spec > div { display: grid; grid-template-columns: 52px 1fr; gap: 8px; align-items: baseline; }
.onyx-m-agent-spec b { font-family: "JetBrains Mono", "Menlo", monospace; font-weight: 400; font-size: 8px; letter-spacing: 0.22em; color: rgba(168,200,220,0.65); text-transform: uppercase; }
.onyx-m-agent-spec span { font-family: "Playfair Display", serif; font-size: 11px; color: rgba(232,236,245,0.85); line-height: 1.3; }
.onyx-m-agent-bot { position: relative; z-index: 2; text-align: center; font-size: 8px; letter-spacing: 0.26em; color: rgba(168,200,220,0.7); text-transform: uppercase; padding-top: 4px; border-top: 0.5px dotted rgba(140,180,210,0.2); }

/* v · CTA */
.onyx-m-cta { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.onyx-m-cta-h {
  font-family: "Playfair Display", serif; font-weight: 500;
  font-size: 52px; line-height: 0.96; letter-spacing: -0.025em;
  margin: 8px 0 4px; color: #f4ebd4; text-align: center;
}
.onyx-m-cta-h em { font-style: italic; font-weight: 400; background: linear-gradient(180deg, #f6e5b8, #c4a46b 60%, #8a6b34); -webkit-background-clip: text; background-clip: text; color: transparent; }
.onyx-m-cta-form {
  display: flex; align-items: center; gap: 0; width: 100%;
  background: rgba(196,164,107,0.06); border: 1px solid rgba(196,164,107,0.3);
  border-radius: 999px; padding: 6px 6px 6px 18px; box-sizing: border-box;
}
.onyx-m-cta-prefix { font-family: "Playfair Display", serif; font-size: 15px; color: rgba(232,223,202,0.65); }
.onyx-m-cta-input { appearance: none; background: transparent; border: 0; outline: none; flex: 1; color: #f4ebd4; font-family: "Playfair Display", serif; font-style: italic; font-size: 18px; padding: 12px 12px 12px 4px; width: 100%; min-width: 0; }
.onyx-m-cta-fine { font-size: 10px; letter-spacing: 0.16em; color: rgba(232,223,202,0.45); text-transform: uppercase; text-align: center; }
`;

Object.assign(window, { OnyxMobile });
