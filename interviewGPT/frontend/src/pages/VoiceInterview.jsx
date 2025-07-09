import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSpeechRecognition, useSpeechSynthesis } from "react-speech-kit";

const VoiceInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const { speak } = useSpeechSynthesis();

  const { listen, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setAnswer(result);
    },
  });

  // ✅ Load questions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("resumeQuestions");
    if (stored) {
      const parsed = JSON.parse(stored);
      setQuestions(parsed);
    } else {
      alert("No resume-based questions found. Please upload your resume first.");
    }
  }, []);

  // ✅ Speak each question when it loads or changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      speak({ text: questions[currentIndex] });
    }
  }, [currentIndex, questions, speak]); // ✅ added `speak` to dependencies

  const startRecording = () => {
    setAnswer("");
    setRecording(true);
    listen();
  };

  const stopRecording = () => {
    stop();
    setRecording(false);
  };

  const submitAnswer = async () => {
    if (!questions[currentIndex] || !answer.trim()) {
      return alert("Missing question or answer.");
    }

    try {
      setLoading(true);
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

      setFeedback(res.data.review);
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setFeedback("");
    setAnswer("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("Interview complete! 🎉");
    }
  };

  if (!supported) {
    return <p>Your browser doesn't support voice recognition.</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">🎙️ Voice Interview</h1>

      {questions.length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">🧠 Question {currentIndex + 1}:</h2>
            <p className="text-gray-300">{questions[currentIndex]}</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`px-6 py-2 font-semibold rounded ${
                recording ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {recording ? "Stop Recording" : "Start Answering"}
            </button>

            <button
              onClick={submitAnswer}
              className="bg-purple-600 px-6 py-2 font-semibold rounded hover:bg-purple-700"
            >
              Submit Answer
            </button>

            {feedback && currentIndex < questions.length - 1 && (
              <button
                onClick={nextQuestion}
                className="bg-blue-600 px-6 py-2 font-semibold rounded hover:bg-blue-700"
              >
                Next Question
              </button>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">🗣️ Your Answer:</h3>
            <p className="text-gray-400 whitespace-pre-wrap">{answer}</p>
          </div>

          {loading && <p className="text-yellow-400">Evaluating...</p>}

          {feedback && (
            <div className="bg-neutral-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-400 mb-2">📊 Feedback:</h3>
              <p className="text-gray-200 whitespace-pre-wrap">{feedback}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceInterview;
