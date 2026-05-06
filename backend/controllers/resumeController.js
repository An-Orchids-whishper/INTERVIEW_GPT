const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("../models/Interview");

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is missing in environment variables." });
    }

    // Select the model and assign the system role
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: "You are an expert technical interviewer."
    });

    // Call the Google API
    const result = await model.generateContent(prompt);
    const output = result.response.text();

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
    console.error("🔥 Resume upload error:", error.message || error);
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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is missing in environment variables." });
    }

    // Select the model and assign the system role
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: "You are an expert career coach."
    });

    // Call the Google API
    const result = await model.generateContent(prompt);
    const content = result.response.text();

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
    console.error("🔥 Resume review error:", error.message || error);
    res.status(500).json({ error: "Failed to review resume" });
  }
};