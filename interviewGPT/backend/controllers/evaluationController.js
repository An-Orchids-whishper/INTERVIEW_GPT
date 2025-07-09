const Interview = require("../models/Interview");
const axios = require("axios");

exports.evaluateInterview = async (req, res) => {
  const { questions, answers } = req.body;

  if (!questions || !answers || questions.length !== answers.length) {
    return res.status(400).json({ error: "Questions and answers must match." });
  }

  const formattedQA = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i]}`).join("\n\n");

  const prompt = `
Evaluate the following technical interview. For each answer, consider correctness, depth, and clarity.
Then provide:
- A brief review for the specific answer
- A suggestion for improvement
- A rating if possible

${formattedQA}

Now write the review:
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const review = response.data.choices[0].message.content;

    // 📝 Save to DB
    await Interview.create({
      user: req.user._id,
      role: "Voice Interview",
      questions,
      answers,
      review,
    });

    res.status(200).json({ review });
  } catch (error) {
    console.error("❌ Error evaluating voice interview:", error.message);
    res.status(500).json({ error: "Evaluation failed." });
  }
};
