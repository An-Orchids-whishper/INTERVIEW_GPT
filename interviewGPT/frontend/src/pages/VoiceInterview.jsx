import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSpeechRecognition, useSpeechSynthesis } from "react-speech-kit";
import { FaceDetection } from "@mediapipe/face_detection";

const VoiceInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [scores, setScores] = useState([]);
  const [recording, setRecording] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const [faceAlert, setFaceAlert] = useState("");
  const [gazeAlert, setGazeAlert] = useState("");
  const [tabAlert, setTabAlert] = useState(false);
  const [cheatingEvents, setCheatingEvents] = useState([]);

  const videoRef = useRef(null);
  const hasSpoken = useRef(false);
  const finalAnswer = useRef("");

  const { speak } = useSpeechSynthesis();
  const { listen, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      finalAnswer.current += " " + result;
      setAnswer(finalAnswer.current.trim());
    },
    onEnd: () => setRecording(false),
    continuous: true,
    interimResults: true,
  });

 
  useEffect(() => {
    const stored = localStorage.getItem("resumeQuestions");
    if (stored) setQuestions(JSON.parse(stored));
    else alert("No resume-based questions found.");
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
        setCheatingEvents((prev) => [...prev, { time: new Date(), reason: "🚨 Tab switch detected" }]);
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const face = new FaceDetection({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      face.setOptions({
        model: "short",
        minDetectionConfidence: 0.5,
      });

      face.onResults((results) => {
        if (!results.detections || results.detections.length === 0) {
          setFaceAlert("⚠️ No face detected");
          setGazeAlert("");
          return;
        }

        if (results.detections.length > 1) {
          setFaceAlert("🚨 Multiple faces detected");
          setGazeAlert("");
          return;
        }

        setFaceAlert("");

        const box = results.detections[0].boundingBox;
        const centerX = box.xCenter;
        const width = box.width;

        if (centerX < 0.35 || centerX > 0.65) {
          const reason = "👀 Looking away";
          setGazeAlert(reason);
          setCheatingEvents((prev) => [...prev, { time: new Date(), reason }]);
        } else if (width < 0.15) {
          const reason = "📏 Too far from screen";
          setGazeAlert(reason);
          setCheatingEvents((prev) => [...prev, { time: new Date(), reason }]);
        } else {
          setGazeAlert("");
        }
      });

      const detect = async () => {
        if (!videoRef.current) return;
        await face.send({ image: videoRef.current });
        requestAnimationFrame(detect);
      };

      await face.initialize();
      detect();
    } catch (err) {
      alert("Please allow camera access");
      console.error(err);
    }
  };

  const startRecording = () => {
    finalAnswer.current = "";
    setAnswer("");
    setRecording(true);
    listen();
  };

  const stopRecording = () => {
    stop();
    setRecording(false);
  };

  const submitAnswer = async () => {
    if (!questions[currentIndex] || !answer.trim()) return alert("Answer missing.");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/interview/voice/evaluate",
        {
          questions: [questions[currentIndex]],
          answers: [answer],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedback((prev) => [...prev, res.data.review]);
      setScores((prev) => [...prev, res.data.score ?? 0]);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        hasSpoken.current = false;
      } else {
        setReviewMode(true);
      }
    } catch (err) {
      alert("Failed to evaluate.");
    }
  };

  const avgScore = () => {
    if (!scores.length) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex justify-center items-center">
      <div className="max-w-3xl w-full bg-neutral-900 p-8 rounded-lg space-y-6 border border-white/10 shadow-xl">
        <h1 className="text-3xl font-serif font-bold text-center">🎤 Mock Interview</h1>

        {!interviewStarted ? (
          <div className="text-center">
            <button
              onClick={startInterview}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700"
            >
              🚀 Start Interview
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-[480px] h-[360px] rounded border border-white/20 mx-auto"
            />
            {faceAlert && <p className="text-red-400 text-center">{faceAlert}</p>}
            {gazeAlert && <p className="text-red-400 text-center">{gazeAlert}</p>}
            {tabAlert && <p className="text-red-400 text-center">🚨 Tab switch detected</p>}

            {!reviewMode && questions.length > 0 && (
              <>
                <h2 className="text-xl text-yellow-400 font-semibold">
                  🧠 Question {currentIndex + 1}
                </h2>
                <p className="text-gray-300">{questions[currentIndex]}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => speak({ text: questions[currentIndex] })}
                    className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600"
                  >
                    🔁 Repeat
                  </button>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`px-4 py-2 rounded ${
                      recording ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {recording ? "⏹ Stop" : "🎙 Start"}
                  </button>
                  <button
                    onClick={submitAnswer}
                    className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                  >
                    ✅ Submit
                  </button>
                </div>

                <div className="mt-4 bg-neutral-800 p-4 rounded border border-white/10">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{answer}</p>
                </div>
              </>
            )}

            {reviewMode && (
              <>
                <h2 className="text-xl font-bold text-green-400">📊 Interview Summary</h2>
                <h3 className="text-yellow-300 font-semibold">Average Score: {avgScore()} / 10</h3>

                {feedback.map((fb, i) => (
                  <div
                    key={i}
                    className="mt-4 bg-neutral-800 p-4 rounded border border-white/10 space-y-2"
                  >
                    <p className="font-semibold">Q{i + 1}: {questions[i]}</p>
                    <p className="text-sm text-gray-300">Score: {scores[i]}</p>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">{fb}</p>
                  </div>
                ))}

                {cheatingEvents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-red-400 font-bold">🚨 Cheating Summary</h4>
                    <ul className="list-disc pl-5 text-sm text-red-200 mt-2 space-y-1">
                      {cheatingEvents.map((e, i) => (
                        <li key={i}>{e.reason} - {new Date(e.time).toLocaleTimeString()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceInterview;
