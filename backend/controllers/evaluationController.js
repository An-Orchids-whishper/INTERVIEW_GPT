const axios = require("axios");
const Interview = require("../models/Interview");

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
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // 🚀 UPDATED MODEL HERE
        model: "arcee-ai/trinity-large-preview:free",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer providing constructive feedback."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "InterviewGPT",
        },
      }
    );

    const content = response.data.choices[0].message.content;

    // ✅ This will now reliably grab the "Overall Score: X/10" from the end of the text
    const match = content.match(/score.*?(\d{1,2})\/10/i);
    const score = match ? parseInt(match[1]) : null;

    // Optionally save to DB
    await Interview.create({
      user: req.user?._id || null, // Make sure your middleware is setting req.user
      role: req.body.role || "Voice Interview",
      questions,
      answers,
      review: content, // We save the full text (feedback + score) to the DB
      score: score // It's good practice to save the parsed integer score too if your schema allows it!
    });

    res.status(200).json({
      success: true,
      review: content,
      score,
    });
  } catch (error) {
    console.error("🔥 Error evaluating interview:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to evaluate interview." });
  }
};