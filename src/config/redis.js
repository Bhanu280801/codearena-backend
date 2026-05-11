require("dotenv").config();
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: {}
});

redis.on("connect" , ()=>{
    console.log("Redis connected")
})

redis.on("error", (err)=>{
    console.log("Redis error" , redis)
})

module.exports = redis