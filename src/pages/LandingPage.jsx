import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/LandingPage.css';

const TALENTS = [
  { key: 'frontend',        icon: '⚡', label: 'Frontend Dev',     color: '#60a5fa' },
  { key: 'backend',         icon: '⚙️', label: 'Backend Dev',      color: '#34d399' },
  { key: 'fullstack',       icon: '🔧', label: 'Full Stack Dev',   color: '#22c55e' },
  { key: 'designer',        icon: '🎨', label: 'Designer',         color: '#f472b6' },
  { key: 'ui_ux',           icon: '✏️', label: 'UI/UX Designer',   color: '#f59e0b' },
  { key: 'writer',          icon: '✍️', label: 'Writer',           color: '#a78bfa' },
  { key: 'marketer',        icon: '📣', label: 'Marketer',         color: '#fb923c' },
  { key: 'devops',          icon: '🚀', label: 'DevOps',           color: '#38bdf8' },
  { key: 'mobile',          icon: '📱', label: 'Mobile Dev',       color: '#2dd4bf' },
  { key: 'data_scientist',  icon: '📊', label: 'Data Scientist',   color: '#818cf8' },
  { key: 'product_manager', icon: '🗺️', label: 'Product Manager',  color: '#f87171' },
];

const FEATURES = [
  { icon: '/images/people.png', title: 'Discover Talent',   desc: "Find skilled collaborators easily by filtering through talent, skill level, and reputation. Whether you're looking for experts or rising stars, it helps you connect with the right people for your project." },
  { icon: '/images/group.png',  title: 'Build Teams',       desc: 'Create teams around shared ideas. Invite people who fit the roles you need, mix complementary skills, and get everyone aligned for smooth collaboration.' },
  { icon: '/images/chat.png',   title: 'Team Chat',         desc: 'Keep all coordination in one place. Chat directly with teammates or in group channels to stay updated, share ideas, and solve problems together.' },
  { icon: '/images/star.png',   title: 'Reputation System', desc: 'Earn points through contributions. Your reputation grows as you engage, opening doors to more opportunities and recognition.' },
];

