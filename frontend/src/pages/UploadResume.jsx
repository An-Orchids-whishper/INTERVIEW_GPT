import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Aapka Live Backend URL
  const API_BASE_URL = "https://interview-backend-2vew.onrender.com";

  // 📥 Upload Resume & Generate QnA
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 2. Localhost changed to Live URL with backticks
      const res = await axios.post(`${API_BASE_URL}/api/upload/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { questions, answers } = res.data;
      setQuestions(questions.join("\n"));

      // ✅ Store in localStorage
      localStorage.setItem("resumeQuestions", JSON.stringify(questions));
      localStorage.setItem("resumeAnswers", JSON.stringify(answers));
      localStorage.setItem("resumeRole", role);

      alert("✅ Questions and answers saved. You can now start your voice interview.");
    } catch (err) {
      alert("❌ Failed to generate questions. Check if the file is a valid PDF.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 📋 Review Resume
  const handleReview = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload a resume first.");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      
      // 3. Localhost changed to Live URL with backticks
      const res = await axios.post(`${API_BASE_URL}/api/upload/review`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      setReviewResult(res.data.review);
      setRating(res.data.rating);
    } catch (err) {
      alert("❌ Review failed. Backend might be waking up, try again in 30s.");
      console.error(err);
    }
  };

  const ratingColor =
    rating >= 8 ? "text-green-400" : rating >= 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-neutral-900 border border-white/10 p-6 rounded-2xl space-y-4 w-full max-w-md shadow-xl"
      >
        <h2 className="text-2xl font-bold text-indigo-400">Upload Your Resume</h2>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-white file:bg-white file:text-black file:font-bold file:px-4 file:py-2 file:rounded file:cursor-pointer hover:file:bg-gray-200 transition"
        />

        <input
          type="text"
          placeholder="Enter target role (e.g. SDE-1)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded-md bg-neutral-800 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-black font-bold uppercase rounded hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? "Processing PDF..." : "Generate Questions"}
        </button>
      </form>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex flex-col gap-3 mt-4">
        <button
          onClick={handleReview}
          className="py-3 bg-purple-600 text-white font-bold uppercase rounded hover:bg-purple-700 shadow-lg shadow-purple-900/20 transition"
        >
          AI Resume Review
        </button>

        <button
          onClick={() => navigate("/voice-interview")}
          className="py-3 bg-blue-600 text-white font-bold uppercase rounded hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition"
        >
          Start Voice Interview
        </button>
      </div>

      {/* Review Result */}
      {reviewResult && (
        <div className="mt-6 bg-neutral-900 p-6 rounded-xl border border-white/10 max-w-3xl w-full animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold mb-2 text-purple-400">Resume Review:</h2>
          <pre className="text-gray-200 whitespace-pre-wrap font-sans">{reviewResult}</pre>
        </div>
      )}

      {/* Resume Rating */}
      {rating && (
        <div className="mt-4 bg-green-900/30 p-4 rounded-xl border border-green-600/50 max-w-3xl w-full text-center">
          <h2 className="text-xl font-bold mb-2 text-green-300">AI Resume Score:</h2>
          <p className={`text-5xl font-extrabold ${ratingColor}`}>{rating} / 10</p>
        </div>
      )}

      {/* Generated Questions Area */}
      {questions && (
        <div className="mt-8 bg-neutral-800 p-6 rounded-lg max-w-3xl w-full border border-white/10 shadow-inner">
          <h3 className="text-xl font-bold mb-4 text-indigo-300">Tailored Questions for {role}</h3>
          <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">{questions}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadResume;