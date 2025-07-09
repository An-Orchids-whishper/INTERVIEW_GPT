const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const interviewRoutes = require("./routes/interview");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🚀 MongoDB connection
mongoose.connect(process.env.MONGO_URI)
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

// 🔊 Remove this line — duplicate / unnecessary
// app.use("/api/voice", require("./routes/interview"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
