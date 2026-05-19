const prisma = require("../config/db");

const getGlobalLeaderboard = async (req, res) => {
  const acceptedSubmissions = await prisma.submission.findMany({
    where: {
      verdict: "accepted"
    },
    select: {
      userId: true,
      problemId: true,
      user: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const rowsByUser = new Map();

  acceptedSubmissions.forEach((submission) => {
    if (!rowsByUser.has(submission.userId)) {
      rowsByUser.set(submission.userId, {
        user: submission.user,
        solvedProblems: new Set()
      });
    }

    rowsByUser.get(submission.userId).solvedProblems.add(submission.problemId);
  });

  const leaderboard = Array.from(rowsByUser.values())
    .map((row) => ({
      user: row.user,
      solvedCount: row.solvedProblems.size
    }))
    .sort((a, b) => b.solvedCount - a.solvedCount)
    .slice(0, 100);

  return res.status(200).json(leaderboard);
};

module.exports = {
  getGlobalLeaderboard
};
