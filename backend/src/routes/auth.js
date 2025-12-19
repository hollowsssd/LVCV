const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');
const rateLimit = require("../app/middlewares/rateLimit")

router.post('/register', authController.register);

router.post('/login', authController.login);

module.exports = router;