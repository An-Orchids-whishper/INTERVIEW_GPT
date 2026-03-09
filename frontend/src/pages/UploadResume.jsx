// /src/pages/UploadResume.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://interview-backend-2vew.onrender.com";

// Steps: 0 = upload, 1 = uploaded/choose action, 2 = review result, 3 = questions ready
const STEP = { UPLOAD: 0, READY: 1, REVIEW: 2, QUESTIONS: 3 };

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [reviewResult, setReviewResult] = useState("");
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [step, setStep] = useState(STEP.UPLOAD);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // STEP 1: Upload + generate questions
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file first.");
    if (!role.trim()) return setError("Please enter a target role.");
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/upload/resume`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      const { questions: qs, answers } = res.data;
      setQuestions(qs);
      localStorage.setItem("resumeQuestions", JSON.stringify(qs));
      localStorage.setItem("resumeAnswers", JSON.stringify(answers));
      localStorage.setItem("resumeRole", role);
      setStep(STEP.READY);
    } catch (err) {
      setError("Failed to generate questions. Check if the file is a valid PDF and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Review resume (only after upload)
  const handleReview = async () => {
    if (!file) return;
    setError("");
    setLoadingReview(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/upload/review`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      setReviewResult(res.data.review);
      setRating(res.data.rating);
      setStep(STEP.REVIEW);
    } catch (err) {
      setError("Review failed. Backend might be waking up — please try again in 30s.");
      console.error(err);
    } finally {
      setLoadingReview(false);
    }
  };

  const ratingColor =
    rating >= 8 ? "#b4ff64" : rating >= 5 ? "#fbbf24" : "#ff6b6b";

  const resetAll = () => {
    setFile(null); setRole(""); setQuestions([]);
    setReviewResult(""); setRating(null); setError("");
    setStep(STEP.UPLOAD);
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
          --yellow: #fbbf24;
          --font-d: 'Syne', sans-serif;
          --font-m: 'Fira Code', monospace;
        }

        body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

        .ur-root {
          min-height: 100vh; background: var(--bg); font-family: var(--font-m);
          display: flex; flex-direction: column; position: relative; overflow-x: hidden;
        }

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
        .ur-nav {
          position: relative; z-index: 20;
          padding: 22px 56px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .ur-logo {
          font-family: var(--font-d); font-size: 1.4rem; font-weight: 800;
          letter-spacing: -0.04em; color: var(--text);
          display: flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .ur-logo .accent { color: var(--green); }
        .logo-dot {
          width: 8px; height: 8px; background: var(--green); border-radius: 50%;
          box-shadow: 0 0 10px var(--green); animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nav-back {
          font-size: 0.74rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-m); letter-spacing: 0.05em;
          transition: color 0.15s; display: flex; align-items: center; gap: 6px;
        }
        .nav-back:hover { color: var(--green); }

        /* MAIN */
        .ur-main {
          position: relative; z-index: 10; flex: 1;
          max-width: 820px; margin: 0 auto; width: 100%;
          padding: 56px 40px 80px;
          display: flex; flex-direction: column; gap: 0;
        }

        /* Fade */
        .fade { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade.show { opacity: 1; transform: translateY(0); }

        /* Page header */
        .pg-eyebrow {
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em;
          color: var(--green); margin-bottom: 12px;
        }
        .pg-title {
          font-family: var(--font-d); font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 800; letter-spacing: -0.04em; line-height: 1; margin-bottom: 10px;
        }
        .pg-title .accent { color: var(--green); }
        .pg-sub { font-size: 0.82rem; color: var(--muted); line-height: 1.6; margin-bottom: 40px; }

        /* PROGRESS STEPPER */
        .stepper {
          display: flex; align-items: center; gap: 0; margin-bottom: 40px;
        }
        .step-item { display: flex; align-items: center; gap: 0; }
        .step-circle {
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid var(--border); background: var(--surface);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.62rem; color: var(--muted); letter-spacing: 0;
          transition: all 0.3s; flex-shrink: 0;
        }
        .step-circle.active { border-color: var(--green); color: var(--green); box-shadow: 0 0 10px rgba(180,255,100,0.2); }
        .step-circle.done { background: var(--green); border-color: var(--green); color: #040407; font-weight: 700; }
        .step-label { font-size: 0.64rem; color: var(--muted); margin-left: 8px; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.3s; white-space: nowrap; }
        .step-label.active { color: var(--green); }
        .step-connector { flex: 1; height: 1px; background: var(--border); margin: 0 12px; min-width: 20px; transition: background 0.3s; }
        .step-connector.done { background: rgba(180,255,100,0.3); }

        /* CARD */
        .card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          overflow: hidden; position: relative; margin-bottom: 20px;
        }
        .card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--green), transparent 60%);
        }
        .card-body { padding: 32px 36px; }

        /* Section header inside card */
        .card-sec { display: flex; align-items: baseline; gap: 10px; margin-bottom: 24px; }
        .card-sec-num { font-size: 0.64rem; color: var(--green); letter-spacing: 0.16em; }
        .card-sec-ttl { font-family: var(--font-d); font-size: 1.1rem; font-weight: 800; letter-spacing: -0.02em; }
        .card-sec-rule { flex: 1; height: 1px; background: var(--border); margin-left: 6px; }

        /* DROP ZONE */
        .dropzone {
          border: 1px dashed var(--border-bright); border-radius: 6px;
          padding: 36px 24px; text-align: center; cursor: pointer;
          transition: all 0.2s; margin-bottom: 20px; position: relative;
          background: var(--green-dim);
        }
        .dropzone:hover, .dropzone.dragover {
          border-color: var(--green);
          background: rgba(180,255,100,0.07);
          box-shadow: 0 0 20px rgba(180,255,100,0.08);
        }
        .dropzone-icon { font-size: 1.8rem; color: var(--green); opacity: 0.6; margin-bottom: 10px; }
        .dropzone-txt { font-size: 0.8rem; color: var(--muted); line-height: 1.6; }
        .dropzone-txt span { color: var(--green); }
        .dropzone-hint { font-size: 0.66rem; color: var(--muted); margin-top: 6px; letter-spacing: 0.06em; opacity: 0.7; }
        input[type="file"] { display: none; }

        /* File selected badge */
        .file-badge {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--green-dim); border: 1px solid var(--border-bright);
          border-radius: 4px; padding: 10px 14px; margin-bottom: 20px;
        }
        .file-badge-left { display: flex; align-items: center; gap: 10px; }
        .file-badge-sym { color: var(--green); font-size: 0.9rem; }
        .file-badge-name { font-size: 0.78rem; color: var(--text); letter-spacing: 0.02em; }
        .file-badge-size { font-size: 0.66rem; color: var(--muted); margin-top: 2px; }
        .file-badge-remove {
          font-size: 0.66rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-m); letter-spacing: 0.1em;
          text-transform: uppercase; transition: color 0.15s;
        }
        .file-badge-remove:hover { color: var(--red); }

        /* Field */
        .field { margin-bottom: 20px; }
        .field-label { font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 8px; display: block; }
        .field-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 4px; padding: 11px 14px;
          font-family: var(--font-m); font-size: 0.82rem; color: var(--text);
          transition: border-color 0.2s, box-shadow 0.2s; outline: none; letter-spacing: 0.03em;
        }
        .field-input::placeholder { color: rgba(238,238,245,0.2); }
        .field-input:focus { border-color: var(--border-bright); box-shadow: 0 0 0 3px rgba(180,255,100,0.06); }

        /* Error */
        .err-box {
          background: var(--red-dim); border: 1px solid rgba(255,107,107,0.25);
          border-radius: 4px; padding: 11px 14px; margin-bottom: 18px;
          font-size: 0.76rem; color: var(--red); display: flex; gap: 8px; line-height: 1.5;
        }

        /* Buttons */
        .btn {
          font-family: var(--font-m); font-size: 0.8rem; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 13px 24px; border-radius: 4px; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 9px;
          position: relative; overflow: hidden;
        }
        .btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.07); opacity: 0; transition: opacity 0.15s; }
        .btn:hover:not(:disabled)::after { opacity: 1; }
        .btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-primary { background: var(--green); border: 1px solid var(--green); color: #040407; font-weight: 700; width: 100%; }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 0 24px var(--green-glow); }

        .btn-ghost { background: transparent; border: 1px solid var(--border-bright); color: var(--text); }
        .btn-ghost:hover:not(:disabled) { border-color: var(--green); color: var(--green); background: var(--green-dim); }

        .btn-ghost-red { background: transparent; border: 1px solid rgba(255,107,107,0.25); color: var(--muted); }
        .btn-ghost-red:hover { border-color: var(--red); color: var(--red); }

        .btn-blue { background: transparent; border: 1px solid rgba(96,165,250,0.3); color: #93c5fd; }
        .btn-blue:hover { border-color: #60a5fa; background: rgba(96,165,250,0.07); }

        .spinner { width: 13px; height: 13px; border: 2px solid rgba(4,4,7,0.3); border-top-color: #040407; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .spinner-w { width: 13px; height: 13px; border: 2px solid rgba(238,238,245,0.15); border-top-color: var(--text); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ACTION GRID (after upload) */
        .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 4px; }

        .action-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 26px 24px; cursor: pointer; transition: border-color 0.2s, transform 0.2s, background 0.2s;
          text-align: left; font-family: var(--font-m);
          display: flex; flex-direction: column; gap: 10px;
          position: relative; overflow: hidden;
        }
        .action-card:hover:not(:disabled) { border-color: var(--border-bright); transform: translateY(-3px); }
        .action-card:disabled { opacity: 0.45; cursor: not-allowed; }
        .action-card-icon { font-size: 1.4rem; }
        .action-card-ttl { font-family: var(--font-d); font-size: 1rem; font-weight: 800; letter-spacing: -0.02em; }
        .action-card-desc { font-size: 0.74rem; color: var(--muted); line-height: 1.5; }
        .action-card-arrow { font-size: 0.75rem; color: var(--green); margin-top: 4px; }
        .action-card.green-card { border-color: rgba(180,255,100,0.18); }
        .action-card.green-card:hover:not(:disabled) { border-color: var(--green); background: var(--green-dim); }
        .action-card.blue-card:hover:not(:disabled) { border-color: rgba(96,165,250,0.4); background: rgba(96,165,250,0.05); }
        .action-card.blue-card .action-card-arrow { color: #60a5fa; }

        /* REVIEW RESULT */
        .review-block {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          overflow: hidden; margin-bottom: 20px;
        }
        .review-block-header {
          padding: 16px 28px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .review-block-ttl { font-family: var(--font-d); font-size: 0.95rem; font-weight: 800; letter-spacing: -0.02em; }
        .review-block-body { padding: 28px; font-size: 0.82rem; color: rgba(238,238,245,0.75); line-height: 1.85; white-space: pre-wrap; font-weight: 300; }

        /* RATING */
        .rating-block {
          background: var(--green-dim); border: 1px solid var(--border-bright); border-radius: 8px;
          padding: 28px; text-align: center; margin-bottom: 20px;
        }
        .rating-lbl { font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.18em; color: var(--green); margin-bottom: 12px; }
        .rating-num { font-family: var(--font-d); font-size: 5rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em; }
        .rating-denom { font-size: 1.4rem; color: var(--muted); font-family: var(--font-m); }
        .rating-sub { font-size: 0.72rem; color: var(--muted); margin-top: 8px; }

        /* QUESTIONS LIST */
        .questions-block {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 20px;
        }
        .questions-header {
          padding: 16px 28px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .questions-ttl { font-family: var(--font-d); font-size: 0.95rem; font-weight: 800; letter-spacing: -0.02em; }
        .q-badge {
          font-size: 0.62rem; background: var(--green-dim); border: 1px solid var(--border-bright);
          color: var(--green); padding: 3px 9px; border-radius: 2px; letter-spacing: 0.08em;
        }
        .q-list { display: flex; flex-direction: column; }
        .q-item {
          padding: 16px 28px; border-bottom: 1px solid var(--border);
          display: flex; gap: 16px; align-items: flex-start;
        }
        .q-item:last-child { border-bottom: none; }
        .q-num { font-size: 0.62rem; color: var(--green); opacity: 0.6; width: 22px; flex-shrink: 0; padding-top: 2px; }
        .q-text { font-size: 0.82rem; color: rgba(238,238,245,0.8); line-height: 1.6; font-weight: 300; }

        /* Reset row */
        .reset-row { display: flex; justify-content: center; margin-top: 8px; }
        .reset-btn {
          font-size: 0.7rem; color: var(--muted); background: none; border: none;
          cursor: pointer; font-family: var(--font-m); letter-spacing: 0.08em;
          transition: color 0.15s; display: flex; align-items: center; gap: 6px;
        }
        .reset-btn:hover { color: var(--red); }

        @media (max-width: 640px) {
          .ur-nav { padding: 18px 24px; }
          .ur-main { padding: 36px 20px 60px; }
          .card-body { padding: 24px 20px; }
          .action-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ur-root">
        <div className="grid-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="ur-nav">
          <div className="ur-logo" onClick={() => navigate('/')}>
            <div className="logo-dot" />
            Prep<span className="accent">AI</span>
          </div>
          <button className="nav-back" onClick={() => navigate('/dashboard')}>
            ← dashboard
          </button>
        </nav>

        {/* MAIN */}
        <main className="ur-main">

          {/* PAGE HEADER */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.05s' }}>
            <div className="pg-eyebrow">◈ resume / setup</div>
            <h1 className="pg-title">Upload Your <span className="accent">Resume.</span></h1>
            <p className="pg-sub">Upload your PDF, set a target role, and PrepAI will generate tailored questions. Then choose your next step.</p>
          </div>

          {/* STEPPER */}
          <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.12s' }}>
            <div className="stepper">
              {[
                { label: 'Upload Resume' },
                { label: 'Choose Action' },
                { label: 'Interview / Review' },
              ].map((s, i) => {
                const isDone = step > i;
                const isActive = step === i;
                return (
                  <React.Fragment key={i}>
                    <div className="step-item">
                      <div className={`step-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span className={`step-label ${isActive || isDone ? 'active' : ''}`}>{s.label}</span>
                    </div>
                    {i < 2 && <div className={`step-connector ${isDone ? 'done' : ''}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ── STEP 0: UPLOAD FORM ── */}
          {step === STEP.UPLOAD && (
            <div className={`fade ${show ? 'show' : ''}`} style={{ transitionDelay: '0.2s' }}>
              <div className="card">
                <div className="card-body">
                  <div className="card-sec">
                    <span className="card-sec-num">01 /</span>
                    <span className="card-sec-ttl">Select Resume & Role</span>
                    <div className="card-sec-rule" />
                  </div>

                  {error && <div className="err-box"><span>◎</span><span>{error}</span></div>}

                  {/* Drop zone or file badge */}
                  {!file ? (
                    <div
                      className={`dropzone ${dragOver ? 'dragover' : ''}`}
                      onClick={() => fileInputRef.current.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFile(e.target.files[0])}
                      />
                      <div className="dropzone-icon">◈</div>
                      <div className="dropzone-txt">
                        Drop your PDF here or <span>click to browse</span>
                      </div>
                      <div className="dropzone-hint">PDF only · max 10MB</div>
                    </div>
                  ) : (
                    <div className="file-badge">
                      <div className="file-badge-left">
                        <span className="file-badge-sym">◈</span>
                        <div>
                          <div className="file-badge-name">{file.name}</div>
                          <div className="file-badge-size">{(file.size / 1024).toFixed(1)} KB · PDF</div>
                        </div>
                      </div>
                      <button className="file-badge-remove" onClick={() => setFile(null)}>remove</button>
                    </div>
                  )}

                  <div className="field">
                    <label className="field-label">Target Role</label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="e.g. SDE-1, Product Manager, Data Analyst"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleUpload} disabled={loading || !file || !role.trim()}>
                    {loading ? <><div className="spinner" /> processing resume...</> : <>◈ generate questions →</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: CHOOSE ACTION ── */}
          {step === STEP.READY && (
            <div className={`fade ${show ? 'show' : ''}`}>
              {/* Success notice */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-body" style={{ padding: '20px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--green)', fontSize: '1rem' }}>◉</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: '3px' }}>
                        Resume processed successfully
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {questions.length} questions generated for <span style={{ color: 'var(--green)' }}>{role}</span> · Choose your next step below
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-sec" style={{ marginBottom: '16px' }}>
                <span className="card-sec-num">02 /</span>
                <span className="card-sec-ttl">What would you like to do?</span>
                <div className="card-sec-rule" />
              </div>

              <div className="action-grid">
                <button className="action-card green-card" onClick={() => navigate('/voice-interview')}>
                  <div className="action-card-icon" style={{ color: 'var(--green)' }}>◉</div>
                  <div className="action-card-ttl">Voice Interview</div>
                  <div className="action-card-desc">
                    Answer your tailored questions out loud. Get real-time AI scoring on clarity, structure and confidence.
                  </div>
                  <div className="action-card-arrow">start session →</div>
                </button>

                <button
                  className="action-card blue-card"
                  onClick={handleReview}
                  disabled={loadingReview}
                >
                  <div className="action-card-icon" style={{ color: '#60a5fa' }}>
                    {loadingReview ? <div className="spinner-w" /> : '◎'}
                  </div>
                  <div className="action-card-ttl">AI Resume Review</div>
                  <div className="action-card-desc">
                    Get a detailed critique and score for your resume from the AI — strengths, gaps, and suggestions.
                  </div>
                  <div className="action-card-arrow" style={{ color: '#60a5fa' }}>
                    {loadingReview ? 'reviewing...' : 'review resume →'}
                  </div>
                </button>
              </div>

              {error && <div className="err-box" style={{ marginTop: '16px' }}><span>◎</span><span>{error}</span></div>}

              {/* Show questions */}
              {questions.length > 0 && (
                <div className="questions-block" style={{ marginTop: '20px' }}>
                  <div className="questions-header">
                    <span className="questions-ttl">Generated Questions</span>
                    <span className="q-badge">{questions.length} questions</span>
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
              )}

              <div className="reset-row">
                <button className="reset-btn" onClick={resetAll}>↺ upload a different resume</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: REVIEW RESULT ── */}
          {step === STEP.REVIEW && (
            <div className={`fade ${show ? 'show' : ''}`}>
              <div className="card-sec" style={{ marginBottom: '16px' }}>
                <span className="card-sec-num">03 /</span>
                <span className="card-sec-ttl">Your Resume Review</span>
                <div className="card-sec-rule" />
              </div>

              {rating !== null && (
                <div className="rating-block">
                  <div className="rating-lbl">◈ AI Resume Score</div>
                  <div className="rating-num" style={{ color: ratingColor }}>
                    {rating}<span className="rating-denom"> / 10</span>
                  </div>
                  <div className="rating-sub">
                    {rating >= 8 ? 'Excellent — your resume is interview-ready' : rating >= 5 ? 'Good — a few improvements recommended' : 'Needs work — review suggestions below'}
                  </div>
                </div>
              )}

              {reviewResult && (
                <div className="review-block">
                  <div className="review-block-header">
                    <span className="review-block-ttl">Detailed Feedback</span>
                  </div>
                  <div className="review-block-body">{reviewResult}</div>
                </div>
              )}

              {/* Actions after review */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ flex: 1, minWidth: '180px' }} onClick={() => navigate('/voice-interview')}>
                  ◉ start voice interview →
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, minWidth: '160px' }} onClick={() => setStep(STEP.READY)}>
                  ← back to actions
                </button>
              </div>

              <div className="reset-row" style={{ marginTop: '16px' }}>
                <button className="reset-btn" onClick={resetAll}>↺ upload a different resume</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default UploadResume;