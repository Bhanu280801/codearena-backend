const { Queue} = require("bullmq")

const redis = require("../config/redis")

const submissionQueue = redis ? new Queue("submissionQueue" , {
    connection : redis
}) : null

module.exports = submissionQueue;
