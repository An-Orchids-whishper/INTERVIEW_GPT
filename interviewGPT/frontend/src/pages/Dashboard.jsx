import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-black/80 backdrop-blur-md rounded-xl p-8 shadow-xl">
        <h1 className="text-4xl font-serif mb-4">Welcome to InterviewGPT 🎯</h1>
        <p className="text-gray-300 mb-8">
          What would you like to do today?
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/generate")}
            className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
            🎤 Generate Interview
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-400 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
