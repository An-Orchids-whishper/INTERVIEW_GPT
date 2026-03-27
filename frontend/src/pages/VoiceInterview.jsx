// /src/pages/VoiceInterview.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSpeechSynthesis } from "react-speech-kit";
import { FaceDetection } from "@mediapipe/face_detection";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://prepai-pink.vercel.app/";

const VoiceInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [scores, setScores] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [faceAlert, setFaceAlert] = useState("");
  const [gazeAlert, setGazeAlert] = useState("");
  const [tabAlert, setTabAlert] = useState(false);
  const [cheatingEvents, setCheatingEvents] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [micError, setMicError] = useState("");

  const videoRef = useRef(null);
  const hasSpoken = useRef(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswer(currentTranscript);
      };
      recognition.onstart = () => { setIsListening(true); setMicError(""); };
      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "not-allowed") setMicError("Microphone access blocked. Allow mic in browser settings.");
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("resumeQuestions");
    if (stored) setQuestions(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (interviewStarted && questions.length > 0 && currentIndex < questions.length && !hasSpoken.current) {
      speak({ text: questions[currentIndex] });
      hasSpoken.current = true;
    }
  }, [questions, currentIndex, speak, interviewStarted]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabAlert(true);
        setCheatingEvents((prev) => [...prev, { time: new Date(), reason: "Tab switch detected" }]);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const startInterview = async () => {
    setInterviewStarted(true);
    hasSpoken.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      const face = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}` });
      face.setOptions({ model: "short", minDetectionConfidence: 0.5 });
      face.onResults((results) => {
        if (!results.detections || results.detections.length === 0) { setFaceAlert("No face detected"); setGazeAlert(""); return; }
        if (results.detections.length > 1) { setFaceAlert("Multiple faces detected"); setGazeAlert(""); return; }
        setFaceAlert("");
        const box = results.detections[0].boundingBox;
        if (box.xCenter < 0.35 || box.xCenter > 0.65) {
          const r = "Looking away from screen"; setGazeAlert(r);
          setCheatingEvents((prev) => [...prev, { time: new Date(), reason: r }]);
        } else if (box.width < 0.15) {
          const r = "Too far from camera"; setGazeAlert(r);
          setCheatingEvents((prev) => [...prev, { time: new Date(), reason: r }]);
        } else { setGazeAlert(""); }
      });
      const detect = async () => { if (!videoRef.current) return; await face.send({ image: videoRef.current }); requestAnimationFrame(detect); };
      await face.initialize();
      detect();
    } catch (err) { setMicError("Camera access denied. Please allow camera and try again."); console.error(err); }
  };

  const startRecording = () => {
    if (!recognitionRef.current) return setMicError("Speech recognition not supported. Please use Chrome.");
    setAnswer("");
    try { recognitionRef.current.start(); } catch (e) { console.error(e); }
  };

  const stopRecording = () => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { console.error(e); }
  };

  const submitAnswer = async () => {
    if (!questions[currentIndex] || !answer.trim()) return;
    if (isListening) stopRecording();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/interview/voice/evaluate`,
        { questions: [questions[currentIndex]], answers: [answer] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback((prev) => [...prev, res.data.review]);
      setScores((prev) => [...prev, res.data.score ?? 0]);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
        hasSpoken.current = false;
      } else { setReviewMode(true); }
    } catch (err) { console.error(err); setMicError("Evaluation failed. Server may be waking up — try again in 30s."); }
    finally { setSubmitting(false); }
  };

  const avgScore = () => !scores.length ? 0 : (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const scoreColor = (s) => s >= 8 ? "#b4ff64" : s >= 5 ? "#fbbf24" : "#ff6b6b";
  const avgVal = parseFloat(avgScore());
  const progress = questions.length ? Math.round((currentIndex / questions.length) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fira+Code:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #040407; --surface: #0c0c18; --surface2: #10101f;
          --border: rgba(255,255,255,0.06); --border-bright: rgba(180,255,100,0.25);
          --green: #b4ff64; --green-dim: rgba(180,255,100,0.10); --green-glow: rgba(180,255,100,0.25);
          --text: #eeeef5; --muted: rgba(238,238,245,0.4);
          --red: #ff6b6b; --red-dim: rgba(255,107,107,0.10);
          --yellow: #fbbf24; --blue: #60a5fa;
          --font-d: 'Syne', sans-serif; --font-m: 'Fira Code', monospace;
        }

        body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
        .vi-root { min-height: 100vh; background: var(--bg); font-family: var(--font-m); position: relative; overflow-x: hidden; }

        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(180,255,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(180,255,100,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .blob { position: fixed; border-radius: 50%; filter: blur(110px); pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: rgba(180,255,100,0.06); top: -180px; right: -100px; }
        .blob-2 { width: 380px; height: 380px; background: rgba(100,120,255,0.05); bottom: -80px; left: -80px; }

        /* NAV */
        .vi-nav { position: relative; z-index: 20; padding: 22px 56px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .vi-logo { font-family: var(--font-d); font-size: 1.4rem; font-weight: 800; letter-spacing: -0.04em; display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .vi-logo .accent { color: var(--green); }
        .logo-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; box-shadow: 0 0 10px var(--green); animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nav-back { font-size: 0.74rem; color: var(--muted); background: none; border: none; cursor: pointer; font-family: var(--font-m); letter-spacing: 0.05em; transition: color 0.15s; }
        .nav-back:hover { color: var(--green); }

        .fade { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade.show { opacity: 1; transform: translateY(0); }

        /* ── PRE-START ── */
        .pre-main { position: relative; z-index: 10; max-width: 900px; margin: 0 auto; padding: 64px 40px 80px; }
        .pre-eyebrow { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--green); margin-bottom: 14px; text-align: center; }
        .pre-title { font-family: var(--font-d); font-size: clamp(2.6rem, 5vw, 4rem); font-weight: 800; letter-spacing: -0.04em; line-height: 0.95; margin-bottom: 16px; text-align: center; }
        .pre-title .accent { color: var(--green); }
        .pre-title .outline { -webkit-text-stroke: 1.5px rgba(238,238,245,0.25); color: transparent; }
        .pre-sub { font-size: 0.85rem; color: var(--muted); line-height: 1.7; text-align: center; max-width: 480px; margin: 0 auto 52px; font-weight: 300; }

        .pre-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 36px; }
        .pre-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 26px 22px; transition: border-color 0.2s, transform 0.2s; }
        .pre-card:hover { border-color: var(--border-bright); transform: translateY(-3px); }
        .pre-card-icon { font-size: 1.4rem; color: var(--green); margin-bottom: 12px; }
        .pre-card-title { font-family: var(--font-d); font-size: 0.95rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; }
        .pre-card-desc { font-size: 0.74rem; color: var(--muted); line-height: 1.55; font-weight: 300; }

        .pre-notice { background: var(--green-dim); border: 1px solid var(--border-bright); border-radius: 6px; padding: 14px 20px; margin-bottom: 32px; display: flex; align-items: flex-start; gap: 12px; font-size: 0.76rem; color: rgba(238,238,245,0.7); line-height: 1.6; }
        .pre-notice-sym { color: var(--green); flex-shrink: 0; }

        .start-btn { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0 auto; width: 100%; max-width: 320px; padding: 15px 36px; background: var(--green); border: 1px solid var(--green); color: #040407; border-radius: 4px; font-family: var(--font-m); font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
        .start-btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.1); opacity: 0; transition: opacity 0.15s; }
        .start-btn:hover::after { opacity: 1; }
        .start-btn:hover { box-shadow: 0 0 28px var(--green-glow); }
        .start-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── ACTIVE LAYOUT ── */
        .active-layout { position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; padding: 32px 40px 80px; display: grid; grid-template-columns: 290px 1fr; gap: 20px; align-items: start; }

        /* SIDEBAR */
        .sidebar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 24px; }
        .s-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .s-card-header { padding: 13px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .s-card-title { font-family: var(--font-d); font-size: 0.78rem; font-weight: 800; letter-spacing: -0.01em; }
        .s-card-body { padding: 14px; }

        /* Video */
        .video-wrap { position: relative; border-radius: 4px; overflow: hidden; background: #000; aspect-ratio: 4/3; }
        video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .live-badge { position: absolute; top: 8px; right: 8px; display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.65); padding: 3px 8px; border-radius: 3px; font-size: 0.58rem; letter-spacing: 0.12em; color: #fff; }
        .live-dot { width: 5px; height: 5px; background: var(--red); border-radius: 50%; animation: pulse-dot 1.2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }

        /* Alerts */
        .alerts { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
        .alert { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 4px; font-size: 0.7rem; line-height: 1.4; }
        .alert-ok { background: rgba(180,255,100,0.07); border: 1px solid rgba(180,255,100,0.18); color: var(--green); }
        .alert-red { background: var(--red-dim); border: 1px solid rgba(255,107,107,0.25); color: var(--red); }
        .alert-yellow { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.22); color: var(--yellow); }

        /* Progress */
        .prog-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); margin-bottom: 9px; }
        .prog-track { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; margin-bottom: 7px; }
        .prog-fill { height: 100%; background: var(--green); border-radius: 2px; transition: width 0.4s ease; }
        .prog-meta { font-size: 0.66rem; color: var(--muted); display: flex; justify-content: space-between; }
        .prog-meta span { color: var(--green); }

        /* Q mini list */
        .q-mini { display: flex; flex-direction: column; gap: 3px; }
        .q-mini-row { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 3px; }
        .q-mini-row.done { opacity: 0.45; }
        .q-mini-row.active { background: var(--green-dim); }
        .q-mini-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .q-mini-dot.done { background: rgba(180,255,100,0.4); }
        .q-mini-dot.active { background: var(--green); box-shadow: 0 0 5px var(--green); animation: pulse-dot 1.5s infinite; }
        .q-mini-dot.pending { background: rgba(255,255,255,0.1); }
        .q-mini-txt { font-size: 0.66rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 190px; }
        .q-mini-row.active .q-mini-txt { color: var(--text); }

        /* MAIN PANEL */
        .main-panel { display: flex; flex-direction: column; gap: 16px; }

        /* Question card */
        .q-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; position: relative; }
        .q-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--green), transparent 60%); }
        .q-card-header { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .q-badge { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--border-bright); background: var(--green-dim); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: var(--green); flex-shrink: 0; }
        .q-card-ttl { font-family: var(--font-d); font-size: 0.9rem; font-weight: 800; }
        .q-card-body { padding: 24px; }
        .q-text { font-family: var(--font-d); font-size: 1.15rem; font-weight: 700; line-height: 1.45; letter-spacing: -0.02em; }

        /* Controls */
        .ctrl-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
        .ctrl { font-family: var(--font-m); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 9px 18px; border-radius: 4px; cursor: pointer; transition: all 0.18s; display: flex; align-items: center; gap: 7px; position: relative; overflow: hidden; }
        .ctrl::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.07); opacity: 0; transition: opacity 0.15s; }
        .ctrl:hover:not(:disabled)::after { opacity: 1; }
        .ctrl:disabled { opacity: 0.4; cursor: not-allowed; }

        .ctrl-speak { background: transparent; border: 1px solid var(--border-bright); color: var(--text); }
        .ctrl-speak:hover:not(:disabled) { border-color: var(--green); color: var(--green); }

        .ctrl-rec { background: var(--green); border: 1px solid var(--green); color: #040407; font-weight: 700; }
        .ctrl-rec:hover:not(:disabled) { box-shadow: 0 0 18px var(--green-glow); }
        .ctrl-rec.listening { background: var(--red); border-color: var(--red); color: #fff; animation: rec-pulse 1.5s ease-in-out infinite; }
        @keyframes rec-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,0.4)} 50%{box-shadow:0 0 0 6px rgba(255,107,107,0)} }

        .ctrl-submit { background: transparent; border: 1px solid rgba(96,165,250,0.3); color: var(--blue); }
        .ctrl-submit:hover:not(:disabled) { border-color: var(--blue); background: rgba(96,165,250,0.07); }

        .spinner-dark { width: 12px; height: 12px; border: 2px solid rgba(4,4,7,0.25); border-top-color: #040407; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .spinner-w { width: 12px; height: 12px; border: 2px solid rgba(238,238,245,0.15); border-top-color: var(--text); border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Answer card */
        .ans-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .ans-header { padding: 14px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .ans-title { font-family: var(--font-d); font-size: 0.85rem; font-weight: 800; }
        .rec-chip { display: flex; align-items: center; gap: 6px; font-size: 0.62rem; color: var(--red); letter-spacing: 0.1em; text-transform: uppercase; }
        .ans-body { padding: 20px 22px; min-height: 110px; }
        .ans-text { font-size: 0.84rem; color: rgba(238,238,245,0.82); line-height: 1.75; font-weight: 300; white-space: pre-wrap; }
        .ans-listening { font-size: 0.84rem; color: var(--green); line-height: 1.75; }
        .ans-placeholder { font-size: 0.76rem; color: rgba(238,238,245,0.18); letter-spacing: 0.04em; }
        .ans-err { font-size: 0.74rem; color: var(--red); line-height: 1.6; display: flex; gap: 8px; }

        /* ── REVIEW ── */
        .review-layout { position: relative; z-index: 10; max-width: 860px; margin: 0 auto; padding: 48px 40px 80px; display: flex; flex-direction: column; gap: 22px; }
        .review-eyebrow { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--green); margin-bottom: 10px; text-align: center; }
        .review-title { font-family: var(--font-d); font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.04em; text-align: center; }
        .review-title .accent { color: var(--green); }

        .avg-card { background: var(--green-dim); border: 1px solid var(--border-bright); border-radius: 8px; padding: 34px; text-align: center; }
        .avg-lbl { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.18em; color: var(--green); margin-bottom: 12px; }
        .avg-num { font-family: var(--font-d); font-size: 5.5rem; font-weight: 800; line-height: 1; letter-spacing: -0.05em; }
        .avg-denom { font-size: 1.6rem; color: var(--muted); font-family: var(--font-m); }
        .avg-sub { font-size: 0.74rem; color: var(--muted); margin-top: 10px; }

        .sec-hd { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; }
        .sec-num { font-size: 0.64rem; color: var(--green); letter-spacing: 0.16em; }
        .sec-ttl { font-family: var(--font-d); font-size: 1.2rem; font-weight: 800; letter-spacing: -0.03em; }
        .sec-rule { flex: 1; height: 1px; background: var(--border); margin-left: 6px; }

        .fb-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 12px; transition: border-color 0.2s; }
        .fb-card:hover { border-color: var(--border-bright); }
        .fb-top { padding: 14px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .fb-idx { font-size: 0.6rem; color: var(--green); opacity: 0.6; width: 20px; flex-shrink: 0; }
        .fb-q { font-size: 0.82rem; color: var(--text); font-weight: 500; flex: 1; }
        .fb-score { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 2px; flex-shrink: 0; letter-spacing: 0.06em; }
        .fb-body { padding: 18px 22px; }
        .fb-text { font-size: 0.8rem; color: rgba(238,238,245,0.72); line-height: 1.8; white-space: pre-wrap; font-weight: 300; }
        .fb-bar-track { height: 3px; background: var(--border); border-radius: 2px; margin-top: 14px; overflow: hidden; }
        .fb-bar-fill { height: 100%; border-radius: 2px; }

        .cheat-card { background: var(--surface); border: 1px solid rgba(255,107,107,0.2); border-radius: 8px; overflow: hidden; }
        .cheat-hd { padding: 14px 22px; border-bottom: 1px solid rgba(255,107,107,0.12); display: flex; align-items: center; gap: 10px; }
        .cheat-ttl { font-family: var(--font-d); font-size: 0.9rem; font-weight: 800; color: var(--red); }
        .cheat-item { padding: 10px 22px; border-bottom: 1px solid rgba(255,107,107,0.07); display: flex; align-items: center; gap: 12px; }
        .cheat-item:last-child { border-bottom: none; }
        .cheat-dot { width: 5px; height: 5px; background: var(--red); border-radius: 50%; flex-shrink: 0; }
        .cheat-reason { font-size: 0.74rem; color: rgba(238,238,245,0.6); flex: 1; }
        .cheat-time { font-size: 0.64rem; color: rgba(238,238,245,0.25); }

        .review-actions { display: flex; gap: 12px; }
        .act { font-family: var(--font-m); font-size: 0.78rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; padding: 13px 24px; border-radius: 4px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; position: relative; overflow: hidden; flex: 1; justify-content: center; }
        .act::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.07); opacity: 0; transition: opacity 0.15s; }
        .act:hover::after { opacity: 1; }
        .act-primary { background: var(--green); border: 1px solid var(--green); color: #040407; font-weight: 700; }
        .act-primary:hover { box-shadow: 0 0 22px var(--green-glow); }
        .act-ghost { background: transparent; border: 1px solid var(--border-bright); color: var(--text); }
        .act-ghost:hover { border-color: var(--green); color: var(--green); background: var(--green-dim); }

        @media (max-width: 900px) {
          .active-layout { grid-template-columns: 1fr; }
          .sidebar { position: static; display: grid; grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .vi-nav { padding: 18px 24px; }
          .pre-main { padding: 40px 20px 60px; }
          .pre-grid { grid-template-columns: 1fr; }
          .active-layout { padding: 20px; }
          .sidebar { grid-template-columns: 1fr; }
          .review-layout { padding: 32px 20px 60px; }
          .review-actions { flex-direction: column; }
          .ctrl-row { gap: 8px; }
        }
      `}</style>

      <div className="vi-root">
        <div className="grid-bg" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="vi-nav">
          <div className="vi-logo" onClick={() => navigate("/")}>
            <div className="logo-dot" />
            Prep<span className="accent">AI</span>
          </div>
          <button className="nav-back" onClick={() => navigate("/dashboard")}>← dashboard</button>
        </nav>

        {/* ── PRE-START ── */}
        {!interviewStarted && !reviewMode && (
          <div className="pre-main">
            <div className={`fade ${show ? "show" : ""}`}>
              <div className="pre-eyebrow">◉ voice interview / ready</div>
              <h1 className="pre-title">
                <span style={{ display: "block" }}>Mock</span>
                <span style={{ display: "block" }} className="accent">Interview</span>
                <span style={{ display: "block" }} className="outline">Session.</span>
              </h1>
              <p className="pre-sub">Answer AI-generated questions out loud. Face detection, voice recognition, and tab-switch monitoring are active throughout.</p>

              <div className="pre-grid">
                {[
                  { icon: "◉", title: "Face Detection", desc: "Tracks gaze, eye contact and flags multiple faces in real-time." },
                  { icon: "◎", title: "Voice Recognition", desc: "Native speech-to-text captures every word continuously." },
                  { icon: "◈", title: "AI Evaluation", desc: "Each answer scored on clarity, structure and depth by the AI." },
                ].map((f) => (
                  <div className="pre-card" key={f.title}>
                    <div className="pre-card-icon">{f.icon}</div>
                    <div className="pre-card-title">{f.title}</div>
                    <div className="pre-card-desc">{f.desc}</div>
                  </div>
                ))}
              </div>

              <div className="pre-notice">
                <span className="pre-notice-sym">◎</span>
                <span>
                  {questions.length > 0
                    ? `${questions.length} questions loaded. Camera and microphone access required. Ensure you're in a quiet, well-lit environment.`
                    : "No questions found. Please upload your resume first."}
                </span>
              </div>

              {micError && (
                <div style={{ background: "var(--red-dim)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "4px", padding: "11px 16px", fontSize: "0.76rem", color: "var(--red)", display: "flex", gap: "8px", marginBottom: "20px" }}>
                  <span>◎</span><span>{micError}</span>
                </div>
              )}

              <button className="start-btn" onClick={startInterview} disabled={questions.length === 0}>
                ◉ begin session
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVE INTERVIEW ── */}
        {interviewStarted && !reviewMode && (
          <div className="active-layout">

            {/* SIDEBAR */}
            <div className="sidebar">

              {/* Camera */}
              <div className="s-card">
                <div className="s-card-header">
                  <span className="s-card-title">Camera Feed</span>
                  <span style={{ fontSize: "0.58rem", color: "var(--muted)", letterSpacing: "0.1em" }}>MONITORING</span>
                </div>
                <div className="s-card-body">
                  <div className="video-wrap">
                    <video ref={videoRef} autoPlay muted playsInline />
                    <div className="live-badge"><div className="live-dot" /> LIVE</div>
                  </div>
                  <div className="alerts">
                    {faceAlert && <div className="alert alert-red"><span>◎</span>{faceAlert}</div>}
                    {gazeAlert && <div className="alert alert-yellow"><span>◐</span>{gazeAlert}</div>}
                    {tabAlert && <div className="alert alert-red"><span>◈</span>Tab switch detected</div>}
                    {!faceAlert && !gazeAlert && !tabAlert && (
                      <div className="alert alert-ok"><span>◉</span>Face detected · All clear</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="s-card">
                <div className="s-card-header"><span className="s-card-title">Progress</span></div>
                <div className="s-card-body">
                  <div className="prog-label">Session progress</div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
                  <div className="prog-meta">
                    <span><span>{currentIndex}</span> of {questions.length} answered</span>
                    <span style={{ color: "var(--green)" }}>{progress}%</span>
                  </div>
                </div>
              </div>

              {/* Q list */}
              <div className="s-card" style={{ gridColumn: "1 / -1" }}>
                <div className="s-card-header"><span className="s-card-title">Question List</span></div>
                <div className="s-card-body">
                  <div className="q-mini">
                    {questions.map((q, i) => {
                      const st = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
                      return (
                        <div className={`q-mini-row ${st}`} key={i}>
                          <div className={`q-mini-dot ${st}`} />
                          <span className="q-mini-txt">{q}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN PANEL */}
            <div className="main-panel">

              {/* Question */}
              <div className="q-card">
                <div className="q-card-header">
                  <div className="q-badge">{currentIndex + 1}</div>
                  <span className="q-card-ttl">Current Question</span>
                </div>
                <div className="q-card-body">
                  <div className="q-text">{questions[currentIndex]}</div>
                  <div className="ctrl-row">
                    <button className="ctrl ctrl-speak" onClick={() => speak({ text: questions[currentIndex] })}>
                      ◎ repeat
                    </button>
                    <button
                      className={`ctrl ctrl-rec ${isListening ? "listening" : ""}`}
                      onClick={isListening ? stopRecording : startRecording}
                    >
                      {isListening
                        ? <><div style={{ width: "8px", height: "8px", background: "#fff", borderRadius: "2px", flexShrink: 0 }} /> stop</>
                        : <>◉ record</>}
                    </button>
                    <button
                      className="ctrl ctrl-submit"
                      onClick={submitAnswer}
                      disabled={submitting || !answer.trim()}
                    >
                      {submitting ? <><div className="spinner-w" /> evaluating...</> : <>◈ submit</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div className="ans-card">
                <div className="ans-header">
                  <span className="ans-title">Your Answer</span>
                  {isListening && <div className="rec-chip"><div className="live-dot" /> recording</div>}
                </div>
                <div className="ans-body">
                  {micError ? (
                    <div className="ans-err"><span>◎</span><span>{micError}</span></div>
                  ) : isListening ? (
                    <div className="ans-listening">{answer || "Listening... speak now"}</div>
                  ) : answer ? (
                    <div className="ans-text">{answer}</div>
                  ) : (
                    <div className="ans-placeholder">Press "record" then speak your answer clearly...</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── REVIEW MODE ── */}
        {reviewMode && (
          <div className="review-layout">
            <div className={`fade ${show ? "show" : ""}`}>
              <div className="review-eyebrow">◈ session complete</div>
              <h2 className="review-title">Interview <span className="accent">Report.</span></h2>
            </div>

            {/* Avg score */}
            <div className={`avg-card fade ${show ? "show" : ""}`} style={{ transitionDelay: "0.1s" }}>
              <div className="avg-lbl">◈ overall performance</div>
              <div className="avg-num" style={{ color: scoreColor(avgVal) }}>
                {avgScore()}<span className="avg-denom"> / 10</span>
              </div>
              <div className="avg-sub">
                {avgVal >= 8 ? "Excellent — you're interview ready" : avgVal >= 5 ? "Good effort — review feedback to improve" : "Keep practicing — focus on areas below"}
              </div>
            </div>

            {/* Feedback */}
            <div className={`fade ${show ? "show" : ""}`} style={{ transitionDelay: "0.18s" }}>
              <div className="sec-hd">
                <span className="sec-num">01 /</span>
                <span className="sec-ttl">Question Feedback</span>
                <div className="sec-rule" />
              </div>
              {feedback.map((fb, i) => (
                <div className="fb-card" key={i}>
                  <div className="fb-top">
                    <span className="fb-idx">{String(i + 1).padStart(2, "0")}</span>
                    <span className="fb-q">{questions[i]}</span>
                    <div className="fb-score" style={{ background: `${scoreColor(scores[i])}18`, border: `1px solid ${scoreColor(scores[i])}40`, color: scoreColor(scores[i]) }}>
                      {scores[i]} / 10
                    </div>
                  </div>
                  <div className="fb-body">
                    <div className="fb-text">{fb}</div>
                    <div className="fb-bar-track">
                      <div className="fb-bar-fill" style={{ width: `${scores[i] * 10}%`, background: scoreColor(scores[i]) }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cheating log */}
            {cheatingEvents.length > 0 && (
              <div className={`fade ${show ? "show" : ""}`} style={{ transitionDelay: "0.26s" }}>
                <div className="sec-hd">
                  <span className="sec-num">02 /</span>
                  <span className="sec-ttl">Security Log</span>
                  <div className="sec-rule" />
                </div>
                <div className="cheat-card">
                  <div className="cheat-hd">
                    <span style={{ color: "var(--red)" }}>◎</span>
                    <span className="cheat-ttl">{cheatingEvents.length} violation{cheatingEvents.length > 1 ? "s" : ""} recorded</span>
                  </div>
                  {cheatingEvents.map((e, i) => (
                    <div className="cheat-item" key={i}>
                      <div className="cheat-dot" />
                      <span className="cheat-reason">{e.reason}</span>
                      <span className="cheat-time">{new Date(e.time).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={`review-actions fade ${show ? "show" : ""}`} style={{ transitionDelay: "0.32s" }}>
              <button className="act act-primary" onClick={() => navigate("/dashboard")}>◈ back to dashboard →</button>
              <button className="act act-ghost" onClick={() => navigate("/upload-resume")}>◎ new session</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default VoiceInterview;