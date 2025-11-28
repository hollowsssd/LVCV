const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const corsOption = require('./src/app/config/cors')

app.use(express.json());

// Cors
<<<<<<< HEAD
// app.use(cors(corsOption));
=======
//app.use(cors(corsOption));
>>>>>>> 075bea39e8e73937f2e0e646ec04ad9945401e0f


app.get('/', (req, res) => { res.send("hello word !") });

const applicationRouter = require('./src/routes/applicationRoute');
const candidateRouter = require('./src/routes/candidateRoute');
const employerRouter = require('./src/routes/employerRoute');
const jobRouter = require('./src/routes/jobRoute');
const tagRouter = require('./src/routes/tagRoute');
const userRouter = require('./src/routes/userRoute');
const auth = require('./src/routes/auth');
const Cv = require('./src/routes/cvRoute');

app.use('/api/applications', applicationRouter);
app.use('/api/candidates', candidateRouter);
app.use('/api/employers', employerRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/tags', tagRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', auth);
app.use('/api/cv', Cv);
console.log("Hello Worlds!");

module.exports = app;
