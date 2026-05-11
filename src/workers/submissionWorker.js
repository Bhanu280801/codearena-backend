require("dotenv").config();

const { Worker } = require("bullmq");

const redis = require("../config/redis");
const prisma = require("../config/db");

const worker = new Worker(
  "submissionQueue",

  async (job) => {
    console.log("Processing submission", job.data);

    const { submissionId } = job.data;

    await new Promise((resolve) =>
      setTimeout(resolve, 3000)
    );

    await prisma.submission.update({
      where: {
        id: submissionId
      },
      data: {
        status: "completed",
        verdict: "accepted",
        runtime: "0.12s",
        memory: "64mb"
      }
    });

    console.log(`Submission ${submissionId} processed`);
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