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

app.use(helmet())
app.use(cors())
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
app.use(generalLimiter)

app.use(express.json())

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
