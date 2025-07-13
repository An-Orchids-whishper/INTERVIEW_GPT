// VoiceInterview.jsx with enhanced UI and same logic
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
      alert("Please allow camera access");
      console.error(err);
    }
  };

  const startRecording = () => {
    finalAnswer.current = "";
    setAnswer("");
    setRecording(true);
    
    // Add a small delay to ensure state is updated
    setTimeout(() => {
      try {
        listen();
        console.log("Started listening...");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setRecording(false);
        alert("Speech recognition failed to start. Please check your microphone permissions.");
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 font-inter">
      <div className="max-w-6xl mx-auto">
        {!interviewStarted ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                AI Mock Interview
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Practice with AI-powered feedback and advanced cheating detection system
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-blue-800 mb-2">Face Detection</h3>
                <p className="text-sm text-blue-600">Real-time monitoring for interview integrity</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-purple-800 mb-2">Voice Recognition</h3>
                <p className="text-sm text-purple-600">Advanced speech-to-text processing</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-pink-800 mb-2">AI Evaluation</h3>
                <p className="text-sm text-pink-600">Intelligent feedback and scoring</p>
              </div>
            </div>
            
            <button
              onClick={startInterview}
              className="group relative overflow-hidden px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m1 6V4a3 3 0 00-6 0v6m7 0a3 3 0 11-6 0m6 0H9m6 0v4m0 0H9m6 0a3 3 0 01-3 3H9a3 3 0 01-3-3m6 0V10" />
                </svg>
                Start Interview
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header with Progress */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  AI Mock Interview
                </h2>
                {!reviewMode && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {currentIndex + 1}/{questions.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Video and Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Camera Feed */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Camera Feed
                  </h3>
                  <div className="relative">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline 
                      className="w-full h-64 rounded-2xl border-2 border-gray-200 shadow-lg object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">LIVE</span>
                    </div>
                  </div>
                  
                  {/* Alert Messages */}
                  <div className="mt-4 space-y-2">
                    {faceAlert && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm font-medium text-red-700">{faceAlert}</span>
                      </div>
                    )}
                    {gazeAlert && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm font-medium text-orange-700">{gazeAlert}</span>
                      </div>
                    )}
                    {tabAlert && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-red-700">Tab switch detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Question and Answer Section */}
              <div className="lg:col-span-2">
                {!reviewMode && questions.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {currentIndex + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Interview Question</h3>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
                        <p className="text-lg text-gray-800 leading-relaxed">{questions[currentIndex]}</p>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => speak({ text: questions[currentIndex] })}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        Repeat Question
                      </button>
                      
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                          recording 
                            ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {recording ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                            </svg>
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            {listening ? "Recording..." : "Start Recording"}
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={submitAnswer}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Answer
                      </button>
                    </div>

                    {/* Answer Display */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Your Answer
                      </h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 min-h-32">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {recording ? (
                            <span className="text-blue-600 font-medium">
                              🎤 Recording... {answer || "Speak now"}
                            </span>
                          ) : (
                            answer || "Start recording to see your answer here..."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Mode */}
                {reviewMode && (
                  <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-green-600">Interview Complete!</h2>
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
                          <p className="text-2xl font-bold text-gray-800">
                            Average Score: <span className="text-blue-600">{avgScore()}</span> / 10
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Cards */}
                    <div className="space-y-4">
                      {feedback.map((fb, i) => (
                        <div key={i} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <h3 className="font-semibold text-gray-900 text-lg">{questions[i]}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Score:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-lg font-bold text-blue-600">{scores[i]}</span>
                                  <span className="text-sm text-gray-500">/ 10</span>
                                </div>
                              </div>
                              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{fb}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cheating Events */}
                    {cheatingEvents.length > 0 && (
                      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-red-200 p-6">
                        <h4 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Security Violations Detected
                        </h4>
                        <div className="space-y-3">
                          {cheatingEvents.map((e, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-red-700">{e.reason}</span>
                                <span className="text-xs text-red-500 ml-2">
                                  {new Date(e.time).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInterview;