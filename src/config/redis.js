require("dotenv").config();
const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;
const redisOptions = {
  maxRetriesPerRequest: null
};

if (redisUrl && redisUrl.startsWith("rediss://")) {
  redisOptions.tls = {};
}

const redis = redisUrl ? new Redis(redisUrl, redisOptions) : null;

if (!redis) {
    console.warn("REDIS_URL is not set; submission queue is disabled")
} else {
redis.on("connect" , ()=>{
    console.log("Redis connected")
})

redis.on("error", (err)=>{
    console.log("Redis error" , err.message)
})
}

module.exports = redis
