const prisma = require("../config/db");

const getMyStats = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId: req.user.id
      },
      select: {
        problemId: true,
        verdict: true,
        language: true
      }
    });

    const acceptedProblemIds = new Set(
      submissions
        .filter((submission) => submission.verdict === "accepted")
        .map((submission) => submission.problemId)
    );

    const byLanguage = submissions.reduce((acc, submission) => {
      acc[submission.language] = (acc[submission.language] || 0) + 1;
      return acc;
    }, {});

    const byVerdict = submissions.reduce((acc, submission) => {
      const verdict = submission.verdict || "pending";
      acc[verdict] = (acc[verdict] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      totalSubmissions: submissions.length,
      solvedProblems: acceptedProblemIds.size,
      byLanguage,
      byVerdict
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getMyStats
};
