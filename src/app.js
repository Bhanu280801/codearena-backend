const express = require('express')

const cors = require('cors')
const helmet = require("helmet")
const morgan = require("morgan")

const authRoutes = require('./routes/authRoutes')

const problemRoutes = require('./routes/problemRoutes')

const submissionRoutes = require("./routes/submissionRoutes")
const contestRoutes = require("./routes/contestRoutes")
const statsRoutes = require("./routes/statsRoutes")
const leaderboardRoutes = require("./routes/leaderboardRoutes")
const { generalLimiter } = require("./middlewares/rateLimitMiddleware")
const { notFoundMiddleware, errorMiddleware } = require("./middlewares/errorMiddleware")

const app = express();

const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const isDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") {
    return false
  }

  return /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)
    || /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin)
}

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || clientOrigins.includes(origin) || isDevelopmentOrigin(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`))
  },
  credentials: true,
}))
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
app.use(generalLimiter)

app.use(express.json({ limit: "100kb" }))

app.use('/auth',authRoutes)

app.use('/problems', problemRoutes)

app.use("/submissions" , submissionRoutes)
app.use("/contests", contestRoutes)
app.use("/stats", statsRoutes)
app.use("/leaderboard", leaderboardRoutes)

app.get("/",(req,res)=>{

    res.send("Codearena Backend API Running")
})

app.use(notFoundMiddleware)
app.use(errorMiddleware)

module.exports = app
