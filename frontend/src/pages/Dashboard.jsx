// /src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://prepai-pink.vercel.app";

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [resumeRating, setResumeRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
        setInterviews(res.data.interviews);
        setStats(res.data.stats);
        setResumeRating(res.data.resumeRating);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
    };
    fetchData();
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...';
  const formatDateTime = (d) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fira+Code:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #040407;
          --bg2: #07070e;
          --surface: #0c0c18;
          --surface2: #10101f;
          --border: rgba(255,255,255,0.06);
          --border-bright: rgba(180,255,100,0.25);
          --green: #b4ff64;
          --green-dim: rgba(180,255,100,0.12);
          --green-glow: rgba(180,255,100,0.25);
          --text: #eeeef5;
          --muted: rgba(238,238,245,0.4);
          --font-d: 'Syne', sans-serif;
          --font-m: 'Fira Code', monospace;
        }

        body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        .db-root { min-height: 100vh; background: var(--bg); font-family: var(--font-m); position: relative; overflow-x: hidden; }

        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(180,255,100,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,255,100,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .blob { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: rgba(180,255,100,0.06); top: -200px; right: -100px; }
        .blob-2 { width: 400px; height: 400px; background: rgba(100,120,255,0.05); bottom: -100px; left: -100px; }

        /* NAV */
        .db-nav {
          position: relative; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 56px; border-bottom: 1px solid var(--border);
        }
        .db-logo {
          font-family: var(--font-d); font-size: 1.4rem; font-weight: 800;
          letter-spacing: -0.04em; color: var(--text);
          display: flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .db-logo .accent { color: var(--green); }
        .logo-dot {
          width: 8px; height: 8px; background: var(--green); border-radius: 50%;
          box-shadow: 0 0 10px var(--green); animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .nav-right { display: flex; align-items: center; gap: 10px; }
        .user-chip {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 4px; padding: 7px 14px;
          font-size: 0.74rem; color: var(--muted); letter-spacing: 0.04em;
        }
        .user-chip .chip-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; box-shadow: 0 0 6px var(--green); flex-shrink: 0; }
        .logout-btn {
          font-family: var(--font-m); font-size: 0.74rem; font-weight: 500;
          padding: 7px 18px; border-radius: 4px; cursor: pointer; letter-spacing: 0.05em;
          background: transparent; border: 1px solid var(--border); color: var(--muted);
          transition: all 0.18s;
        }
        .logout-btn:hover { border-color: rgba(255,100,100,0.4); color: #ff6b6b; }

        /* MAIN */
        .db-main {
          position: relative; z-index: 10;
          max-width: 1100px; margin: 0 auto;
          padding: 52px 56px 80px;
          display: flex; flex-direction: column; gap: 36px;
        }

        /* Fade-in */
        .fade { opacity: 0; transform: translateY(22px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade.show { opacity: 1; transform: translateY(0); }

        /* Section header */
        .sec-hd { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
        .sec-num { font-size: 0.66rem; color: var(--green); letter-spacing: 0.18em; flex-shrink: 0; }
        .sec-ttl { font-family: var(--font-d); font-size: 1.3rem; font-weight: 800; letter-spacing: -0.03em; }
        .sec-rule { flex: 1; height: 1px; background: var(--border); margin-left: 4px; }

        /* WELCOME */
        .welcome-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 32px 36px;
          display: flex; align-items: center; justify-content: space-between; gap: 28px;
          position: relative; overflow: hidden;
        }
        .welcome-card::after {
          content: '';
          position: absolute; top: 0; right: 0; bottom: 0; width: 40%;
          background: linear-gradient(135deg, transparent 40%, rgba(180,255,100,0.03));
          pointer-events: none;
        }
        .w-eyebrow {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em;
          color: var(--green); margin-bottom: 10px;
        }
        .w-name {
          font-family: var(--font-d); font-size: clamp(1.8rem, 3vw, 2.8rem);
          font-weight: 800; letter-spacing: -0.04em; line-height: 1; margin-bottom: 16px;
        }
        .w-meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .w-meta-item { display: flex; align-items: center; gap: 7px; font-size: 0.74rem; color: var(--muted); }
        .w-meta-sym { color: var(--green); font-size: 0.68rem; }

        .resume-badge {
          flex-shrink: 0; text-align: center;
          background: var(--green-dim); border: 1px solid var(--border-bright);
          border-radius: 8px; padding: 22px 30px; min-width: 120px;
        }
        .badge-num {
          font-family: var(--font-d); font-size: 2.8rem; font-weight: 800;
          color: var(--green); letter-spacing: -0.04em; line-height: 1;
        }
        .badge-lbl { font-size: 0.62rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; margin-top: 6px; }

        /* STATS */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .stat-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 26px 24px; position: relative; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s;
        }
        .stat-card:hover { border-color: var(--border-bright); transform: translateY(-3px); }
        .stat-card::before {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--green), transparent);
          transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
        }
        .stat-card:hover::before { transform: scaleX(1); }
        .stat-sym { position: absolute; top: 18px; right: 18px; font-size: 1.1rem; color: var(--green); opacity: 0.25; }
        .stat-lbl { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--muted); margin-bottom: 12px; }
        .stat-val { font-family: var(--font-d); font-size: 2.6rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
        .stat-unit { font-size: 1.1rem; color: var(--muted); margin-left: 3px; font-family: var(--font-m); }
        .stat-sub { font-size: 0.68rem; color: var(--muted); margin-top: 8px; }

        /* INTERVIEWS */
        .interviews-wrap {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
        }
        .interviews-top {
          padding: 18px 26px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .interviews-ttl { font-family: var(--font-d); font-size: 0.95rem; font-weight: 800; letter-spacing: -0.02em; }
        .interviews-badge {
          font-size: 0.64rem; letter-spacing: 0.1em;
          background: var(--green-dim); border: 1px solid var(--border-bright);
          color: var(--green); padding: 3px 10px; border-radius: 2px;
        }

        .empty-state { padding: 52px; text-align: center; }
        .empty-sym { font-size: 2rem; color: var(--green); opacity: 0.2; margin-bottom: 12px; }
        .empty-txt { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.05em; }

        .interview-row {
          padding: 16px 26px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          cursor: pointer; transition: background 0.18s;
        }
        .interview-row:last-child { border-bottom: none; }
        .interview-row:hover { background: var(--surface2); }
        .interview-row:hover .row-arrow { opacity: 1; transform: translateX(0); }

        .row-left { display: flex; align-items: center; gap: 16px; }
        .row-idx { font-size: 0.62rem; color: var(--green); opacity: 0.6; width: 24px; flex-shrink: 0; letter-spacing: 0.08em; }
        .row-role { font-size: 0.88rem; font-weight: 500; color: var(--text); }
        .row-date { font-size: 0.7rem; color: var(--muted); margin-top: 3px; }
        .row-right { display: flex; align-items: center; gap: 10px; }
        .row-pill {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em;
          background: rgba(180,255,100,0.07); border: 1px solid rgba(180,255,100,0.14);
          color: var(--green); padding: 3px 9px; border-radius: 2px;
        }
        .row-arrow { font-size: 0.78rem; color: var(--muted); opacity: 0; transform: translateX(-5px); transition: all 0.2s; }

        /* ACTIONS */
        .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .act-btn {
          font-family: var(--font-m); font-size: 0.8rem; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase;
          padding: 17px 24px; border-radius: 4px; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
          position: relative; overflow: hidden;
        }
        .act-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .act-btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.07); opacity: 0; transition: opacity 0.18s; }
        .act-btn:hover:not(:disabled)::after { opacity: 1; }

        .act-generate {
          background: var(--green); border: 1px solid var(--green); color: #040407; font-weight: 700;
        }
        .act-generate:hover:not(:disabled) { box-shadow: 0 0 28px var(--green-glow); }

        .act-upload {
          background: transparent; border: 1px solid var(--border-bright); color: var(--text);
        }
        .act-upload:hover { border-color: var(--green); color: var(--green); background: var(--green-dim); }

        @media (max-width: 820px) {
          .db-nav { padding: 18px 24px; }
          .db-main { padding: 32px 24px 60px; }
          .welcome-card { flex-direction: column; align-items: flex-start; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .actions-grid { grid-template-columns: 1fr; }
          .user-chip span { display: none; }
        }
        @media (max-width: 520px) { .stats-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="db-root">
        <div className="grid-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="db-nav">
          <div className="db-logo" onClick={() => navigate('/')}>
            <div className="logo-dot" />
            Prep<span className="accent">AI</span>
          </div>
          <div className="nav-right">
            <div className="user-chip">
              <div className="chip-dot" />
              <span>{user.email || 'loading...'}</span>
            </div>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>
              logout
            </button>
          </div>
        </nav>

        {/* MAIN */}
        <main className="db-main">

          {/* WELCOME */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.08s' }}>
            <div className="welcome-card">
              <div>
                <div className="w-eyebrow">◈ dashboard / overview</div>
                <div className="w-name">
                  {user.name ? `Hey, ${user.name}.` : 'Welcome back.'}
                </div>
                <div className="w-meta">
                  <div className="w-meta-item"><span className="w-meta-sym">◎</span>{user.email || '—'}</div>
                  <div className="w-meta-item"><span className="w-meta-sym">◉</span>Joined {formatDate(user.createdAt)}</div>
                </div>
              </div>
              {resumeRating !== null && (
                <div className="resume-badge">
                  <div className="badge-num">{resumeRating}</div>
                  <div className="badge-lbl">Resume Score</div>
                </div>
              )}
            </div>
          </div>

          {/* STATS */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.18s' }}>
            <div className="sec-hd">
              <span className="sec-num">01 /</span>
              <span className="sec-ttl">Your Stats</span>
              <div className="sec-rule" />
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-sym">◈</div>
                <div className="stat-lbl">Total Interviews</div>
                <div className="stat-val">{stats.totalInterviews ?? 0}</div>
                <div className="stat-sub">sessions completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-sym">◎</div>
                <div className="stat-lbl">Resume Rating</div>
                <div className="stat-val">
                  {resumeRating ?? '—'}
                  {resumeRating !== null && <span className="stat-unit">/10</span>}
                </div>
                <div className="stat-sub">AI-evaluated score</div>
              </div>
              <div className="stat-card">
                <div className="stat-sym">◉</div>
                <div className="stat-lbl">Last Session</div>
                <div className="stat-val" style={{ fontSize: '1.5rem', paddingTop: '6px' }}>
                  {interviews.length > 0
                    ? new Date(interviews[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                </div>
                <div className="stat-sub">most recent interview</div>
              </div>
            </div>
          </div>

          {/* RECENT INTERVIEWS */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.28s' }}>
            <div className="sec-hd">
              <span className="sec-num">02 /</span>
              <span className="sec-ttl">Recent Interviews</span>
              <div className="sec-rule" />
            </div>
            <div className="interviews-wrap">
              <div className="interviews-top">
                <span className="interviews-ttl">Session History</span>
                <span className="interviews-badge">{interviews.length} sessions</span>
              </div>
              {interviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-sym">◐</div>
                  <div className="empty-txt">No interviews yet. Generate your first session below.</div>
                </div>
              ) : (
                <div>
                  {interviews.map((item, idx) => (
                    <div className="interview-row" key={idx} onClick={() => navigate(`/interview/${item._id}`)}>
                      <div className="row-left">
                        <span className="row-idx">{String(idx + 1).padStart(2, '0')}</span>
                        <div>
                          <div className="row-role">{item.role}</div>
                          <div className="row-date">{formatDateTime(item.createdAt)}</div>
                        </div>
                      </div>
                      <div className="row-right">
                        <span className="row-pill">completed</span>
                        <span className="row-arrow">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.38s' }}>
            <div className="sec-hd">
              <span className="sec-num">03 /</span>
              <span className="sec-ttl">Quick Actions</span>
              <div className="sec-rule" />
            </div>
            <div className="actions-grid">
              <button className="act-btn act-generate" onClick={() => navigate('/generate')} disabled={loading}>
                <span>◈</span>
                {loading ? 'generating...' : 'Generate Interview'}
              </button>
              <button className="act-btn act-upload" onClick={() => navigate('/upload-resume')}>
                <span>◎</span>
                Upload Resume
              </button>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default Dashboard;