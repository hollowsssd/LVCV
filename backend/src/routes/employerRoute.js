const express = require('express');
const router = express.Router();
const employerController = require('../app/controllers/employerController');



// Danh sách
router.get('/', employerController.index);

// Chi tiết theo id
router.get('/:id', employerController.show);

// Thêm mới
router.post('/', employerController.create);

// Cập nhật
router.put('/:id', employerController.update);

// Xóa
router.delete('/:id', employerController.delete);


module.exports = router;
