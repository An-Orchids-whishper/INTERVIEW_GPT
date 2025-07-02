const User = require('../models/User');
const Interview = require('../models/Interview');

const getDashboardData = async (req, res) => {
  try {
    console.log("✅ Controller hit");
    console.log("🧠 Decoded req.user:", req.user);

    const userId = req.user?.id;
    if (!userId) {
      console.log("❌ userId missing in req.user");
      return res.status(401).json({ error: "Invalid token or missing user ID" });
    }

    console.log("📌 userId:", userId);

    const user = await User.findById(userId).select('name email createdAt');
    console.log("📦 user from DB:", user);

    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 }).limit(5);
    console.log("📄 interviews:", interviews);

    const totalInterviews = await Interview.countDocuments({ userId });
    console.log("📊 totalInterviews:", totalInterviews);

    const latestInterview = await Interview.findOne({ userId }).sort({ createdAt: -1 });


    res.status(200).json({
      user,
      interviews,
      stats: { totalInterviews },
      resumeRating: latestInterview?.resumeRating || null,

    });

  } catch (error) {
    console.error("🔥 Error in getDashboardData:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = { getDashboardData };
