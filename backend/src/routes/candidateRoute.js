const express = require('express');
const router = express.Router();
const candidateController = require('../app/controllers/candidateController');



router.get('/', candidateController.index);



module.exports = router;
