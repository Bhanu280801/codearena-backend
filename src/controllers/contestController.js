const prisma = require("../config/db");

const createContest = async (req, res) => {
  try {
    const { title, slug, description, startsAt, endsAt, isPublished, problems = [] } = req.body;

    if (!title || !slug || !startsAt || !endsAt) {
      return res.status(400).json({
        message: "title, slug, startsAt and endsAt are required"
      });
    }

    const contest = await prisma.contest.create({
      data: {
        title,
        slug,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isPublished: Boolean(isPublished),
        problems: {
          create: problems.map((problem, index) => ({
            problemId: Number(problem.problemId),
            points: problem.points || 100,
            order: problem.order ?? index
          }))
        }
      },
      include: {
        problems: {
          include: {
            problem: true
          },
          orderBy: {
            order: "asc"
          }
        }
      }
    });

    return res.status(201).json({
      message: "Contest created successfully",
      contest
    });
  } catch (error) {
    console.error("CREATE CONTEST ERROR:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        message: "A contest with that slug already exists"
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

const getContests = async (req, res) => {
  try {
    const where = req.user && req.user.role === "ADMIN" ? {} : { isPublished: true };

    const contests = await prisma.contest.findMany({
      where,
      orderBy: {
        startsAt: "desc"
      }
    });

    return res.status(200).json(contests);
  } catch (error) {
    console.error("GET CONTESTS ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

const getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    const where = {
      id: Number(id),
      ...(req.user && req.user.role === "ADMIN" ? {} : { isPublished: true })
    };

    const contest = await prisma.contest.findFirst({
      where,
      include: {
        problems: {
          include: {
            problem: true
          },
          orderBy: {
            order: "asc"
          }
        },
        participants: true
      }
    });

    if (!contest) {
      return res.status(404).json({
        message: "Contest not found"
      });
    }

    return res.status(200).json(contest);
  } catch (error) {
    console.error("GET CONTEST BY ID ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

const joinContest = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await prisma.contest.findFirst({
      where: {
        id: Number(id),
        isPublished: true
      }
    });

    if (!contest) {
      return res.status(404).json({
        message: "Contest not found"
      });
    }

    const participant = await prisma.contestParticipant.upsert({
      where: {
        contestId_userId: {
          contestId: contest.id,
          userId: req.user.id
        }
      },
      update: {},
      create: {
        contestId: contest.id,
        userId: req.user.id
      }
    });

    return res.status(200).json({
      message: "Joined contest successfully",
      participant
    });
  } catch (error) {
    console.error("JOIN CONTEST ERROR:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createContest,
  getContests,
  getContestById,
  joinContest
};
