const express = require('express');
const router = express.Router();
const employerController = require('../app/controllers/employerController');



router.get('/', employerController.index);



module.exports = router;
