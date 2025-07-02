const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const {uploadResumeAndGenerateQuestions, reviewResume} = require("../controllers/resumeController")

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/resume", auth, upload.single("resume"), uploadResumeAndGenerateQuestions);
router.post("/review",auth,upload.single("resume"),reviewResume)
module.exports = router;
