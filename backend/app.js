const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
// app.use(morgan('combined'));

app.get('/', (req, res) => { res.send("hello word !") });

const applicationRouter = require('./src/routes/applicationRoute');
const candidateRouter = require('./src/routes/candidateRoute');
const employerRouter = require('./src/routes/employerRoute');
const jobRouter = require('./src/routes/jobRoute');
const tagRouter = require('./src/routes/tagRoute');
const userRouter = require('./src/routes/userRoute');

app.use('/api/applications', applicationRouter);
app.use('/api/candidates', candidateRouter);
app.use('/api/employers', employerRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/tags', tagRouter);
app.use('/api/users', userRouter);

console.log("Hello Worlds!");
module.exports = app;
