const axios = require("axios");
const Interview = require('../models/Interview');
require("dotenv").config();

exports.generateInterview = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;  // ✅ This was missing

    if (!role) {
      return res.status(400).json({ error: "Role is required in the request body." });
    }

    const prompt = `Generate 5 concise interview questions for a ${role} position.`;
    console.log("🧠 Prompt to OpenRouter:", prompt);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "InterviewGPT App",
          "Content-Type": "application/json"
        }
      }
    );

    const questionText = response.data.choices[0].message.content;
    const questions = questionText.split(/\n+/).filter(q => q.trim() !== "");

    const interview = new Interview({
      userId,   
      role,
      questions,
    });

    await interview.save();

    res.status(200).json({
      success: true,
      role,
      questions
    });

  } catch (error) {
    console.error("🔥 OpenRouter API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "OpenRouter API error",
      message: error.response?.data || error.message
    });
  }
};
