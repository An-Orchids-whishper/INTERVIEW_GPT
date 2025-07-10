import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSpeechRecognition, useSpeechSynthesis } from "react-speech-kit";

const VoiceInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState([]); // Store feedback for attempted answers
  const [scores, setScores] = useState([]); // Store scores for attempted answers
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState(false); // To toggle review mode

  const { speak } = useSpeechSynthesis();
  const hasSpoken = useRef(false); // To avoid repeat
  const finalAnswer = useRef(""); // To accumulate full answer

  const { listen, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      finalAnswer.current += " " + result;
      setAnswer(finalAnswer.current.trim());
    },
    onEnd: () => {
      setRecording(false); // Stop recording when speech recognition ends
    },
    continuous: true, // Keep listening continuously
    interimResults: true, // Get interim results while speaking
  });

  useEffect(() => {
    const stored = localStorage.getItem("resumeQuestions");
    if (stored) {
      const parsed = JSON.parse(stored);
      setQuestions(parsed);
    } else {
      alert("No resume-based questions found. Please upload your resume first.");
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length && !hasSpoken.current) {
      speak({ text: questions[currentIndex] });
      hasSpoken.current = true;
    }
  }, [questions, currentIndex, speak]);

  const startRecording = () => {
    finalAnswer.current = ""; // Reset the answer
    setAnswer(""); // Clear the displayed answer
    setRecording(true); // Set recording state to true
    listen(); // Start listening for speech
  };

  const stopRecording = () => {
    stop(); // Stop listening for speech
    setRecording(false); // Set recording state to false
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

      // Store feedback and score for the attempted answer
      setFeedback((prev) => [...prev, res.data.review]);
      setScores((prev) => [...prev, res.data.score]); // Assuming the score is returned in the response

      // Move to the next question or switch to review mode if it's the last question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        hasSpoken.current = false; // Allow next question to speak
      } else {
        setReviewMode(true); // Switch to review mode after the last question
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScore = () => {
    if (scores.length === 0) return 0;
    const totalScore = scores.reduce((acc, score) => acc + score, 0);
    return (totalScore / scores.length).toFixed(2); // Return average score rounded to 2 decimal places
  };

  if (!supported) {
    return <p>Your browser doesn't support voice recognition.</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">🎙️ Voice Interview</h1>

      {!reviewMode && questions.length > 0 && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">🧠 Question {currentIndex + 1}:</h2>
            <p className="text-gray-300">{questions[currentIndex]}</p>
            <button
              onClick={() => speak({ text: questions[currentIndex] })}
              className="mt-2 bg-yellow-600 px-4 py-2 font-semibold rounded hover:bg-yellow-700"
            >
              🔁 Repeat Question
            </button>
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
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">🗣️ Your Answer:</h3>
            <p className="text-gray-400 whitespace-pre-wrap">{answer}</p>
          </div>

          {loading && <p className="text-yellow-400">Evaluating...</p>}
        </>
      )}

      {reviewMode && (
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-400 mb-2">📊 Review of Your Answers:</h3>
          {feedback.map((fb, index) => (
            <div key={index} className="mb-2">
              <h4 className="text-lg font-semibold">Question {index + 1}:</h4>
              <p className="text-gray-200 whitespace-pre-wrap">{fb}</p>
              <p className="text-gray-400">Score: {scores[index]}</p>
            </div>
          ))}
          <h4 className="text-lg font-semibold">Average Score: {calculateAverageScore()}</h4>
        </div>
      )}
    </div>
  );
};

export default VoiceInterview;
