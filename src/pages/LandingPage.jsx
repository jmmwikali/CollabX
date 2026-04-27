// import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/LandingPage.css'
import { useEffect } from 'react';

const TALENTS = [
  { key: 'frontend', icon: '⚡', label: 'Frontend Dev', color: '#60a5fa' },
  { key: 'backend', icon: '⚙️', label: 'Backend Dev', color: '#34d399' },
  { key: 'fullstack', icon: '🔧', label: 'Full Stack Dev', color: '#22c55e' },
  { key: 'designer', icon: '🎨', label: 'Designer', color: '#f472b6' },
  { key: 'ui_ux', icon: '✏️', label: 'UI/UX Designer', color: '#f59e0b' },
  { key: 'writer', icon: '✍️', label: 'Writer', color: '#a78bfa' },
  { key: 'marketer', icon: '📣', label: 'Marketer', color: '#fb923c' },
  { key: 'devops', icon: '🚀', label: 'DevOps', color: '#38bdf8' },
  { key: 'mobile', icon: '📱', label: 'Mobile Dev', color: '#2dd4bf' },
  { key: 'data_scientist', icon: '📊', label: 'Data Scientist', color: '#818cf8' },
  { key: 'product_manager', icon: '🗺️', label: 'Product Manager', color: '#f87171' },
];

const FEATURES = [
  { icon: '/images/people.png', title: 'Discover Talent', desc: 'Find skilled collaborators easily by filtering through talent, skill level, and reputation. Whether you’re looking for experts or rising stars, it helps you connect with the right people for your project.' },
  { icon: '/images/group.png', title: 'Build Teams', desc: 'Create teams around shared ideas. Invite people who fit the roles you need, mix complementary skills, and get everyone aligned for smooth collaboration.' },
  { icon: '/images/chat.png', title: 'Team Chat', desc: 'Keep all coordination in one place. Chat directly with teammates or in group channels to stay updated, share ideas, and solve problems together.' },
  { icon: '/images/star.png', title: 'Reputation System', desc: 'Earn points through contributions. Your reputation grows as you engage, opening doors to more opportunities and recognition.' },
];

