const prisma = require("../config/db")

const { judgeSubmission } = require("../services/judgeService")

const processSubmissionInline = async (submissionId) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: {
                id: submissionId
            },
            include: {
                problem: true
            }
        })

        if (!submission) {
            throw new Error(`Submission ${submissionId} not found`)
        }

        await prisma.submission.update({
            where: {
                id: submissionId
            },
            data: {
                status: "processing"
            }
        })

        const result = await judgeSubmission({
            submission,
            problem: submission.problem
        })

        await prisma.submission.update({
            where: {
                id: submissionId
            },
            data: {
                status: "completed",
                verdict: result.verdict,
                runtime: result.runtime,
                memory: "N/A",
                passedTestCases: result.passedTestCases,
                totalTestCases: result.totalTestCases,
                errorMessage: result.error || formatFailureDetails(result.failedTestCase)
            }
        })
    } catch (error) {
        console.error("Inline submission processing error", error)

        await prisma.submission.update({
            where: {
                id: submissionId
            },
            data: {
                status: "completed",
                verdict: "system error",
                errorMessage: error.message
            }
        })
    }
}

const formatFailureDetails = (failedTestCase) => {
    if (!failedTestCase) {
        return null
    }

    return JSON.stringify({
        type: "failed_test_case",
        ...failedTestCase
    })
}

const canProcessInline = () => {
    return process.env.NODE_ENV !== "production" && process.env.USE_SUBMISSION_QUEUE !== "true"
}

const enqueueSubmission = async (submissionId) => {
    if (canProcessInline()) {
        throw new Error("Submission queue is disabled in local development")
    }

    const redis = require("../config/redis")
    const submissionQueue = require("../jobs/submissionQueue")

    if (!redis || !submissionQueue || redis.status !== "ready") {
        throw new Error("Redis is not ready")
    }

    await submissionQueue.add("processSubmission", {
        submissionId
    })
}

// Safe problem fields to return alongside a submission (excludes testCases)
const PROBLEM_SELECT = {
    id: true,
    title: true,
    slug: true,
    difficulty: true,
    tags: true,
    timeLimitMs: true,
    memoryLimitMb: true
}

const createSubmission = async (req, res) => {
    try {
        const {
            problemId,
            sourceCode,
            language,
        } = req.body;

        if (!problemId || !sourceCode || !language) {
            return res.status(400).json({
                message: "problemId, sourceCode and language are required"
            })
        }

        if (String(sourceCode).length > 65536) {
            return res.status(400).json({
                message: "Source code exceeds the maximum allowed size (64 KB)"
            })
        }

        const userId = req.user.id

        const problem = await prisma.problem.findUnique({
            where: {
                id: Number(problemId)
            }
        })

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            })
        }

        const submission = await prisma.submission.create({
            data: {
                sourceCode,
                language: String(language).toLowerCase(),
                userId,
                problemId: Number(problemId),
                status: "pending",
                totalTestCases: Array.isArray(problem.testCases) ? problem.testCases.length : null
            }
        })

        try {
            await enqueueSubmission(submission.id)
            console.log("Job added to queue");
        } catch (queueError) {
            if (!canProcessInline()) {
                console.error("Submission queue unavailable:", queueError.message)

                await prisma.submission.update({
                    where: {
                        id: submission.id
                    },
                    data: {
                        status: "completed",
                        verdict: "system error",
                        errorMessage: "Submission queue is unavailable"
                    }
                })

                return res.status(503).json({
                    message: "Submission queue is unavailable. Please try again later.",
                    submissionId: submission.id
                })
            }

            console.warn("Queue unavailable, processing submission inline:", queueError.message)
            setImmediate(() => processSubmissionInline(submission.id))
        }

        return res.status(201).json({
            message: "Submission created successfully",
            submissionId: submission.id,
            submission
        })
    } catch (error) {
        console.error("Submission error", error)

        return res.status(500).json({
            message: error.message
        })
    }
}

const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user.id;

        const submissions = await prisma.submission.findMany({
            where: {
                userId
            },
            include: {
                problem: {
                    select: PROBLEM_SELECT
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.status(200).json(submissions)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

const getMySubmissionsByProblem = async (req, res) => {
    try {
        const problemId = Number(req.params.problemId);

        if (!Number.isInteger(problemId)) {
            return res.status(400).json({
                message: "Invalid problem id"
            })
        }

        const submissions = await prisma.submission.findMany({
            where: {
                userId: req.user.id,
                problemId
            },
            include: {
                problem: {
                    select: PROBLEM_SELECT
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.status(200).json(submissions)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        problem: {
          select: PROBLEM_SELECT
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found"
      });
    }

    if (submission.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "You do not have access to this submission"
      });
    }

    return res.status(200).json(submission);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
    createSubmission,
    getMySubmissions,
    getMySubmissionsByProblem,
    getSubmissionById
}