export default function LandingPage() {

  useEffect(() => {
    (function () {
      const svg = document.getElementById('web-canvas');
      if (!svg) return;
      const ns = 'http://www.w3.org/2000/svg';

      // Card center anchors (relative to .cards-area 600×520)
      // LinkedIn: top:0,   left:60,  w:260, h:220 → center ~(190, 110)
      // Figma:    top:40,  right:0,  w:230, h:200 → left=370 → center ~(485, 140)
      // Medium:   bottom:30, left:0, w:240, h:210 → top=280  → center ~(120, 385)
      // Peerlist: bottom:0, right:30, w:250, h:215 → center ~(445, 412)
      const anchors = [
        { x: 190, y: 110 }, // LinkedIn
        { x: 485, y: 140 }, // Figma
        { x: 120, y: 385 }, // Medium
        { x: 445, y: 412 }, // Peerlist
      ];

      const drawOrder = [
        [0, 1],
        [1, 3],
        [3, 2],
        [2, 0],
        [0, 3],
        [1, 2],
      ];

      // Defs: gradient + glow filter
      const defs = document.createElementNS(ns, 'defs');

      const grad = document.createElementNS(ns, 'linearGradient');
      grad.setAttribute('id', 'threadGrad');
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      const s1 = document.createElementNS(ns, 'stop');
      s1.setAttribute('offset', '0%');   s1.setAttribute('stop-color', 'rgba(255,255,255,0)');
      const s2 = document.createElementNS(ns, 'stop');
      s2.setAttribute('offset', '50%');  s2.setAttribute('stop-color', 'rgba(255,255,255,0.9)');
      const s3 = document.createElementNS(ns, 'stop');
      s3.setAttribute('offset', '100%'); s3.setAttribute('stop-color', 'rgba(255,255,255,0)');
      grad.appendChild(s1); grad.appendChild(s2); grad.appendChild(s3);
      defs.appendChild(grad);

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

      // Static faint base web lines (all pairs)
      const allPairs = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
      allPairs.forEach(([a, b]) => {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', anchors[a].x); line.setAttribute('y1', anchors[a].y);
        line.setAttribute('x2', anchors[b].x); line.setAttribute('y2', anchors[b].y);
        line.setAttribute('stroke', 'rgba(255,255,255,0.12)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
      });

      // Anchor dots
      anchors.forEach(a => {
        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', a.x); circle.setAttribute('cy', a.y);
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', 'rgba(255,255,255,0.5)');
        circle.setAttribute('filter', 'url(#glow)');
        svg.appendChild(circle);
      });

      // Animated spark
      const animGroup = document.createElementNS(ns, 'g');
      svg.appendChild(animGroup);

      const spark = document.createElementNS(ns, 'circle');
      spark.setAttribute('r', '5');
      spark.setAttribute('fill', 'white');
      spark.setAttribute('filter', 'url(#glow)');
      spark.setAttribute('opacity', '0');
      svg.appendChild(spark);

      const CYCLE_DURATION = 4000;
      const FADE_LINGER = 800;
      let startTime = null;

      function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }

      function animate(ts) {
        if (!startTime) startTime = ts;
        const totalTime = CYCLE_DURATION + FADE_LINGER;
        const cycleTime = (ts - startTime) % totalTime;

        const segIdx     = Math.floor((cycleTime / totalTime) * drawOrder.length);
        const segProgress = ((cycleTime / totalTime) * drawOrder.length) % 1;
        const safeIdx    = Math.min(segIdx, drawOrder.length - 1);

        const [fromIdx, toIdx] = drawOrder[safeIdx];
        const from = anchors[fromIdx];
        const to   = anchors[toIdx];

        const t  = easeInOut(Math.min(segProgress, 1));
        const sx = from.x + (to.x - from.x) * t;
        const sy = from.y + (to.y - from.y) * t;

        spark.setAttribute('cx', sx);
        spark.setAttribute('cy', sy);
        spark.setAttribute('opacity', segIdx < drawOrder.length ? '1' : '0');

        while (animGroup.firstChild) animGroup.removeChild(animGroup.firstChild);

        // Previously completed segments, fading
        for (let i = 0; i < safeIdx; i++) {
          const [fi, ti] = drawOrder[i];
          const fa = anchors[fi], ta = anchors[ti];
          const fadeOpacity = Math.max(0, 0.7 - (safeIdx - i) * 0.12);
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

        // Current segment up to spark
        const curLine = document.createElementNS(ns, 'line');
        curLine.setAttribute('x1', from.x); curLine.setAttribute('y1', from.y);
        curLine.setAttribute('x2', sx);     curLine.setAttribute('y2', sy);
        curLine.setAttribute('stroke', 'rgba(255,255,255,0.95)');
        curLine.setAttribute('stroke-width', '2');
        curLine.setAttribute('filter', 'url(#glow)');
        animGroup.appendChild(curLine);

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    })();
  }, []);

  return (
    <div className="body">

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 48px', borderBottom: '1px solid var(--border)',
        background: 'rgba(33, 52, 89, 0.45)', backdropFilter: 'blur(10px)',
        position: 'fixed', top: '10px', left: '15px', right: '15px', zIndex: 100,
        borderRadius: '15px', boxSizing: 'border-box',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ marginTop: '10px' }}>
            <img src="/images/CollabX(white).png" alt="logo" width="30px" height="30px" />
          </span>
          Collab<span style={{ background: 'linear-gradient(135deg,#9DD9FD,#B9E2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontSize: '15px', marginBottom: '10px' }}>Sign In</Link>
          <Link to="/register" className="btn btn-primary nav-cta">Get Started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section>
        <section className="hero">
          <div className="ampersand-bg">&amp;</div>
          <div className="left">
            <h1 className="headline">
              Build your dream
              <span> team,</span> <span className="accent">one</span>
              <span className="accent"> skill at a time</span>
            </h1>
            <p className="subtext">
              <strong>
                CollabX connects builders, designers,<br />
                writers, and marketers.
              </strong>{" "}
              Discover complementary talent, form teams, and<br />
              coordinate everything in one place.
            </p>
          </div>

          <div className="cards-area">
            <svg id="web-canvas" xmlns="http://www.w3.org/2000/svg"></svg>

            <div className="hero-card card-linkedin">
              <div className="card-icon">
                <img src="/images/graphic-design.png" alt="designer" width="35px" height="35px" />
              </div>
              <div className="card-name">Designers</div>
              <div className="card-username">UI · Brand · Motion</div>
            </div>

            <div className="hero-card card-figma">
              <div className="card-icon" style={{
                background: 'transparent', padding: 0,
                width: 'auto', height: 'auto', borderRadius: 0, top: 20, right: 20,
              }}>
                <img src="/images/code.png" alt="developer" width="45px" height="45px" />
              </div>
              <div className="card-name" style={{ fontSize: '20px' }}>Developers</div>
              <div className="card-username">Frontend · Backend · API</div>
            </div>

            <div className="hero-card card-medium">
              <div className="medium-icon">
                <img src="/images/marketer.png" alt="marketer" width="55px" height="55px" />
              </div>
              <div className="card-name" style={{ fontSize: '23px' }}>Marketers</div>
              <div className="card-username" style={{ color: '#555' }}>No-code · 3D · Hardware</div>
            </div>

            <div className="hero-card card-peerlist">
              <div className="peerlist-icon">
                <img src="/images/writer.png" alt="writer" width="45px" height="45px" style={{ marginLeft: '15px' }} />
              </div>
              <div className="card-name">Writers</div>
              <div className="card-username">Copy · Docs · Strategy</div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: 8, fontSize: 20, width: '300px', height: '70px' }}>
            Start Collaborating →
          </Link>
          <Link to="/dashboard" className="btn btn-dark btn-lg" style={{ gap: 8, fontSize: 20, width: '300px', height: '70px' }}>
            Go to your dashboard →
          </Link>
        </div>

        {/* TALENT PILLS */}
        <section className="talent-section reveal">
          <div className="section-eyebrow">The network</div>
          <h2 className="section-title">
            Talent across <span className="accent-grad">every discipline</span>
          </h2>
          <p className="section-sub">
            From frontend wizards to product strategists — find the people who complete your team.
          </p>

          <div className="scroll-wrapper">
            <div className="scroll-content scroll-left">
              {[...TALENTS, ...TALENTS].map((t, i) => (
                <div key={`a-${i}`} className="talent-card-lg" style={{ '--pill': t.color }}>
                  <span className="talent-icon">{t.icon}</span>
                  <span className="talent-label">{t.label}</span>
                  <span className="talent-dot" />
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-wrapper" style={{ marginTop: 18 }}>
            <div className="scroll-content scroll-right">
              {[...TALENTS.slice().reverse(), ...TALENTS.slice().reverse()].map((t, i) => (
                <div key={`b-${i}`} className="talent-card-lg ghost" style={{ '--pill': t.color }}>
                  <span className="talent-icon">{t.icon}</span>
                  <span className="talent-label">{t.label}</span>
                  <span className="talent-dot" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="dash-section reveal">
        <div className="dash-text">
          <div className="section-eyebrow light">Your workspace</div>
          <h2 className="section-title light">
            One dashboard. <br />
            <span className="accent-grad">Every collaboration.</span>
          </h2>
          <p className="section-sub light">
            Track teams, messages, reputation and suggested talent — all in a single, focused view.
          </p>
        </div>

        <div className="dash-frame" aria-hidden="true">
          <div className="dash-window">
            <aside className="dash-sidebar">
              <div className="dash-logo-block" />
              <div className="dash-nav-group">
                <div className="dash-skeleton w-60" />
                <div className="dash-skeleton w-80 active" />
                <div className="dash-skeleton w-50" />
              </div>
              <div className="dash-nav-group">
                <div className="dash-skeleton tiny w-30" />
                <div className="dash-skeleton w-50" />
                <div className="dash-skeleton w-70" />
                <div className="dash-skeleton w-40" />
              </div>
              <div className="dash-nav-group dash-nav-bottom">
                <div className="dash-skeleton tiny w-30" />
                <div className="dash-skeleton w-50" />
                <div className="dash-skeleton w-40" />
              </div>
            </aside>

            <div className="dash-main">
              <div className="dash-topbar">
                <div className="dash-skeleton w-30" />
                <div className="dash-pill-skeleton" />
              </div>
              <div className="dash-hero-card">
                <div className="dash-avatar" />
                <div className="dash-hero-lines">
                  <div className="dash-skeleton tall w-50" />
                  <div className="dash-skeleton w-30" />
                </div>
                <div className="dash-stats">
                  <div className="dash-stat" />
                  <div className="dash-stat" />
                  <div className="dash-stat" />
                </div>
              </div>
              <div className="dash-skeleton heading w-25" />
              <div className="dash-notif" />
              <div className="dash-grid">
                <div className="dash-col">
                  <div className="dash-skeleton heading w-30" />
                  <div className="dash-row-card" />
                  <div className="dash-row-card" />
                </div>
                <div className="dash-col">
                  <div className="dash-skeleton heading w-40" />
                  <div className="dash-row-card sm" />
                  <div className="dash-row-card sm" />
                </div>
              </div>
            </div>
          </div>
          <div className="dash-glow" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section reveal">
        <div className="section-eyebrow">Why CollabX</div>
        <h2 className="features-heading">Everything your team needs</h2>
        <p className="section-sub center">
          Purpose-built tools to discover talent, form teams and ship together.
        </p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="feature-icon-wrap">
                <img src={f.icon} alt={f.title} />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal">
        <div className="cta-card-pro">
          <div className="cta-glow" />
          <div className="section-eyebrow center">Get started</div>
          <h2 className="cta-title">
            Ready to build <span className="accent-grad">something great?</span>
          </h2>
          <p className="cta-sub">
            Join 50+ talented individuals already collaborating on CollabX.
          </p>
          <div className="cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg cta-primary">
              Create Free Account →
            </Link>
            <Link to="/login" className="btn btn-ghost2 cta-secondary">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            Collab<span className="accent-grad">X</span>
          </div>
          <div className="footer-meta">
            © 2026 CollabX — Built for builders.
          </div>
        </div>
      </footer>

    </div>
  );
}