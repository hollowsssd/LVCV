const express = require('express');
const router = express.Router();
const tagController = require('../app/controllers/tagController');



router.get('/', tagController.index);



module.exports = router;