export default function LandingPage() {

  useEffect(() => {
    (function() {
      const svg = document.getElementById('web-canvas');
      if (!svg) return;
      const ns = 'http://www.w3.org/2000/svg';

      // Card center anchors (relative to .cards-area 600x520)
  // LinkedIn: top:0, left:60, w:260, h:220  → center ~(190, 110)
  // Figma:    top:40, right:0, w:230, h:200  → right=0 means left=600-230=370 → center ~(485, 140)
  // Medium:   bottom:30, left:0, w:240, h:210 → top=520-30-210=280 → center ~(120, 385)
  // Peerlist: bottom:0, right:30, w:250, h:215 → top=520-215=305, left=600-30-250=320 → center ~(445, 412)

  const anchors = [
    { x: 190, y: 110 },  // LinkedIn
    { x: 485, y: 140 },  // Figma
    { x: 120, y: 385 },  // Medium
    { x: 445, y: 412 },  // Peerlist
  ];

  // Web structure: all pairs of connections
  const connections = [
    [0, 1], // LinkedIn → Figma
    [0, 2], // LinkedIn → Medium
    [0, 3], // LinkedIn → Peerlist
    [1, 2], // Figma → Medium
    [1, 3], // Figma → Peerlist
    [2, 3], // Medium → Peerlist
  ];

  // Order of "drawing" sequence: start from LinkedIn (0), weave outward
  const drawOrder = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
    [0, 3],
    [1, 2],
  ];

  // Create defs for gradient
  const defs = document.createElementNS(ns, 'defs');

  // Glowing gradient along each thread
  const grad = document.createElementNS(ns, 'linearGradient');
  grad.setAttribute('id', 'threadGrad');
  grad.setAttribute('gradientUnits', 'userSpaceOnUse');
  const s1 = document.createElementNS(ns, 'stop');
  s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', 'rgba(255,255,255,0)');
  const s2 = document.createElementNS(ns, 'stop');
  s2.setAttribute('offset', '50%'); s2.setAttribute('stop-color', 'rgba(255,255,255,0.9)');
  const s3 = document.createElementNS(ns, 'stop');
  s3.setAttribute('offset', '100%'); s3.setAttribute('stop-color', 'rgba(255,255,255,0)');
  grad.appendChild(s1); grad.appendChild(s2); grad.appendChild(s3);
  defs.appendChild(grad);

  // Glow filter
  const filter = document.createElementNS(ns, 'filter');
  filter.setAttribute('id', 'glow');
  filter.setAttribute('x', '-50%'); filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%'); filter.setAttribute('height', '200%');
  const feGaussianBlur = document.createElementNS(ns, 'feGaussianBlur');
  feGaussianBlur.setAttribute('stdDeviation', '2.5');
  feGaussianBlur.setAttribute('result', 'coloredBlur');
  const feMerge = document.createElementNS(ns, 'feMerge');
  const feMergeNode1 = document.createElementNS(ns, 'feMergeNode');
  feMergeNode1.setAttribute('in', 'coloredBlur');
  const feMergeNode2 = document.createElementNS(ns, 'feMergeNode');
  feMergeNode2.setAttribute('in', 'SourceGraphic');
  feMerge.appendChild(feMergeNode1); feMerge.appendChild(feMergeNode2);
  filter.appendChild(feGaussianBlur); filter.appendChild(feMerge);
  defs.appendChild(filter);

  svg.appendChild(defs);

  // Draw static faint base web lines
  connections.forEach(([a, b]) => {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', anchors[a].x); line.setAttribute('y1', anchors[a].y);
    line.setAttribute('x2', anchors[b].x); line.setAttribute('y2', anchors[b].y);
    line.setAttribute('stroke', 'rgba(255,255,255,0.12)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  });

  // Draw dot nodes at anchors
  anchors.forEach(a => {
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', a.x); circle.setAttribute('cy', a.y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', 'rgba(255,255,255,0.5)');
    circle.setAttribute('filter', 'url(#glow)');
    svg.appendChild(circle);
  });

  // --- Animated travelling light along the web ---
  // We'll animate a bright "spark" that travels each segment in sequence,
  // leaving a briefly glowing trail that fades out.

  const CYCLE_DURATION = 4000; // ms for full web traversal
  const FADE_LINGER = 800; // ms a lit segment stays visible before fading

  // Create a group for the animated threads
  const animGroup = document.createElementNS(ns, 'g');
  svg.appendChild(animGroup);

  // Spark dot
  const spark = document.createElementNS(ns, 'circle');
  spark.setAttribute('r', '5');
  spark.setAttribute('fill', 'white');
  spark.setAttribute('filter', 'url(#glow)');
  spark.setAttribute('opacity', '0');
  svg.appendChild(spark);

  // Lit segments: each is a line with a glow that fades
  // function createLitSegment(ax, ay, bx, by) {
  //   const line = document.createElementNS(ns, 'line');
  //   line.setAttribute('x1', ax); line.setAttribute('y1', ay);
  //   line.setAttribute('x2', bx); line.setAttribute('y2', by);
  //   line.setAttribute('stroke', 'rgba(255,255,255,0.85)');
  //   line.setAttribute('stroke-width', '1.8');
  //   line.setAttribute('filter', 'url(#glow)');
  //   line.setAttribute('opacity', '1');
  //   animGroup.appendChild(line);
  //   return line;
  // }

  // Animate
  let startTime = null;
  // const segmentTime = CYCLE_DURATION / drawOrder.length;

  function easeInOut(t) {
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  }

  // Track lit lines
  // let litLines = [];

  function animate(ts) {
    if (!startTime) startTime = ts;
    // const elapsed = (ts - startTime) % (CYCLE_DURATION + FADE_LINGER * drawOrder.length);
    const totalTime = CYCLE_DURATION + FADE_LINGER;
    const cycleTime = (ts - startTime) % (totalTime);

    // Which segment are we on?
    const segIdx = Math.floor((cycleTime / totalTime) * drawOrder.length);
    const segProgress = ((cycleTime / totalTime) * drawOrder.length) % 1;

    const safeIdx = Math.min(segIdx, drawOrder.length - 1);
    const [fromIdx, toIdx] = drawOrder[safeIdx];
    const from = anchors[fromIdx];
    const to = anchors[toIdx];

    const t = easeInOut(Math.min(segProgress, 1));
    const sx = from.x + (to.x - from.x) * t;
    const sy = from.y + (to.y - from.y) * t;

    // Spark position
    spark.setAttribute('cx', sx);
    spark.setAttribute('cy', sy);
    spark.setAttribute('opacity', segIdx < drawOrder.length ? '1' : '0');

    // On each new segment, create a lit line that grows
    // We'll redraw the lit segment dynamically each frame using a partial line
    // Remove old dynamic lines and redraw
    while (animGroup.firstChild) animGroup.removeChild(animGroup.firstChild);

    // Draw all previously completed segments (fading)
    for (let i = 0; i < safeIdx; i++) {
      const [fi, ti] = drawOrder[i];
      const fa = anchors[fi], ta = anchors[ti];
      const age = safeIdx - i; // how many segments ago
      const fadeOpacity = Math.max(0, 0.7 - age * 0.12);
      if (fadeOpacity > 0.01) {
        const l = document.createElementNS(ns, 'line');
        l.setAttribute('x1', fa.x); l.setAttribute('y1', fa.y);
        l.setAttribute('x2', ta.x); l.setAttribute('y2', ta.y);
        l.setAttribute('stroke', `rgba(255,255,255,${fadeOpacity})`);
        l.setAttribute('stroke-width', '1.8');
        l.setAttribute('filter', 'url(#glow)');
        animGroup.appendChild(l);
      }
    }

    // Draw current segment up to spark position
    const curLine = document.createElementNS(ns, 'line');
    curLine.setAttribute('x1', from.x); curLine.setAttribute('y1', from.y);
    curLine.setAttribute('x2', sx); curLine.setAttribute('y2', sy);
    curLine.setAttribute('stroke', 'rgba(255,255,255,0.95)');
    curLine.setAttribute('stroke-width', '2');
    curLine.setAttribute('filter', 'url(#glow)');
    animGroup.appendChild(curLine);

    requestAnimationFrame(animate);
  }



      requestAnimationFrame(animate);
    })();
  }, []); // empty deps = run once after mount

  return (
    <div className='body'>
      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 48px', borderBottom: '1px solid var(--border)',
        background: 'rgba(33, 52, 89, 0.45)', backdropFilter: 'blur(10px)',
        position: 'fixed', top: '10px', left: '15px', right: '15px', zIndex: 100,
        borderRadius: '15px',
        boxSizing: 'border-box',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{marginTop: '10px'}}> <img src="/images/CollabX(white).png" alt="logo" width={"30px"} height={"30px"} /></span>
          Collab<span style={{ background: 'linear-gradient(135deg,#9DD9FD,#B9E2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost" style={{fontSize: '15px', marginBottom: '10px'}}>Sign In</Link>
          <Link to="/register" className="btn btn-primary nav-cta">Get Started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section>
  <section className="hero">
    <div className="ampersand-bg">&amp;</div>
    <div className="left">
      <h1 className="headline">
        Build your
        dream
        <span> team,</span> <span className="accent">one</span>
        <span className="accent">skill at a time</span>
      </h1>
      <p className="subtext">
        <strong>
          CollabX connects builders, designers,<br />
          writers, and maketers.
        </strong>{" "}
        Discover complementary talent, form teams, and<br />
        coordinate everything in one place.
      </p>
    </div>

    <div className="cards-area">
      <svg id="web-canvas" xmlns="http://www.w3.org/2000/svg"></svg>

      <div className="hero-card card-linkedin">
        <div className="card-icon"> <img src="/images/graphic-design.png" alt="designer" width={"35px"} height={"35px"} /></div>
        <div className="card-name">Designers</div>
        <div className="card-username">UI · Brand · Motion</div>
      </div>

      <div className="hero-card card-figma">
        <div
          className="card-icon"
          style={{
            background: "transparent",
            padding: 0,
            width: "auto",
            height: "auto",
            borderRadius: 0,
            top: 20,
            right: 20,
          }}
        ><img src="/images/code.png" alt="designer" width={"45px"} height={"45px"} /></div>
        <div className="card-name" style={{fontSize: '20px'}}>Developers</div>
        <div className="card-username">Frontend · Backend · API</div>
      </div>

      <div className="hero-card card-medium">
        <div className="medium-icon"><img src="/images/marketer.png" alt="designer" width={"55px"} height={"55px"} /></div>
        <div className="card-name" style={{fontSize: '23px'}}>Marketers</div>
        <div className="card-username" style={{ color: "#555" }}>
          No-code · 3D · Hardware
        </div>
      </div>

      <div className="hero-card card-peerlist">
        <div className="peerlist-icon"><img src="/images/writer.png" alt="designer" width={"45px"} height={"45px"} style={{marginLeft: '15px'}} /></div>
        <div className="card-name">Writers</div>
        <div className="card-username">Copy · Docs · Strategy</div>
      </div>
    </div>
  </section>

  <div
    style={{
      display: "flex",
      gap: 12,
      justifyContent: "center",
      flexWrap: "wrap",
    }}
  >
    <Link
      to="/register"
      className="btn btn-primary btn-lg"
      style={{ gap: 8, fontSize: 20, width: '300px', height: '70px'}}
    >
      Start Collaborating →
    </Link>
    <Link
      to="/dashboard"
      className="btn btn-dark btn-lg"
      style={{ gap: 8, fontSize: 20, width: '300px', height: '70px'}}
    >
      Go to your dashboard →
    </Link>
  </div>

  {/* Talent pills */}
  <div className="scroll-wrapper">
  <div className="scroll-content">
    {[...TALENTS, ...TALENTS].map((t, i) => (
      <div key={i} className="talent-card">
        <span>{t.icon}</span>
        <span style={{ color: t.color }}>{t.label}</span>
      </div>
    ))}
  </div>
</div>
</section>

      {/* FEATURES */}
      <section className="features-section" style={{ padding: '60px 48px', maxWidth: '100%' }}>
        <h2 className="features-heading" style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, textAlign: 'center', marginBottom: 20, letterSpacing: '-1px', color: '#181b20' }}>
          Everything your team needs
        </h2>
        <div className="grid-2" style={{ gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="cards" style={{ gap: 12, border: '1.5px groove rgba(222, 222, 222, 0.44)'}}>
              <img src={f.icon} alt={f.title} style={{ width: 60, height: 60, backgroundColor: '#fff', padding: 10, borderRadius: 15}} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#003083' }}>{f.title}</h2>
              <p style={{ fontSize: 15, color: '#181b20', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div className="cta-card" style={{
          display: 'inline-block', padding: '48px 64px',
          background: 'linear-gradient(135deg, rgba(59, 131, 246, 0.25), rgba(138, 92, 246, 0.25))',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: 600, width: '100%',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-1px' }}>
            Ready to build something great?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            Join 50+ talented individuals already collaborating on CollabX.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2026 CollabX — Built for builders.
      </footer>
    </div>
  );
}