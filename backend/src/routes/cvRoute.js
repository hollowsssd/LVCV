const express = require('express');
const router = express.Router();
const cvController = require('../app/controllers/cvController');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/rate-cv", upload.single("cvfile"), cvController.rateCV);



module.exports = router;
