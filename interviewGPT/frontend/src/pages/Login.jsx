import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-neutral-900 p-8 rounded-2xl shadow-2xl max-w-md w-full text-white space-y-6 border border-white/10">

        <div>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight">
            CONFIDENCE, STRATEGY <br /> & AI-POWERED PREPARATION
          </h2>
          <h3 className="text-2xl md:text-3xl font-extrabold uppercase mt-4 text-white">
            Built with InterviewGPT
          </h3>
        </div>

        
        <form onSubmit={handleLogin} className="space-y-4 pt-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 bg-neutral-800 border border-white/20 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-neutral-800 border border-white/20 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
          />

          <button
            type="submit"
            className="w-full py-3 bg-white text-black font-bold uppercase rounded-md hover:bg-gray-200 transition"
          >
            Login
          </button>

           <button
              onClick={() => navigate("/register")}
              className="ml-2 underline text-white hover:text-gray-300 transition"
            >
              Create an account
            </button>
        </form>
      </div>
    </div>
  );
}
