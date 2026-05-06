const dotenv = require("dotenv");
dotenv.config(); // 👈 must be at the top, before any other imports

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const interviewRoutes = require("./routes/interview");

const app = express();
app.use(cors());
app.use(express.json());

// 🚀 MongoDB connection (UPDATED FOR VERCEL)
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Fails quickly if connection drops rather than hanging
  family: 4 // 👈 Forces IPv4 to bypass the Vercel Node 18+ DNS bug
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔹 Base route
app.get("/", (req, res) => {
  res.send("🚀 InterviewGPT server is live!");
});

// ✅ Register routes
try {
  console.log("📂 Trying to load dashboard route...");
  const dashboardRoutes = require('./routes/dashboard');
  app.use("/api/dashboard", dashboardRoutes);
  console.log("✅ dashboardRoutes registered");
} catch (err) {
  console.error("❌ Failed to load dashboard route:", err.message);
}

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/interview", interviewRoutes); // includes /generate and /voice/evaluate

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));