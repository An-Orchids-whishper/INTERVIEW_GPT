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

  // 1. Aapka Live Backend URL
  const API_BASE_URL = "https://interview-backend-2vew.onrender.com";

  const { speak } = useSpeechSynthesis();
  const { listen, stop, listening } = useSpeechRecognition({
    onResult: (result) => {
      finalAnswer.current += " " + result;
      setAnswer(finalAnswer.current.trim());
    },
    onEnd: () => {
      setRecording(false);
      console.log("Speech recognition ended");
    },
    onError: (error) => {
      console.error("Speech recognition error:", error);
      setRecording(false);
    },
    continuous: true,
    interimResults: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("resumeQuestions");
    if (stored) setQuestions(JSON.parse(stored));
    else alert("No resume-based questions found. Please upload your resume first.");
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const face = new FaceDetection({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
      });

      face.setOptions({ model: "short", minDetectionConfidence: 0.5 });

      face.onResults((results) => {
        if (!results.detections || results.detections.length === 0) {
          setFaceAlert("No face detected");
          setGazeAlert("");
          return;
        }

        if (results.detections.length > 1) {
          setFaceAlert("Multiple faces detected");
          setGazeAlert("");
          return;
        }

        setFaceAlert("");

        const box = results.detections[0].boundingBox;
        const centerX = box.xCenter;
        const width = box.width;

        if (centerX < 0.35 || centerX > 0.65) {
          const reason = "Looking away from screen";
          setGazeAlert(reason);
          setCheatingEvents((prev) => [...prev, { time: new Date(), reason }]);
        } else if (width < 0.15) {
          const reason = "Too far from camera";
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
      alert("Please allow camera and microphone access to start the AI interview.");
      console.error(err);
    }
  };

  const startRecording = () => {
    finalAnswer.current = "";
    setAnswer("");
    setRecording(true);
    
    setTimeout(() => {
      try {
        listen();
        console.log("Started listening...");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setRecording(false);
        alert("Speech recognition failed to start. Please check microphone permissions.");
      }
    }, 100);
  };

  const stopRecording = () => {
    try {
      stop();
      console.log("Stopped listening...");
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    } finally {
      setRecording(false);
    }
  };

  const submitAnswer = async () => {
    if (!questions[currentIndex] || !answer.trim()) return alert("Please record an answer before submitting.");
    
    try {
      const token = localStorage.getItem("token");
      
      // 2. Localhost changed to Live URL with correct backticks
      const res = await axios.post(
        `${API_BASE_URL}/api/interview/voice/evaluate`,
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
        setAnswer(""); // Clear current answer for next question
        finalAnswer.current = "";
        hasSpoken.current = false;
      } else {
        setReviewMode(true);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Evaluation failed. Make sure your internet is stable.");
    }
  };

  const avgScore = () => {
    if (!scores.length) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  };

  // ... (Baki ka UI code same hai jo aapne bhej tha)
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 font-inter">
      {/* (Pure JSX remains the same for enhanced UI) */}
      {/* ... (Start Interview View or Main Interview View) */}
    </div>
  );
};

export default VoiceInterview;