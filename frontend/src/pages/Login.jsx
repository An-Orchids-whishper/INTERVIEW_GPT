// /src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = "https://interview-backend-2vew.onrender.com";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      if (remember) localStorage.setItem('rememberMe', true);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials or server is waking up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fira+Code:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #040407;
          --surface: #0c0c18;
          --surface2: #10101f;
          --border: rgba(255,255,255,0.06);
          --border-bright: rgba(180,255,100,0.25);
          --green: #b4ff64;
          --green-dim: rgba(180,255,100,0.10);
          --green-glow: rgba(180,255,100,0.25);
          --text: #eeeef5;
          --muted: rgba(238,238,245,0.4);
          --red: #ff6b6b;
          --red-dim: rgba(255,107,107,0.10);
          --font-d: 'Syne', sans-serif;
          --font-m: 'Fira Code', monospace;
        }

        body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        .lg-root {
          min-height: 100vh; background: var(--bg); font-family: var(--font-m);
          display: flex; flex-direction: column; position: relative; overflow: hidden;
        }

        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(180,255,100,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,255,100,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .blob { position: fixed; border-radius: 50%; filter: blur(110px); pointer-events: none; z-index: 0; }
        .blob-1 { width: 480px; height: 480px; background: rgba(180,255,100,0.07); top: -180px; right: -120px; }
        .blob-2 { width: 360px; height: 360px; background: rgba(100,120,255,0.06); bottom: -80px; left: -80px; }

        /* NAV */
        .lg-nav {
          position: relative; z-index: 20;
          padding: 22px 56px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .lg-logo {
          font-family: var(--font-d); font-size: 1.4rem; font-weight: 800;
          letter-spacing: -0.04em; color: var(--text);
          display: flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .lg-logo .accent { color: var(--green); }
        .logo-dot {
          width: 8px; height: 8px; background: var(--green); border-radius: 50%;
          box-shadow: 0 0 10px var(--green); animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nav-hint { font-size: 0.74rem; color: var(--muted); letter-spacing: 0.04em; }
        .nav-hint span { color: var(--green); cursor: pointer; transition: opacity 0.15s; }
        .nav-hint span:hover { opacity: 0.7; }

        /* BODY */
        .lg-body {
          position: relative; z-index: 10; flex: 1;
          display: grid; grid-template-columns: 1fr 1fr;
          max-width: 1100px; margin: 0 auto; width: 100%;
          padding: 60px 56px 80px; gap: 80px; align-items: center;
        }

        /* LEFT PANEL */
        .fade { opacity: 0; transform: translateY(22px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .fade.show { opacity: 1; transform: translateY(0); }
        .slide-left { opacity: 0; transform: translateX(-30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .slide-left.show { opacity: 1; transform: translateX(0); }

        .left-eyebrow {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em;
          color: var(--green); margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .eyebrow-line { flex: 1; height: 1px; background: var(--border-bright); max-width: 40px; }

        .left-title {
          font-family: var(--font-d); font-size: clamp(2.4rem, 4vw, 3.6rem);
          font-weight: 800; letter-spacing: -0.04em; line-height: 0.95; margin-bottom: 20px;
        }
        .left-title .accent { color: var(--green); }
        .left-title .outline { -webkit-text-stroke: 1.5px rgba(238,238,245,0.25); color: transparent; }

        .left-sub {
          font-size: 0.85rem; color: var(--muted); line-height: 1.75; font-weight: 300;
          margin-bottom: 40px; max-width: 360px;
        }

        /* Terminal preview on left */
        .mini-terminal {
          background: var(--surface); border: 1px solid var(--border); border-radius: 6px; overflow: hidden;
        }
        .mini-term-bar {
          background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border);
          padding: 8px 14px; display: flex; align-items: center; gap: 6px;
        }
        .mtdot { width: 8px; height: 8px; border-radius: 50%; }
        .mt-r{background:#ff5f57} .mt-y{background:#febc2e} .mt-g{background:#28c840}
        .mini-term-ttl { font-size: 0.64rem; color: var(--muted); margin-left: auto; letter-spacing: 0.08em; }
        .mini-term-body { padding: 16px 18px; font-size: 0.74rem; line-height: 1.9; }
        .mt-prompt { color: var(--green); margin-right: 8px; }
        .mt-cmd { color: var(--text); }
        .mt-out { color: rgba(238,238,245,0.45); padding-left: 18px; }
        .mt-key { color: #60a5fa; }
        .mt-val { color: var(--green); }
        .mt-cursor {
          display: inline-block; width: 7px; height: 13px;
          background: var(--green); margin-left: 2px; vertical-align: middle;
          animation: cursor-blink 1s step-end infinite;
        }
        @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* RIGHT — FORM */
        .form-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 40px 36px; position: relative; overflow: hidden;
        }
        .form-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--green), transparent 60%);
        }

        .form-header { margin-bottom: 32px; }
        .form-eyebrow {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.18em;
          color: var(--green); margin-bottom: 10px;
        }
        .form-title {
          font-family: var(--font-d); font-size: 1.7rem; font-weight: 800;
          letter-spacing: -0.04em; line-height: 1;
        }
        .form-sub { font-size: 0.76rem; color: var(--muted); margin-top: 8px; letter-spacing: 0.02em; }

        /* Error */
        .err-box {
          background: var(--red-dim); border: 1px solid rgba(255,107,107,0.25);
          border-radius: 4px; padding: 11px 14px;
          font-size: 0.76rem; color: var(--red); margin-bottom: 22px;
          display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;
        }
        .err-sym { flex-shrink: 0; }

        /* Field */
        .field { margin-bottom: 18px; }
        .field-label {
          font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--muted); margin-bottom: 8px; display: block;
        }
        .field-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 4px; padding: 11px 14px;
          font-family: var(--font-m); font-size: 0.82rem; color: var(--text);
          transition: border-color 0.2s, box-shadow 0.2s; outline: none;
          letter-spacing: 0.03em;
        }
        .field-input::placeholder { color: rgba(238,238,245,0.2); }
        .field-input:focus {
          border-color: var(--border-bright);
          box-shadow: 0 0 0 3px rgba(180,255,100,0.06);
        }

        .pass-wrap { position: relative; }
        .pass-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          font-size: 0.68rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-m); letter-spacing: 0.08em;
          text-transform: uppercase; transition: color 0.15s;
        }
        .pass-toggle:hover { color: var(--green); }

        /* Options row */
        .opts-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px; flex-wrap: wrap; gap: 10px;
        }
        .remember-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.74rem; color: var(--muted); cursor: pointer; user-select: none;
        }
        .custom-check {
          width: 14px; height: 14px; border: 1px solid var(--border);
          border-radius: 2px; background: var(--surface2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: border-color 0.15s, background 0.15s;
          cursor: pointer;
        }
        .custom-check.checked { background: var(--green); border-color: var(--green); }
        .custom-check.checked::after { content: '✓'; font-size: 0.6rem; color: #040407; font-weight: 700; }
        .forgot-btn {
          font-size: 0.72rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-m); letter-spacing: 0.05em;
          transition: color 0.15s;
        }
        .forgot-btn:hover { color: var(--green); }

        /* Submit */
        .submit-btn {
          width: 100%; padding: 13px; border-radius: 4px; cursor: pointer;
          font-family: var(--font-m); font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--green); border: 1px solid var(--green); color: #040407;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 20px; position: relative; overflow: hidden;
        }
        .submit-btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.1); opacity: 0; transition: opacity 0.15s; }
        .submit-btn:hover:not(:disabled)::after { opacity: 1; }
        .submit-btn:hover:not(:disabled) { box-shadow: 0 0 24px var(--green-glow); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Spinner */
        .spinner {
          width: 14px; height: 14px; border: 2px solid rgba(4,4,7,0.3);
          border-top-color: #040407; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .switch-txt { text-align: center; font-size: 0.74rem; color: var(--muted); letter-spacing: 0.03em; }
        .switch-link { color: var(--green); cursor: pointer; transition: opacity 0.15s; }
        .switch-link:hover { opacity: 0.7; }

        /* Divider */
        .form-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .form-divider-line { flex: 1; height: 1px; background: var(--border); }
        .form-divider-txt { font-size: 0.62rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }

        @media (max-width: 820px) {
          .lg-nav { padding: 18px 24px; }
          .lg-body { grid-template-columns: 1fr; padding: 40px 24px 60px; gap: 40px; }
          .left-panel { display: none; }
        }
      `}</style>

      <div className="lg-root">
        <div className="grid-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="lg-nav">
          <div className="lg-logo" onClick={() => navigate('/')}>
            <div className="logo-dot" />
            Prep<span className="accent">AI</span>
          </div>
          <div className="nav-hint">
            No account? <span onClick={() => navigate('/register')}>register →</span>
          </div>
        </nav>

        {/* BODY */}
        <div className="lg-body">

          {/* LEFT */}
          <div className={`left-panel slide-left ${show ? 'show' : ''}`}>
            <div className="left-eyebrow">
              <div className="eyebrow-line" />
              Sign in to PrepAI
              <div className="eyebrow-line" />
            </div>
            <h2 className="left-title">
              <span style={{ display: 'block' }}>Back to</span>
              <span style={{ display: 'block' }} className="accent">Prepping</span>
              <span style={{ display: 'block' }} className="outline">Hard.</span>
            </h2>
            <p className="left-sub">
              Your sessions, resume scores, and AI feedback are waiting. Pick up right where you left off.
            </p>
            <div className="mini-terminal">
              <div className="mini-term-bar">
                <div className="mtdot mt-r" /><div className="mtdot mt-y" /><div className="mtdot mt-g" />
                <span className="mini-term-ttl">session restore</span>
              </div>
              <div className="mini-term-body">
                <div><span className="mt-prompt">›</span><span className="mt-cmd">loading profile...</span></div>
                <div className="mt-out"><span className="mt-key">sessions</span>: <span className="mt-val">12 completed</span></div>
                <div className="mt-out"><span className="mt-key">resume_score</span>: <span className="mt-val">8.4 / 10</span></div>
                <div className="mt-out"><span className="mt-key">status</span>: <span className="mt-val">ready</span></div>
                <div><span className="mt-prompt">›</span><span className="mt-cmd">awaiting auth <span className="mt-cursor" /></span></div>
              </div>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="form-card">
              <div className="form-header">
                <div className="form-eyebrow">◈ authentication</div>
                <div className="form-title">Welcome back.</div>
                <div className="form-sub">Sign in to continue to PrepAI</div>
              </div>

              {error && (
                <div className="err-box">
                  <span className="err-sym">◎</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="field">
                  <label className="field-label">Email address</label>
                  <input
                    className="field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Password</label>
                  <div className="pass-wrap">
                    <input
                      className="field-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: '56px' }}
                    />
                    <button type="button" className="pass-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'hide' : 'show'}
                    </button>
                  </div>
                </div>

                <div className="opts-row">
                  <label className="remember-label" onClick={() => setRemember(!remember)}>
                    <div className={`custom-check ${remember ? 'checked' : ''}`} />
                    Remember me
                  </label>
                  <button type="button" className="forgot-btn" onClick={() => alert('Forgot password feature coming soon!')}>
                    forgot password?
                  </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <><div className="spinner" /> signing in...</> : <>sign in →</>}
                </button>
              </form>

              <div className="form-divider">
                <div className="form-divider-line" />
                <span className="form-divider-txt">or</span>
                <div className="form-divider-line" />
              </div>

              <div className="switch-txt">
                No account yet?{' '}
                <span className="switch-link" onClick={() => navigate('/register')}>create one →</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;