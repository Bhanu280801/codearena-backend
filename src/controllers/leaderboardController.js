const prisma = require("../config/db");

const getGlobalLeaderboard = async (req, res) => {
  try {
    // Aggregate at the database level to avoid loading all rows into memory
    const leaderboard = await prisma.$queryRaw`
      SELECT
        u.id,
        u.username,
        COUNT(DISTINCT s."problemId")::int AS "solvedCount"
      FROM "Submission" s
      JOIN "User" u ON s."userId" = u.id
      WHERE s.verdict = 'accepted'
      GROUP BY u.id, u.username
      ORDER BY "solvedCount" DESC
      LIMIT 100
    `;

    return res.status(200).json(
      leaderboard.map((row) => ({
        user: { id: row.id, username: row.username },
        solvedCount: row.solvedCount
      }))
    );
  } catch (error) {
    console.error("GET LEADERBOARD ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getGlobalLeaderboard
};
