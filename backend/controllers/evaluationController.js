const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("../models/Interview");

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.evaluateInterview = async (req, res) => {
  const { questions, answers } = req.body;

  if (!questions || !answers || questions.length !== answers.length) {
    return res.status(400).json({ error: "Questions and answers must be valid and matched." });
  }

  const formattedQA = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i]}`).join("\n\n");

  const prompt = `
Evaluate the following technical interview. 
First, for each answer, provide a brief review pointing out strengths and areas for improvement.
Then, at the very end of your response, provide a single overall score for the entire interview in this exact format:
Overall Score: X/10

Interview Data:
${formattedQA}
`;

  try {
    // Select the model and assign the system role
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", 
      systemInstruction: "You are an expert technical interviewer providing constructive feedback."
    });

    // Call the Google API
    const result = await model.generateContent(prompt);
    
    // Extract the text from the response
    const content = result.response.text();

    // Reliable regex extraction for the score
    const match = content.match(/score.*?(\d{1,2})\/10/i);
    const score = match ? parseInt(match[1]) : null;

    // Save to DB
    await Interview.create({
      user: req.user?._id || null, // Make sure your middleware is setting req.user
      role: req.body.role || "Voice Interview",
      questions,
      answers,
      review: content,
      score: score 
    });

    res.status(200).json({
      success: true,
      review: content,
      score,
    });
  } catch (error) {
    console.error("🔥 Error evaluating interview:", error.message);
    res.status(500).json({ error: "Failed to evaluate interview." });
  }
};