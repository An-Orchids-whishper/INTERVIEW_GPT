import { useState } from "react";
import axios from "axios";

export default function GenerateInterview() {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/interview/generate",
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setQuestions(res.data.questions);
    } catch (err) {
      alert("Error generating questions");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-neutral-900 border border-white/10 rounded-2xl p-10 shadow-2xl space-y-8">
        {/* Header */}
        <header className="space-y-3 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold tracking-tight leading-tight">
            InterviewGPT
          </h1>
          <p className="text-gray-300 text-lg">
            Generate tailored interview questions for any role using AI.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
              Target Role
            </label>
            <input
              type="text"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Product Manager, Data Scientist"
              className="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition duration-200"
          >
            {loading ? "Generating..." : "Generate Interview Questions"}
          </button>
        </form>

        {/* Result */}
        {questions && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Generated Questions:</h2>
            <div className="bg-neutral-800 border border-white/10 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {questions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
