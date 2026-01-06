const express = require('express');
const router = express.Router();
const applicationController = require('../app/controllers/applicationController');
const auth = require('../app/middlewares/auth');
const author = require('../app/middlewares/authorization');


router.use(auth);

// Ứng tuyển job
router.post('/', author('CANDIDATE'), applicationController.create);
// Employer xem danh sách ứng viên của 1 job
router.get('/job/:jobId',author('EMPLOYER'),applicationController.getByJobForEmployer);

// Employer update trạng thái application
router.put('/:id', author('EMPLOYER'), applicationController.update);

router.delete('/:id', author('EMPLOYER'), applicationController.delete);
router.get('/', applicationController.index);
router.get('/:id', applicationController.show);

module.exports = router;