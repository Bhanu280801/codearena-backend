const { Queue} = require("bullmq")

const redis = require("../config/redis")

const submissionQueue = new Queue("submissionQueue" , {
    connection : redis
})

module.exports = submissionQueue;