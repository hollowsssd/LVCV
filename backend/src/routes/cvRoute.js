const express = require('express');
const router = express.Router();
const cvController = require('../app/controllers/cvController');



router.get('/', cvController.index);



module.exports = router;
