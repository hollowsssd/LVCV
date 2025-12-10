const express = require('express');
const router = express.Router();
const applicationController = require('../app/controllers/applicationController');
const auth = require('../app/middlewares/auth');
const author = require('../app/middlewares/authorization');

router.use(auth, author('CANDIDATE'));

router.get('/', applicationController.index);

router.get('/:id', applicationController.show);

// ứng tuyển job
router.post('/', applicationController.create);

router.put('/:id', applicationController.update);

router.delete('/:id', applicationController.delete);


module.exports = router;
