// /src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = "https://interview-backend-2vew.onrender.com";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Email might already exist or server is waking up.');
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'weak', 'good', 'strong'][strength];
  const strengthColor = ['', '#ff6b6b', '#fbbf24', '#b4ff64'][strength];

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

        .rg-root {
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
        .blob-1 { width: 500px; height: 500px; background: rgba(180,255,100,0.07); top: -200px; left: -120px; }
        .blob-2 { width: 360px; height: 360px; background: rgba(150,100,255,0.06); bottom: -80px; right: -80px; }

        /* NAV */
        .rg-nav {
          position: relative; z-index: 20;
          padding: 22px 56px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .rg-logo {
          font-family: var(--font-d); font-size: 1.4rem; font-weight: 800;
          letter-spacing: -0.04em; color: var(--text);
          display: flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .rg-logo .accent { color: var(--green); }
        .logo-dot {
          width: 8px; height: 8px; background: var(--green); border-radius: 50%;
          box-shadow: 0 0 10px var(--green); animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nav-hint { font-size: 0.74rem; color: var(--muted); letter-spacing: 0.04em; }
        .nav-hint span { color: var(--green); cursor: pointer; transition: opacity 0.15s; }
        .nav-hint span:hover { opacity: 0.7; }

        /* BODY */
        .rg-body {
          position: relative; z-index: 10; flex: 1;
          display: grid; grid-template-columns: 1fr 1fr;
          max-width: 1100px; margin: 0 auto; width: 100%;
          padding: 60px 56px 80px; gap: 80px; align-items: center;
        }

        .fade { opacity: 0; transform: translateY(22px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .fade.show { opacity: 1; transform: translateY(0); }
        .slide-right { opacity: 0; transform: translateX(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .slide-right.show { opacity: 1; transform: translateX(0); }

        /* FORM card */
        .form-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 40px 36px; position: relative; overflow: hidden;
        }
        .form-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--green), transparent 60%);
        }

        .form-eyebrow {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.18em;
          color: var(--green); margin-bottom: 10px;
        }
        .form-title { font-family: var(--font-d); font-size: 1.7rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
        .form-sub { font-size: 0.76rem; color: var(--muted); margin-top: 8px; margin-bottom: 28px; }

        /* Steps indicator */
        .steps-row { display: flex; gap: 6px; margin-bottom: 28px; }
        .step-pip {
          flex: 1; height: 3px; border-radius: 2px; background: var(--border);
          transition: background 0.4s;
        }
        .step-pip.active { background: var(--green); }

        /* Error */
        .err-box {
          background: var(--red-dim); border: 1px solid rgba(255,107,107,0.25);
          border-radius: 4px; padding: 11px 14px;
          font-size: 0.76rem; color: var(--red); margin-bottom: 20px;
          display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;
        }

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
        .field-input:focus { border-color: var(--border-bright); box-shadow: 0 0 0 3px rgba(180,255,100,0.06); }

        .pass-wrap { position: relative; }
        .pass-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          font-size: 0.68rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-m); letter-spacing: 0.08em; text-transform: uppercase;
          transition: color 0.15s;
        }
        .pass-toggle:hover { color: var(--green); }

        /* Password strength */
        .strength-row { display: flex; gap: 5px; margin-top: 8px; align-items: center; }
        .strength-seg { height: 3px; flex: 1; border-radius: 2px; background: var(--border); transition: background 0.3s; }
        .strength-lbl { font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; margin-left: 8px; transition: color 0.3s; min-width: 40px; }

        /* Submit */
        .submit-btn {
          width: 100%; padding: 13px; border-radius: 4px; cursor: pointer;
          font-family: var(--font-m); font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--green); border: 1px solid var(--green); color: #040407;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 24px; margin-bottom: 20px; position: relative; overflow: hidden;
        }
        .submit-btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.1); opacity: 0; transition: opacity 0.15s; }
        .submit-btn:hover:not(:disabled)::after { opacity: 1; }
        .submit-btn:hover:not(:disabled) { box-shadow: 0 0 24px var(--green-glow); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner { width: 14px; height: 14px; border: 2px solid rgba(4,4,7,0.3); border-top-color: #040407; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .form-divider { display: flex; align-items: center; gap: 12px; margin: 4px 0 18px; }
        .form-divider-line { flex: 1; height: 1px; background: var(--border); }
        .form-divider-txt { font-size: 0.62rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }

        .switch-txt { text-align: center; font-size: 0.74rem; color: var(--muted); letter-spacing: 0.03em; }
        .switch-link { color: var(--green); cursor: pointer; transition: opacity 0.15s; }
        .switch-link:hover { opacity: 0.7; }

        /* RIGHT PANEL */
        .right-eyebrow {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em;
          color: var(--green); margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .eyebrow-line { height: 1px; background: var(--border-bright); max-width: 40px; flex: 1; }

        .right-title {
          font-family: var(--font-d); font-size: clamp(2.2rem, 4vw, 3.4rem);
          font-weight: 800; letter-spacing: -0.04em; line-height: 0.95; margin-bottom: 20px;
        }
        .right-title .accent { color: var(--green); }
        .right-title .outline { -webkit-text-stroke: 1.5px rgba(238,238,245,0.25); color: transparent; }

        .right-sub { font-size: 0.85rem; color: var(--muted); line-height: 1.75; font-weight: 300; margin-bottom: 36px; max-width: 360px; }

        /* Perks list */
        .perks { display: flex; flex-direction: column; gap: 14px; }
        .perk { display: flex; align-items: flex-start; gap: 12px; }
        .perk-sym { color: var(--green); font-size: 0.8rem; flex-shrink: 0; margin-top: 1px; }
        .perk-text { font-size: 0.8rem; color: var(--muted); line-height: 1.5; }
        .perk-text strong { color: var(--text); font-weight: 500; display: block; margin-bottom: 2px; }

        @media (max-width: 820px) {
          .rg-nav { padding: 18px 24px; }
          .rg-body { grid-template-columns: 1fr; padding: 40px 24px 60px; gap: 40px; }
          .right-panel { display: none; }
        }
      `}</style>

      <div className="rg-root">
        <div className="grid-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="rg-nav">
          <div className="rg-logo" onClick={() => navigate('/')}>
            <div className="logo-dot" />
            Prep<span className="accent">AI</span>
          </div>
          <div className="nav-hint">
            Have an account? <span onClick={() => navigate('/login')}>sign in →</span>
          </div>
        </nav>

        {/* BODY */}
        <div className="rg-body">

          {/* LEFT — FORM */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.08s' }}>
            <div className="form-card">
              <div className="form-eyebrow">◎ new account</div>
              <div className="form-title">Get started.</div>
              <div className="form-sub">Create your PrepAI account — free forever.</div>

              {/* Progress pips */}
              <div className="steps-row">
                <div className={`step-pip ${name ? 'active' : ''}`} />
                <div className={`step-pip ${email ? 'active' : ''}`} />
                <div className={`step-pip ${password.length >= 6 ? 'active' : ''}`} />
              </div>

              {error && (
                <div className="err-box">
                  <span>◎</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="field">
                  <label className="field-label">Full name</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

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
                      placeholder="min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: '56px' }}
                    />
                    <button type="button" className="pass-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'hide' : 'show'}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="strength-row">
                      {[1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className="strength-seg"
                          style={{ background: strength >= lvl ? strengthColor : undefined }}
                        />
                      ))}
                      <span className="strength-lbl" style={{ color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <><div className="spinner" /> creating account...</> : <>create account →</>}
                </button>
              </form>

              <div className="form-divider">
                <div className="form-divider-line" />
                <span className="form-divider-txt">or</span>
                <div className="form-divider-line" />
              </div>

              <div className="switch-txt">
                Already have an account?{' '}
                <span className="switch-link" onClick={() => navigate('/login')}>sign in →</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={`right-panel slide-right ${show ? 'show' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="right-eyebrow">
              <div className="eyebrow-line" />
              Why PrepAI
              <div className="eyebrow-line" />
            </div>
            <h2 className="right-title">
              <span style={{ display: 'block' }}>Interview</span>
              <span style={{ display: 'block' }} className="accent">Smarter,</span>
              <span style={{ display: 'block' }} className="outline">Not Harder.</span>
            </h2>
            <p className="right-sub">
              Join thousands of candidates who use PrepAI to walk into interviews fully prepared.
            </p>
            <div className="perks">
              {[
                { sym: '◈', title: 'Resume-tailored questions', desc: 'Every question is generated from your actual resume, not generic templates.' },
                { sym: '◎', title: 'Real-time AI feedback', desc: 'Get scored on clarity, structure and confidence after every answer.' },
                { sym: '◉', title: 'Face & speech analysis', desc: 'Camera and mic coaching to sharpen your delivery, not just your words.' },
                { sym: '◐', title: 'Free to start', desc: 'No credit card. No catch. Start prepping in under 3 minutes.' },
              ].map((p) => (
                <div className="perk" key={p.title}>
                  <span className="perk-sym">{p.sym}</span>
                  <div className="perk-text">
                    <strong>{p.title}</strong>
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Register;