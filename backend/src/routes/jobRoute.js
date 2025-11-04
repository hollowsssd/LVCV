const express = require('express');
const router = express.Router();
const jobController = require('../app/controllers/jobController');



router.get('/', jobController.index);



module.exports = router;
