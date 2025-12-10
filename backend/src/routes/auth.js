const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');
const rateLimit = require("../app/middlewares/rateLimit")

router.post('/register', rateLimit, authController.register);

router.post('/login', rateLimit, authController.login);

module.exports = router;