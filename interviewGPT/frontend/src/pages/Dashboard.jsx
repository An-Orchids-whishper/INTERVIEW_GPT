import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardIllustration from "./undraw_dashboard_p93p.svg"; // SVG in /assets

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [resumeRating, setResumeRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Welcome Section with Illustration */}
        <div className="p-6 border rounded-2xl shadow-sm bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left text */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Welcome, {user.name || "User"}</h1>
            <p className="text-gray-600 text-sm">
              Email: {user.email} • Joined:{" "}
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '...'}
            </p>
          </div>

          {/* Illustration */}
          <div className="flex-shrink-0 w-40 md:w-52">
            <img
              src={DashboardIllustration}
              alt="Dashboard Visual"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border p-6 rounded-xl text-center shadow">
            <h2 className="text-3xl font-bold">{stats.totalInterviews ?? 0}</h2>
            <p className="text-sm text-gray-500 mt-2">Total Interviews</p>
          </div>
          {resumeRating !== null && (
            <div className="bg-white border p-6 rounded-xl text-center shadow">
              <h2 className="text-3xl font-bold">{resumeRating}/10</h2>
              <p className="text-sm text-gray-500 mt-2">Resume Rating</p>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="bg-gray-50 border p-6 rounded-2xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4">Recent Interviews</h3>
          {interviews.length === 0 ? (
            <p className="text-gray-500 italic">No interviews found yet.</p>
          ) : (
            <ul className="space-y-4">
              {interviews.map((item, idx) => (
                <li
                  key={idx}
                  className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <h4 className="text-lg font-semibold">{item.role}</h4>
                  <p className="text-sm text-gray-500">
                    Generated on: {new Date(item.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/generate')}
            disabled={loading}
            className="py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            {loading ? "Generating..." : "Generate Interview"}
          </button>

          <button
            onClick={() => navigate("/upload-resume")}
            className="py-3 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-900 transition"
          >
            Upload Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
