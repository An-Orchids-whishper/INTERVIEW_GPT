const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String,
  questions: [String],
  createdAt: { type: Date, default: Date.now },
   resumeRating: {
  type: Number,
  default: null,
  }
});

module.exports = mongoose.model("Interview", interviewSchema);
