import React, { useState } from "react";
import axios from "axios";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📤 Handle Interview Question Generation
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post("http://localhost:5000/api/upload/resume", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setQuestions(res.data.questions);
    } catch (err) {
      alert("Failed to generate questions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 📋 Handle Resume Review + Rating
  const handleReview = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload a resume first.");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/upload/review", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setReviewResult(res.data.review);
      setRating(res.data.rating); // ✅ capture rating
    } catch (err) {
      alert("Review failed.");
      console.error(err);
    }
  };

  // 🎨 Dynamic rating color
  const ratingColor =
    rating >= 8 ? "text-green-400" : rating >= 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-neutral-900 border border-white/10 p-6 rounded-2xl space-y-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold">Upload Your Resume</h2>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-white file:bg-white file:text-black file:font-bold file:px-4 file:py-2 file:rounded file:cursor-pointer"
        />

        <input
          type="text"
          placeholder="Enter target role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 rounded-md bg-neutral-800 border border-white/10 text-white"
        />

        <button
          type="submit"
          className="w-full py-3 bg-white text-black font-bold uppercase rounded hover:bg-gray-300 transition"
        >
          {loading ? "Processing..." : "Generate Questions"}
        </button>
      </form>

      {/* Resume Review Button */}
      <button
        onClick={handleReview}
        className="w-full max-w-md mt-4 py-3 bg-purple-500 text-white font-bold uppercase rounded hover:bg-purple-600 transition"
      >
        Review Resume
      </button>

      {/* Review Result */}
      {reviewResult && (
        <div className="mt-6 bg-neutral-900 p-6 rounded-xl border border-white/10 max-w-3xl w-full">
          <h2 className="text-xl font-bold mb-2">Resume Review:</h2>
          <pre className="text-gray-200 whitespace-pre-wrap">{reviewResult}</pre>
        </div>
      )}

      {/* Resume Rating */}
      {rating && (
        <div className="mt-4 bg-green-900 p-4 rounded-xl border border-green-600 max-w-3xl w-full">
          <h2 className="text-xl font-bold mb-2 text-green-300">AI Resume Rating:</h2>
          <p className={`text-3xl font-extrabold ${ratingColor}`}>{rating} / 10</p>
        </div>
      )}

      {/* Generated Questions */}
      {questions && (
        <div className="mt-8 bg-neutral-800 p-6 rounded-lg max-w-3xl w-full border border-white/10">
          <h3 className="text-xl font-bold mb-4">Tailored Interview Questions</h3>
          <pre className="whitespace-pre-wrap text-gray-300">{questions}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
