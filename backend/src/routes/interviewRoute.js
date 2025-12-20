const express = require('express');
const router = express.Router();
const interviewController = require('../app/controllers/interviewController');
const auth = require('../app/middlewares/auth');
const author = require('../app/middlewares/authorization');

// Tất cả route đều yêu cầu đăng nhập
router.use(auth);

// Candidate lấy danh sách interview của mình
router.get('/my-scheduled', author('CANDIDATE'), interviewController.getMyScheduled);

// Employer lấy danh sách interview đã tạo
router.get('/employer-list', author('EMPLOYER'), interviewController.getEmployerList);

// Employer tạo lịch phỏng vấn
router.post('/', author('EMPLOYER'), interviewController.create);

// Lấy thông tin interview của 1 application (cả employer và candidate)
router.get('/application/:applicationId', interviewController.getByApplication);

// Employer cập nhật interview (đổi lịch, huỷ, etc.)
router.put('/:id', author('EMPLOYER'), interviewController.update);

module.exports = router;
