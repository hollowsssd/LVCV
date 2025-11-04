const express = require('express')
const morgan = require('morgan')
const app = express()


// app.use(morgan('combined'))
app.get('/', (req, res) => { res.send("hello word !") })

const userRouter = require('./src/routes/userRoute')

app.use("/user", userRouter);


module.exports = app