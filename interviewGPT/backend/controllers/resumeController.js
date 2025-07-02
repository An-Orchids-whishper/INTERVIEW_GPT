const pdfParse = require("pdf-parse");
const axios = require("axios");
const Interview = require("../models/Interview");

exports.uploadResumeAndGenerateQuestions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text.slice(0, 3000);

    const prompt = `Based on this resume, generate 5 interview questions to test the candidate's technical and, use emojis while describing communication skills:\n\n${extractedText}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "You are an expert interviewer assistant." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "InterviewGPT App",
          "Content-Type": "application/json"
        }
      }
    );

    const questions = response.data.choices[0].message.content;

    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("🔥 Resume upload error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate questions from resume" });
  }
};

exports.reviewResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text.slice(0, 3000);

    const prompt = `Analyze the following resume and provide:
1. A professional review covering strengths, weaknesses, and suggestions.
2. A rating out of 10 based on technical skills, clarity, and relevance.\n\n${extractedText}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "You are an expert career coach." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "InterviewGPT App",
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;

    // Extract rating from the content
    const match = content.match(/rating.*?(\d{1,2})\/10/i);
    const rating = match ? parseInt(match[1]) : null;

    // Save rating to latest interview document
    await Interview.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { resumeRating: rating } },
      { sort: { createdAt: -1 } }
    );

    // ✅ Send response back to frontend
    res.status(200).json({
      success: true,
      review: content,
      rating: rating,
    });

  } catch (error) {
    console.error("Resume review error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to review resume" });
  }
};
