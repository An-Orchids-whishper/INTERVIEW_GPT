import { use, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate =  useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      alert("Registered! Please login.");
      navigate("/");

    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-neutral-900 p-8 rounded-2xl shadow-2xl max-w-md w-full text-white space-y-6 border border-white/10">
        {/* Headings */}
        <div>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight">
            START SMART <br /> WITH AI-PREP POWER
          </h2>
          <h3 className="text-2xl md:text-3xl font-extrabold uppercase mt-4 text-white">
            Join InterviewGPT
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 pt-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-3 bg-neutral-800 border border-white/20 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
          />

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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
