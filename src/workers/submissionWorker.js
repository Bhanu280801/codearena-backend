require("dotenv").config();

const { executeJavaScript } = require("../utils/codeExecuter");

const { Worker } = require("bullmq");

const redis = require("../config/redis");
const prisma = require("../config/db");

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

    const code = submission.sourceCode;

    const expectedOutput =
      submission.problem.testCases[0].output;

    try {

      const actualOutput =
        await executeJavaScript(code);

      const verdict =
        actualOutput === expectedOutput
          ? "accepted"
          : "wrong answer";

      await prisma.submission.update({
        where: {
          id: submissionId
        },
        data: {
          status: "completed",
          verdict,
          runtime: "0.12s",
          memory: "64mb"
        }
      });

      console.log(
        `Submission ${submissionId} ${verdict}`
      );

    } catch (error) {

      await prisma.submission.update({
        where: {
          id: submissionId
        },
        data: {
          status: "completed",
          verdict: "runtime error"
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