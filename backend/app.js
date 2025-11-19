const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// app.use(morgan('combined'));

app.get('/', (req, res) => { res.send("hello word !") });

const applicationRouter = require('./src/routes/applicationRoute');
const candidateRouter = require('./src/routes/candidateRoute');
const employerRouter = require('./src/routes/employerRoute');
const jobRouter = require('./src/routes/jobRoute');
const tagRouter = require('./src/routes/tagRoute');
const userRouter = require('./src/routes/userRoute');
const auth = require('./src/routes/auth'); 

app.use('/api/applications', applicationRouter);
app.use('/api/candidates', candidateRouter);
app.use('/api/employers', employerRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/tags', tagRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', auth);
console.log("Hello Worlds!");
module.exports = app;
