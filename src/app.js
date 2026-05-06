const express = require('express')

const cors = require('cors')

const authRoutes = require('./routes/authRoutes')

const problemRoutes = require('./routes/problemRoutes')

const app = express();

app.use(cors())

app.use(express.json())

app.use('/auth',authRoutes)

app.use('/problems', problemRoutes)

app.get("/",(req,res)=>{
    res.send("Codearena Backend API Running")
})

module.exports = app
