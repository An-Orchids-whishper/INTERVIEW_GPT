const axios = require("axios");
const Interview = require("../models/Interview");

exports.evaluateInterview = async (req, res) => {
  const { questions, answers } = req.body;

  if (!questions || !answers || questions.length !== answers.length) {
    return res.status(400).json({ error: "Questions and answers must be valid and matched." });
  }

  const formattedQA = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i]}`).join("\n\n");

  const prompt = `
Evaluate the following technical interview. For each answer, provide:
- A brief review
- A score out of 10 (mention as: Score: X/10)

${formattedQA}

Respond only with feedback and score.
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
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

    // ✅ Extract score from content like "Score: 7/10"
    const match = content.match(/score.*?(\d{1,2})\/10/i);
    const score = match ? parseInt(match[1]) : null;

    // Optionally save to DB
    await Interview.create({
      user: req.user?._id || null,
      role: req.body.role || "Voice Interview",
      questions,
      answers,
      review: content,
    });

    res.status(200).json({
      review: content,
      score,
    });
  } catch (error) {
    console.error("Error evaluating interview:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to evaluate interview." });
  }
};
