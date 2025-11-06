const express = require('express');
const router = express.Router();
const jobController = require('../app/controllers/jobController');



// Danh sách
router.get('/', jobController.index);

// Chi tiết theo id
router.get('/:id', jobController.show);

// Thêm mới
router.post('/', jobController.create);

// Cập nhật
router.put('/:id', jobController.update);

// Xóa
router.delete('/:id', jobController.delete);



module.exports = router;
