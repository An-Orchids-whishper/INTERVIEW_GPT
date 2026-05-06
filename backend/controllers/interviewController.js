const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require('../models/Interview');
require("dotenv").config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateInterview = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;  

    if (!role) {
      return res.status(400).json({ error: "Role is required in the request body." });
    }

    // 💡 TWEAKED PROMPT: Forces the AI to output exactly 5 lines with no introductory text
    const prompt = `Generate exactly 5 concise interview questions for a ${role} position. 
Do not include any introductory or concluding text. 
Output each question on a new line.`;
    
    console.log("🧠 Prompt to Gemini:", prompt);

    // Select the model and assign the system role
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite", 
      systemInstruction: "You are an expert interviewer assistant."
    });

    // Call the Google API
    const result = await model.generateContent(prompt);
    
    // Extract the text from the response
    const questionText = result.response.text();
    
    // Parses the text, removes empty lines, and cleans up any leading numbers (like "1. ")
    const questions = questionText
      .split(/\n+/)
      .filter(q => q.trim() !== "")
      .map(q => q.replace(/^\d+\.\s*/, '').trim()); // Clean up list numbers

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
    console.error("🔥 Gemini API Error:", error.message);
    res.status(500).json({
      error: "Gemini API error",
      message: error.message
    });
  }
};
