const express = require('express');
const router = express.Router();
const tagController = require('../app/controllers/tagController');



// Danh sách
router.get('/', tagController.index);

// Chi tiết theo id
router.get('/:id', tagController.show);

// Thêm mới
router.post('/', tagController.create);

// Cập nhật
router.put('/:id', tagController.update);

// Xóa
router.delete('/:id', tagController.delete);



module.exports = router;
