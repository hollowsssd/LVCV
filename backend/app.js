const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const corsOption = require('./src/app/config/cors')
const path = require("path");
const { passport } = require('./src/app/config/passport');

app.use(express.json());

// Cors
app.use(cors(corsOption));

app.use(express.urlencoded({ extended: true }));

// Initialize Passport (không cần session vì dùng JWT)
app.use(passport.initialize());

// serve uploads
const PROJECT_ROOT = path.resolve(__dirname, ".."); // vì server.js nằm trong backend
const UPLOADS_DIR = path.join(PROJECT_ROOT, "uploads");

app.use("/uploads", express.static(UPLOADS_DIR));

app.get('/', (req, res) => { res.send("hello word !") });

const applicationRouter = require('./src/routes/applicationRoute');
const candidateRouter = require('./src/routes/candidateRoute');
const cvRouter = require('./src/routes/cvRoute');
const employerRouter = require('./src/routes/employerRoute');
const jobRouter = require('./src/routes/jobRoute');
const userRouter = require('./src/routes/userRoute');
const auth = require('./src/routes/auth');
const notificationRouter = require('./src/routes/notificationRoute');


app.use('/api/applications', applicationRouter);
app.use('/api/candidates', candidateRouter);
app.use("/api/cvs", cvRouter);
app.use('/api/employers', employerRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', auth);
app.use('/api/notifications', notificationRouter);

console.log("Hello Worlds!");

module.exports = app;
