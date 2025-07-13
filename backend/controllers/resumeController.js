const pdfParse = require("pdf-parse");
const axios = require("axios");
const Interview = require("../models/Interview");

exports.uploadResumeAndGenerateQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text.slice(0, 3000);

    const prompt = `
Based on the following resume, generate 5 technical interview questions AND their ideal answers. 
Format:
Q1: ...
A1: ...
Q2: ...
A2: ...
Keep the answers concise, relevant, and aligned with the resume context.

Resume:
${extractedText}
    `;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenRouter API key is missing in environment variables." });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "You are an expert technical interviewer." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "InterviewGPT App",
          "Content-Type": "application/json",
        }
      }
    );

    const output = response.data.choices[0].message.content;

    const qaPairs = output.split(/\nQ\d+:/).slice(1).map(block => {
      const [question, ...rest] = block.trim().split(/\nA\d+:/);
      const answer = rest.join(":").trim();
      return {
        question: question.trim(),
        answer: answer || "Not provided",
      };
    });

    const questionList = qaPairs.map(q => q.question);
    const answerList = qaPairs.map(q => q.answer);

    const interview = new Interview({
      user: req.user.id,
      role: req.body.role || "Resume-Based Interview",
      questions: questionList,
      answers: answerList,
    });

    await interview.save();

    res.status(200).json({
      success: true,
      questions: questionList,
      answers: answerList,
    });

  } catch (error) {
    console.error("🔥 Resume upload error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to generate interview from resume" });
  }
};

exports.reviewResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text.slice(0, 3000);

    const prompt = `Analyze the following resume and provide:
1. A professional review covering strengths, weaknesses, and suggestions.
2. A rating out of 10 based on technical skills, clarity, and relevance.

Resume:
${extractedText}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenRouter API key is missing in environment variables." });
    }

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
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "InterviewGPT App",
          "Content-Type": "application/json",
        }
      }
    );

    const content = response.data.choices[0].message.content;

    const match = content.match(/rating.*?(\d{1,2})\/10/i);
    const rating = match ? parseInt(match[1]) : null;

    await Interview.findOneAndUpdate(
      { user: req.user.id },
      { $set: { resumeRating: rating } },
      { sort: { createdAt: -1 } }
    );

    res.status(200).json({
      success: true,
      review: content,
      rating: rating,
    });

  } catch (error) {
    console.error("🔥 Resume review error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to review resume" });
  }
};
