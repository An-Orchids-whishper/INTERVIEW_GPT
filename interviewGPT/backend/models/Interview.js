const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String,
  questions: [String],
  answers: [String],
  review: { type: String, default: "" },
  resumeRating: {
    type: Number,
    default: null,
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", interviewSchema);
