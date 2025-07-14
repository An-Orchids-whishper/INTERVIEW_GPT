import React from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "./undraw_ai-agent_pdkp.svg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black font-serif overflow-hidden relative">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 border-b">
        <h1 className="text-2xl font-bold font-sans">InterviewGPT</h1>
        <div className="space-x-6 text-sm font-sans">
          <button onClick={() => navigate("/login")} className="hover:underline">
            Login
          </button>
          <button onClick={() => navigate("/register")} className="hover:underline">
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left Text */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            <span className="block">Ace Your Interview</span>
            <span className="block text-indigo-600">with the Power of AI</span>
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            Upload your resume, generate tailored questions, and practice with real-time AI feedback.
            Let InterviewGPT prepare you for success.
          </p>
          <button
            onClick={() => navigate("/upload-resume")}
            className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium transition"
          >
            Get Started
          </button>
        </div>

        {/* Right Illustration */}
        <div className="flex-1">
          <img
            src={heroImg}
            alt="AI Interview Illustration"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t mt-10">
        © {new Date().getFullYear()} InterviewGPT. Built with love & AI.
      </footer>
    </div>
  );
};

export default Landing;
