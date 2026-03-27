// /src/pages/GenerateInterview.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://prepai-pink.vercel.app";

const ROLE_SUGGESTIONS = [
  "SDE-1", "SDE-2", "Frontend Engineer", "Backend Engineer",
  "Full Stack Developer", "Data Scientist", "ML Engineer",
  "Product Manager", "DevOps Engineer", "System Design"
];

export default function GenerateInterview() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [rawQuestions, setRawQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setRawQuestions("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/interview/generate`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const raw = res.data.questions;
      setRawQuestions(raw);
      // Parse into array — split by newline or numbered list
      const parsed = typeof raw === "string"
        ? raw.split(/\n/).map(q => q.replace(/^\d+[\.\)]\s*/, "").trim()).filter(q => q.length > 4)
        : Array.isArray(raw) ? raw : [raw];
      setQuestions(parsed);
    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to generate questions. Server may be waking up — please try again in 30s.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartInterview = () => {
    localStorage.setItem("resumeQuestions", JSON.stringify(questions));
    localStorage.setItem("resumeRole", role);
    navigate("/voice-interview");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fira+Code:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #040407; --bg2: #07070e; --surface: #0c0c18; --surface2: #10101f;
          --border: rgba(255,255,255,0.06); --border-bright: rgba(180,255,100,0.25);
          --green: #b4ff64; --green-dim: rgba(180,255,100,0.10); --green-glow: rgba(180,255,100,0.25);
          --text: #eeeef5; --muted: rgba(238,238,245,0.4);
          --red: #ff6b6b; --red-dim: rgba(255,107,107,0.10);
          --font-d: 'Syne', sans-serif; --font-m: 'Fira Code', monospace;
        }

        body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        .gi-root { min-height: 100vh; background: var(--bg); font-family: var(--font-m); position: relative; overflow-x: hidden; }

        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(180,255,100,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,255,100,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .blob { position: fixed; border-radius: 50%; filter: blur(110px); pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: rgba(180,255,100,0.06); top: -180px; right: -100px; }
        .blob-2 { width: 380px; height: 380px; background: rgba(100,120,255,0.05); bottom: -80px; left: -80px; }

        /* NAV */
        .gi-nav {
          position: relative; z-index: 20; padding: 22px 56px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .gi-logo { font-family: var(--font-d); font-size: 1.4rem; font-weight: 800; letter-spacing: -0.04em; color: var(--text); display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .gi-logo .accent { color: var(--green); }
        .logo-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; box-shadow: 0 0 10px var(--green); animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nav-back { font-size: 0.74rem; color: var(--muted); background: none; border: none; cursor: pointer; font-family: var(--font-m); letter-spacing: 0.05em; transition: color 0.15s; }
        .nav-back:hover { color: var(--green); }

        /* MAIN */
        .gi-main { position: relative; z-index: 10; max-width: 860px; margin: 0 auto; padding: 56px 40px 80px; display: flex; flex-direction: column; gap: 28px; }

        .fade { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade.show { opacity: 1; transform: translateY(0); }

        /* PAGE HEADER */
        .pg-eyebrow { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--green); margin-bottom: 12px; }
        .pg-title { font-family: var(--font-d); font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 800; letter-spacing: -0.04em; line-height: 0.95; margin-bottom: 12px; }
        .pg-title .accent { color: var(--green); }
        .pg-title .outline { -webkit-text-stroke: 1.5px rgba(238,238,245,0.25); color: transparent; }
        .pg-sub { font-size: 0.84rem; color: var(--muted); line-height: 1.65; font-weight: 300; max-width: 500px; }

        /* CARD */
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; position: relative; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--green), transparent 60%); }
        .card-body { padding: 32px 36px; }

        .sec-hd { display: flex; align-items: baseline; gap: 12px; margin-bottom: 22px; }
        .sec-num { font-size: 0.64rem; color: var(--green); letter-spacing: 0.16em; flex-shrink: 0; }
        .sec-ttl { font-family: var(--font-d); font-size: 1.1rem; font-weight: 800; letter-spacing: -0.02em; }
        .sec-rule { flex: 1; height: 1px; background: var(--border); margin-left: 6px; }

        /* FIELD */
        .field-label { font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 8px; display: block; }
        .field-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 4px; padding: 12px 16px;
          font-family: var(--font-m); font-size: 0.85rem; color: var(--text);
          transition: border-color 0.2s, box-shadow 0.2s; outline: none; letter-spacing: 0.03em;
        }
        .field-input::placeholder { color: rgba(238,238,245,0.2); }
        .field-input:focus { border-color: var(--border-bright); box-shadow: 0 0 0 3px rgba(180,255,100,0.06); }

        /* SUGGESTIONS */
        .suggestions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; margin-bottom: 24px; }
        .sug-chip {
          font-size: 0.68rem; letter-spacing: 0.06em;
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--muted); padding: 5px 12px; border-radius: 3px;
          cursor: pointer; transition: all 0.15s; font-family: var(--font-m);
        }
        .sug-chip:hover { border-color: var(--border-bright); color: var(--green); background: var(--green-dim); }
        .sug-chip.active { border-color: var(--green); color: var(--green); background: var(--green-dim); }

        /* SUBMIT */
        .submit-btn {
          width: 100%; padding: 14px; border-radius: 4px; cursor: pointer;
          font-family: var(--font-m); font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--green); border: 1px solid var(--green); color: #040407;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
          position: relative; overflow: hidden;
        }
        .submit-btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.1); opacity: 0; transition: opacity 0.15s; }
        .submit-btn:hover:not(:disabled)::after { opacity: 1; }
        .submit-btn:hover:not(:disabled) { box-shadow: 0 0 28px var(--green-glow); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .spinner { width: 14px; height: 14px; border: 2px solid rgba(4,4,7,0.3); border-top-color: #040407; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* LOADING STATE */
        .loading-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 48px; text-align: center; }
        .loading-sym { font-size: 1.4rem; color: var(--green); margin-bottom: 16px; animation: rotate 2s linear infinite; }
        @keyframes rotate { to { transform: rotate(360deg); } }
        .loading-txt { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.06em; }
        .loading-role { color: var(--green); }

        /* TERMINAL LOADING DOTS */
        .dot-anim::after { content: ''; animation: dots 1.5s steps(4, end) infinite; }
        @keyframes dots { 0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} }

        /* ERROR */
        .err-box {
          background: var(--red-dim); border: 1px solid rgba(255,107,107,0.25);
          border-radius: 4px; padding: 12px 16px;
          font-size: 0.76rem; color: var(--red); display: flex; gap: 8px; line-height: 1.5;
        }

        /* RESULTS */
        .results-header-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .results-meta {
          display: flex; align-items: center; gap: 10px;
        }
        .results-badge {
          font-size: 0.62rem; background: var(--green-dim); border: 1px solid var(--border-bright);
          color: var(--green); padding: 3px 10px; border-radius: 2px; letter-spacing: 0.08em;
        }
        .role-tag {
          font-size: 0.62rem; background: var(--surface2); border: 1px solid var(--border);
          color: var(--muted); padding: 3px 10px; border-radius: 2px; letter-spacing: 0.06em;
        }
        .icon-btn {
          font-family: var(--font-m); font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase;
          background: transparent; border: 1px solid var(--border); color: var(--muted);
          padding: 5px 12px; border-radius: 3px; cursor: pointer; transition: all 0.15s;
        }
        .icon-btn:hover { border-color: var(--border-bright); color: var(--green); }
        .icon-btn.copied { border-color: rgba(180,255,100,0.4); color: var(--green); }

        /* Q LIST */
        .q-list { display: flex; flex-direction: column; margin-top: 20px; }
        .q-item {
          padding: 16px 0; border-bottom: 1px solid var(--border);
          display: flex; gap: 18px; align-items: flex-start;
          transition: padding-left 0.2s;
        }
        .q-item:last-child { border-bottom: none; }
        .q-item:hover { padding-left: 6px; }
        .q-num { font-size: 0.62rem; color: var(--green); opacity: 0.55; width: 22px; flex-shrink: 0; padding-top: 2px; letter-spacing: 0.06em; }
        .q-text { font-size: 0.875rem; color: rgba(238,238,245,0.82); line-height: 1.65; font-weight: 300; }

        /* ACTIONS */
        .actions-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .act-btn {
          font-family: var(--font-m); font-size: 0.78rem; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 12px 24px; border-radius: 4px; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; gap: 8px;
          position: relative; overflow: hidden; flex: 1; justify-content: center; min-width: 160px;
        }
        .act-btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.07); opacity: 0; transition: opacity 0.15s; }
        .act-btn:hover::after { opacity: 1; }
        .act-primary { background: var(--green); border: 1px solid var(--green); color: #040407; font-weight: 700; }
        .act-primary:hover { box-shadow: 0 0 22px var(--green-glow); }
        .act-ghost { background: transparent; border: 1px solid var(--border-bright); color: var(--text); }
        .act-ghost:hover { border-color: var(--green); color: var(--green); background: var(--green-dim); }

        /* TIPS */
        .tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .tip-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 18px 16px; transition: border-color 0.2s; }
        .tip-card:hover { border-color: var(--border-bright); }
        .tip-sym { font-size: 1rem; color: var(--green); margin-bottom: 8px; opacity: 0.7; }
        .tip-title { font-family: var(--font-d); font-size: 0.82rem; font-weight: 800; margin-bottom: 5px; letter-spacing: -0.01em; }
        .tip-desc { font-size: 0.72rem; color: var(--muted); line-height: 1.5; font-weight: 300; }

        @media (max-width: 640px) {
          .gi-nav { padding: 18px 24px; }
          .gi-main { padding: 36px 20px 60px; }
          .card-body { padding: 24px 20px; }
          .tips-grid { grid-template-columns: 1fr; }
          .actions-row { flex-direction: column; }
        }
      `}</style>

      <div className="gi-root">
        <div className="grid-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="gi-nav">
          <div className="gi-logo" onClick={() => navigate('/')}>
            <div className="logo-dot" />
            Prep<span className="accent">AI</span>
          </div>
          <button className="nav-back" onClick={() => navigate('/dashboard')}>← dashboard</button>
        </nav>

        {/* MAIN */}
        <main className="gi-main">

          {/* PAGE HEADER */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.05s' }}>
            <div className="pg-eyebrow">◈ interview / generate</div>
            <h1 className="pg-title">
              <span style={{ display: 'block' }}>Generate</span>
              <span style={{ display: 'block' }} className="accent">Questions</span>
              <span style={{ display: 'block' }} className="outline">Instantly.</span>
            </h1>
            <p className="pg-sub">
              Enter any target role and PrepAI generates a tailored set of interview questions — no resume needed.
            </p>
          </div>

          {/* FORM CARD */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="card">
              <div className="card-body">
                <div className="sec-hd">
                  <span className="sec-num">01 /</span>
                  <span className="sec-ttl">Select a Role</span>
                  <div className="sec-rule" />
                </div>

                <form onSubmit={handleGenerate}>
                  <label className="field-label">Target role</label>
                  <input
                    className="field-input"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Product Manager, Data Scientist, SDE-2"
                    required
                  />

                  {/* Quick-pick chips */}
                  <div className="suggestions">
                    {ROLE_SUGGESTIONS.map((r) => (
                      <button
                        type="button"
                        key={r}
                        className={`sug-chip ${role === r ? 'active' : ''}`}
                        onClick={() => setRole(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="err-box" style={{ marginBottom: '18px' }}>
                      <span>◎</span><span>{error}</span>
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading || !role.trim()}>
                    {loading
                      ? <><div className="spinner" /> generating<span className="dot-anim" /></>
                      : <>◈ generate questions →</>
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className={`fade ${show ? 'show' : ''}`}>
              <div className="loading-card">
                <div className="loading-sym">◈</div>
                <div className="loading-txt">
                  Generating questions for <span className="loading-role">"{role}"</span>
                  <span className="dot-anim" />
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.68rem', color: 'rgba(238,238,245,0.2)', letterSpacing: '0.08em' }}>
                  This may take a few seconds
                </div>
              </div>
            </div>
          )}

          {/* RESULTS */}
          {questions.length > 0 && !loading && (
            <div className={`fade ${show ? 'show' : ''}`}>
              <div className="card">
                <div className="card-body">
                  <div className="results-header-row">
                    <div className="sec-hd" style={{ margin: 0, flex: 1 }}>
                      <span className="sec-num">02 /</span>
                      <span className="sec-ttl">Questions Ready</span>
                      <div className="sec-rule" />
                    </div>
                    <div className="results-meta">
                      <span className="role-tag">{role}</span>
                      <span className="results-badge">{questions.length} questions</span>
                      <button
                        className={`icon-btn ${copied ? 'copied' : ''}`}
                        onClick={handleCopy}
                      >
                        {copied ? '✓ copied' : '⊞ copy all'}
                      </button>
                    </div>
                  </div>

                  <div className="q-list">
                    {questions.map((q, i) => (
                      <div className="q-item" key={i}>
                        <span className="q-num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="q-text">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="actions-row" style={{ marginTop: '16px' }}>
                <button className="act-btn act-primary" onClick={handleStartInterview}>
                  ◉ start voice interview →
                </button>
                <button className="act-btn act-ghost" onClick={() => { setQuestions([]); setRole(""); setError(""); }}>
                  ◎ generate new
                </button>
                <button className="act-btn act-ghost" onClick={() => navigate('/upload-resume')}>
                  ◈ upload resume instead
                </button>
              </div>
            </div>
          )}

          {/* TIPS (shown before any results) */}
          {questions.length === 0 && !loading && (
            <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.25s' }}>
              <div className="sec-hd">
                <span className="sec-num">02 /</span>
                <span className="sec-ttl">Tips for best results</span>
                <div className="sec-rule" />
              </div>
              <div className="tips-grid">
                {[
                  { sym: '◈', title: 'Be specific', desc: 'Use exact role names like "SDE-2 at a product company" for more targeted questions.' },
                  { sym: '◎', title: 'Use suggestions', desc: 'Click any chip above to pre-fill a popular role and generate instantly.' },
                  { sym: '◉', title: 'Upload resume too', desc: 'For hyper-personalized questions matched to your experience, upload your resume instead.' },
                ].map((t) => (
                  <div className="tip-card" key={t.title}>
                    <div className="tip-sym">{t.sym}</div>
                    <div className="tip-title">{t.title}</div>
                    <div className="tip-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}