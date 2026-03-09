// /src/pages/Landing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: "◈", title: "Resume Analysis", desc: "Upload your resume and PrepAI extracts your skills, experience, and gaps instantly." },
    { icon: "◎", title: "Tailored Questions", desc: "Get interview questions crafted specifically for your background and target role." },
    { icon: "◉", title: "Real-time Feedback", desc: "Speak your answers and receive AI scores on clarity, structure, and confidence." },
    { icon: "◐", title: "Face Detection", desc: "Camera analysis tracks your eye contact and expression during mock interviews." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fira+Code:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #040407;
          --bg2: #07070e;
          --surface: #0c0c18;
          --border: rgba(255,255,255,0.06);
          --border-bright: rgba(180,255,100,0.25);
          --green: #b4ff64;
          --green-dim: rgba(180,255,100,0.12);
          --text: #eeeef5;
          --muted: rgba(238,238,245,0.4);
          --font-display: 'Syne', sans-serif;
          --font-mono: 'Fira Code', monospace;
        }

        body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        .prepai-root { min-height: 100vh; background: var(--bg); position: relative; overflow: hidden; font-family: var(--font-mono); }

        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(180,255,100,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,255,100,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .blob { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: rgba(180,255,100,0.07); top: -200px; right: -100px; }
        .blob-2 { width: 400px; height: 400px; background: rgba(100,150,255,0.06); bottom: 0; left: -100px; }

        .prepai-nav {
          position: relative; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 56px;
          border-bottom: 1px solid var(--border);
        }
        .prepai-logo {
          font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;
          letter-spacing: -0.04em; color: var(--text);
          display: flex; align-items: center; gap: 8px;
        }
        .prepai-logo .accent { color: var(--green); }
        .logo-dot {
          width: 8px; height: 8px; background: var(--green); border-radius: 50%;
          box-shadow: 0 0 10px var(--green);
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .nav-right { display: flex; align-items: center; gap: 10px; }
        .pbtn {
          font-family: var(--font-mono); font-size: 0.78rem; font-weight: 500;
          padding: 9px 22px; border-radius: 4px; cursor: pointer;
          transition: all 0.18s; letter-spacing: 0.05em;
        }
        .pbtn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); }
        .pbtn-ghost:hover { border-color: var(--border-bright); color: var(--green); }
        .pbtn-solid { background: var(--green); border: 1px solid var(--green); color: #040407; font-weight: 700; }
        .pbtn-solid:hover { background: transparent; color: var(--green); box-shadow: 0 0 20px rgba(180,255,100,0.2); }

        .prepai-hero {
          position: relative; z-index: 10;
          max-width: 1100px; margin: 0 auto; padding: 110px 56px 80px;
          display: grid; grid-template-columns: 1.1fr 0.9fr;
          gap: 80px; align-items: center;
        }

        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--green); border: 1px solid var(--border-bright);
          background: var(--green-dim); padding: 5px 14px; border-radius: 2px;
          margin-bottom: 28px; opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .hero-tag.show { opacity: 1; transform: translateY(0); }

        .hero-title {
          font-family: var(--font-display); font-size: clamp(3rem, 6vw, 5.2rem);
          font-weight: 800; line-height: 0.95; letter-spacing: -0.04em; margin-bottom: 28px;
        }
        .title-line {
          display: block; opacity: 0; transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .title-line.show { opacity: 1; transform: translateY(0); }
        .title-green { color: var(--green); }
        .title-outline { -webkit-text-stroke: 1.5px rgba(238,238,245,0.3); color: transparent; }

        .hero-sub {
          font-size: 0.9rem; color: var(--muted); line-height: 1.8; font-weight: 300;
          max-width: 420px; margin-bottom: 44px;
          opacity: 0; transition: opacity 0.7s ease 0.7s;
        }
        .hero-sub.show { opacity: 1; }

        .cta-group {
          display: flex; align-items: center; gap: 16px;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.6s ease 0.9s, transform 0.6s ease 0.9s;
        }
        .cta-group.show { opacity: 1; transform: translateY(0); }

        .cta-big {
          font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 14px 36px; background: var(--green); color: #040407;
          border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;
          position: relative; overflow: hidden;
        }
        .cta-big::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.15); opacity: 0; transition: opacity 0.2s; }
        .cta-big:hover::after { opacity: 1; }
        .cta-big:hover { box-shadow: 0 0 30px rgba(180,255,100,0.4), 0 4px 20px rgba(0,0,0,0.5); }

        .cta-link {
          font-size: 0.8rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-mono); transition: color 0.2s; letter-spacing: 0.05em;
        }
        .cta-link:hover { color: var(--green); }

        .stats-row {
          display: flex; gap: 32px; margin-top: 52px;
          opacity: 0; transition: opacity 0.6s ease 1.1s;
        }
        .stats-row.show { opacity: 1; }
        .stat { border-left: 2px solid var(--green); padding-left: 14px; }
        .stat-num { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
        .stat-label { font-size: 0.7rem; color: var(--muted); margin-top: 4px; letter-spacing: 0.1em; text-transform: uppercase; }

        .terminal-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
          opacity: 0; transform: translateY(20px) scale(0.98);
          transition: opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s;
        }
        .terminal-card.show { opacity: 1; transform: translateY(0) scale(1); }
        .term-bar {
          background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--border);
          padding: 10px 16px; display: flex; align-items: center; gap: 8px;
        }
        .tdot { width: 10px; height: 10px; border-radius: 50%; }
        .tdot-r { background: #ff5f57; } .tdot-y { background: #febc2e; } .tdot-g { background: #28c840; }
        .term-title { font-size: 0.7rem; color: var(--muted); margin-left: auto; letter-spacing: 0.08em; }
        .term-body { padding: 24px; font-size: 0.78rem; line-height: 2; }
        .tline { display: flex; gap: 10px; }
        .tprompt { color: var(--green); user-select: none; }
        .tcmd { color: var(--text); }
        .tout { color: rgba(238,238,245,0.5); padding-left: 20px; }
        .tkey { color: #60a5fa; }
        .tval { color: #fbbf24; }
        .tgap { height: 8px; }

        .ai-block {
          margin-top: 16px; background: rgba(180,255,100,0.05);
          border: 1px solid var(--border-bright); border-radius: 4px; padding: 14px 16px;
        }
        .ai-block-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--green); margin-bottom: 6px; }
        .ai-block-text { font-size: 0.76rem; color: rgba(238,238,245,0.7); line-height: 1.6; }
        .score-bars { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .sbar-row { display: flex; align-items: center; gap: 10px; }
        .sbar-label { font-size: 0.65rem; color: var(--muted); width: 72px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.08em; }
        .sbar-track { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .sbar-fill { height: 100%; background: var(--green); border-radius: 2px; animation: grow 1.2s ease 1.5s both; }
        @keyframes grow { from { width: 0 !important; } }
        .sbar-pct { font-size: 0.65rem; color: var(--green); width: 30px; text-align: right; }

        .prepai-features {
          position: relative; z-index: 10;
          max-width: 1100px; margin: 0 auto 100px; padding: 0 56px;
        }
        .section-header { display: flex; align-items: baseline; gap: 16px; margin-bottom: 40px; }
        .section-num { font-size: 0.7rem; color: var(--green); letter-spacing: 0.15em; font-family: var(--font-mono); }
        .section-title { font-family: var(--font-display); font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; letter-spacing: -0.03em; }
        .section-rule { flex: 1; height: 1px; background: var(--border); margin-left: 8px; }

        .feat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
        }
        .feat-card { background: var(--bg2); padding: 32px 28px; transition: background 0.25s; cursor: default; }
        .feat-card:hover { background: var(--surface); }
        .feat-icon { font-size: 1.6rem; color: var(--green); margin-bottom: 18px; display: block; transition: transform 0.3s; }
        .feat-card:hover .feat-icon { transform: scale(1.15) rotate(10deg); }
        .feat-title { font-family: var(--font-display); font-size: 1rem; font-weight: 800; margin-bottom: 10px; letter-spacing: -0.02em; }
        .feat-desc { font-size: 0.78rem; color: var(--muted); line-height: 1.7; font-weight: 300; }

        .prepai-divider { position: relative; z-index: 10; max-width: 1100px; margin: 0 auto 80px; padding: 0 56px; }
        .prepai-divider hr { border: none; border-top: 1px solid var(--border); }

        .prepai-footer {
          position: relative; z-index: 10; border-top: 1px solid var(--border);
          padding: 28px 56px; display: flex; align-items: center; justify-content: space-between;
        }
        .footer-logo { font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; letter-spacing: -0.03em; }
        .footer-logo .accent { color: var(--green); }
        .footer-copy { font-size: 0.72rem; color: var(--muted); }
        .footer-links { display: flex; gap: 20px; }
        .footer-link {
          font-size: 0.72rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-mono); transition: color 0.2s; letter-spacing: 0.05em;
        }
        .footer-link:hover { color: var(--green); }

        @media (max-width: 820px) {
          .prepai-hero { grid-template-columns: 1fr; padding: 60px 24px; gap: 48px; }
          .prepai-nav { padding: 18px 24px; }
          .prepai-features { padding: 0 24px; }
          .feat-grid { grid-template-columns: 1fr 1fr; }
          .prepai-footer { padding: 24px; flex-direction: column; gap: 16px; text-align: center; }
        }
        @media (max-width: 520px) { .feat-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="prepai-root">
        <div className="grid-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="prepai-nav">
          <div className="prepai-logo">
            <div className="logo-dot" />
            Prep<span className="accent">AI</span>
          </div>
          <div className="nav-right">
            <button className="pbtn pbtn-ghost" onClick={() => navigate("/login")}>login</button>
            <button className="pbtn pbtn-solid" onClick={() => navigate("/register")}>register →</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="prepai-hero">
          <div>
            <div className={`hero-tag ${show ? "show" : ""}`}>
              <span>●</span> AI-Powered Interview Prep
            </div>
            <h1 className="hero-title">
              <span className={`title-line ${show ? "show" : ""}`} style={{ transitionDelay: "0.1s" }}>Land</span>
              <span className={`title-line title-green ${show ? "show" : ""}`} style={{ transitionDelay: "0.22s" }}>Your Dream</span>
              <span className={`title-line title-outline ${show ? "show" : ""}`} style={{ transitionDelay: "0.34s" }}>Role.</span>
            </h1>
            <p className={`hero-sub ${show ? "show" : ""}`}>
              PrepAI analyzes your resume, generates role-specific questions,
              and coaches your answers with real-time AI feedback — so you walk in ready.
            </p>
            <div className={`cta-group ${show ? "show" : ""}`}>
              <button className="cta-big" onClick={() => navigate("/upload-resume")}>Start Prepping</button>
              <button className="cta-link" onClick={() => navigate("/demo")}>see how it works →</button>
            </div>
            <div className={`stats-row ${show ? "show" : ""}`}>
              {[
                { n: "3 min", l: "To first question" },
                { n: "AI", l: "Real-time feedback" },
                { n: "Free", l: "To get started" },
              ].map((s) => (
                <div className="stat" key={s.l}>
                  <div className="stat-num">{s.n}</div>
                  <div className="stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal mockup */}
          <div className={`terminal-card ${show ? "show" : ""}`}>
            <div className="term-bar">
              <div className="tdot tdot-r" /><div className="tdot tdot-y" /><div className="tdot tdot-g" />
              <span className="term-title">prepai — mock session</span>
            </div>
            <div className="term-body">
              <div className="tline"><span className="tprompt">›</span><span className="tcmd">analyzing resume...</span></div>
              <div className="tout"><span className="tkey">role</span>: <span className="tval">"Senior Frontend Engineer"</span></div>
              <div className="tout"><span className="tkey">skills</span>: <span className="tval">React, TypeScript, AWS</span></div>
              <div className="tout"><span className="tkey">experience</span>: <span className="tval">4 years</span></div>
              <div className="tgap" />
              <div className="tline"><span className="tprompt">›</span><span className="tcmd">generating questions...</span></div>
              <div className="tout" style={{ color: "rgba(238,238,245,0.65)" }}>
                Q: "Describe how you'd architect a<br />&nbsp;&nbsp;&nbsp;scalable React app from scratch."
              </div>
              <div className="ai-block">
                <div className="ai-block-label">⬡ PrepAI Feedback</div>
                <div className="ai-block-text">Good structure. Mention state management and code splitting to strengthen your answer.</div>
                <div className="score-bars">
                  {[{ l: "Clarity", p: 88 }, { l: "Structure", p: 74 }, { l: "Confidence", p: 91 }].map((b) => (
                    <div className="sbar-row" key={b.l}>
                      <span className="sbar-label">{b.l}</span>
                      <div className="sbar-track"><div className="sbar-fill" style={{ width: `${b.p}%` }} /></div>
                      <span className="sbar-pct">{b.p}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <div className="prepai-divider"><hr /></div>
        <section className="prepai-features">
          <div className="section-header">
            <span className="section-num">02 /</span>
            <h2 className="section-title">Everything you need</h2>
            <div className="section-rule" />
          </div>
          <div className="feat-grid">
            {features.map((f) => (
              <div className="feat-card" key={f.title}>
                <span className="feat-icon">{f.icon}</span>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="prepai-footer">
          <div className="footer-logo">Prep<span className="accent">AI</span></div>
          <div className="footer-copy">© {new Date().getFullYear()} PrepAI · Built with AI</div>
          <div className="footer-links">
            <button className="footer-link" onClick={() => navigate("/privacy")}>privacy</button>
            <button className="footer-link" onClick={() => navigate("/terms")}>terms</button>
            <button className="footer-link" onClick={() => navigate("/contact")}>contact</button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;