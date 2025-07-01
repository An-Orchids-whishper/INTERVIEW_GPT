const express = require("express");
const { generateInterview } = require("../controllers/interviewController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/generate", auth, generateInterview);

module.exports = router;
