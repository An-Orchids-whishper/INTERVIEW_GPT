import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [resumeRating, setResumeRating] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user);
      setInterviews(res.data.interviews);
      setStats(res.data.stats);
      setResumeRating(res.data.resumeRating);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">

        {/* Header */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
            Welcome, {user.name || "User"}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Email: {user.email}</p>
          <p className="text-gray-400 text-sm">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '...'}</p>
        </div>

        {/* Stats & Resume Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="bg-white text-black p-6 rounded-2xl shadow-inner text-center border border-white/10">
            <h2 className="text-3xl font-bold">{stats.totalInterviews ?? 0}</h2>
            <p className="text-sm mt-2 uppercase tracking-wider font-semibold text-gray-700">Total Interviews</p>
          </div>

          {resumeRating !== null && (
            <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-md text-center border border-white/10">
              <h2 className="text-3xl font-bold">{resumeRating}/10</h2>
              <p className="text-sm mt-2 uppercase tracking-wider font-semibold">Resume Rating</p>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6">
          <h3 className="text-2xl font-bold mb-4">Recent Interviews</h3>

          {interviews.length === 0 ? (
            <p className="text-gray-400 italic">No interviews found.</p>
          ) : (
            <ul className="space-y-4">
              {interviews.map((item, idx) => (
                <li key={idx} className="bg-neutral-800 border border-white/10 p-4 rounded-lg">
                  <h4 className="text-xl font-semibold">{item.role}</h4>
                  <p className="text-gray-400 text-sm">
                    Generated on: {new Date(item.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate('/generate')}
            disabled={loading}
            className="w-full py-3 bg-white text-black font-bold uppercase rounded-md hover:bg-gray-200 transition"
          >
            {loading ? "Generating..." : "Generate Interview"}
          </button>

          <button
            onClick={() => navigate("/upload-resume")}
            className="w-full py-3 bg-white text-black font-bold uppercase rounded-md hover:bg-gray-200 transition"
          >
            Upload Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
