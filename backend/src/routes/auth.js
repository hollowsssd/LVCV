const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');
const rateLimit = require("../app/middlewares/rateLimit")
const { guestOnly } = require("../app/middlewares/authorization");

router.post('/register', guestOnly,rateLimit, authController.register);

router.post('/login', guestOnly,rateLimit, authController.login);

module.exports = router;