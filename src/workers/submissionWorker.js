require("dotenv").config();

const { Worker } = require("bullmq");

const redis = require("../config/redis");
const prisma = require("../config/db");
const { judgeSubmission } = require("../services/judgeService");

const worker = new Worker(
  "submissionQueue",

  async (job) => {

    console.log("Processing submission", job.data);

    const { submissionId } = job.data;

    const submission =
      await prisma.submission.findUnique({
        where: {
          id: submissionId
        },
        include: {
          problem: true
        }
      });

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    try {

      await prisma.submission.update({
        where: {
          id: submissionId
        },
        data: {
          status: "processing"
        }
      });

      const result = await judgeSubmission({
        submission,
        problem: submission.problem
      });

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
          errorMessage: result.error || null
        }
      });

      console.log(
        `Submission ${submissionId} ${result.verdict} (${result.passedTestCases}/${result.totalTestCases})`
      );

    } catch (error) {

      await prisma.submission.update({
        where: {
          id: submissionId
        },
        data: {
          status: "completed",
          verdict: "system error",
          errorMessage: error.message
        }
      });

      console.log("Execution error:", error);
    }
  },

  {
    connection: redis
  }
);

worker.on("completed", (job) => {
  console.log(`Job completed ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log("Job failed:", err);
});
