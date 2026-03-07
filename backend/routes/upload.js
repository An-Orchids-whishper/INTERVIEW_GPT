const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const { uploadResumeAndGenerateQuestions, reviewResume } = require("../controllers/resumeController");

const router = express.Router();

// 📂 Multer setup with 5MB limit
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// 🚀 Resume Upload & Generate Route
router.post("/resume", auth, (req, res, next) => {
    console.log("📩 Incoming Resume Upload Request..."); 
    next();
}, upload.single("resume"), uploadResumeAndGenerateQuestions);

// 📋 Resume Review Route
router.post("/review", auth, (req, res, next) => {
    console.log("🔍 Incoming Resume Review Request...");
    next();
}, upload.single("resume"), reviewResume);

module.exports = router;