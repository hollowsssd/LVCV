const express = require('express');
const router = express.Router();
const applicationController = require('../app/controllers/applicationController');



router.get('/', applicationController.index);



module.exports = router;
