const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Controllers
const { generateInterview } = require("../controllers/interviewController");
const { evaluateInterview } = require("../controllers/evaluationController");

// Routes
router.post("/generate", auth, generateInterview);                 // for text-based generation
router.post("/voice/evaluate", auth, evaluateInterview);           // for voice-based evaluation

module.exports = router;
