const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/userController');



// Danh sách
router.get('/', userController.index);

// Chi tiết theo id
router.get('/:id', userController.show);

// Thêm mới
router.post('/', userController.create);

// Cập nhật
router.put('/:id', userController.update);

// Xóa
router.delete('/:id', userController.delete);


module.exports = router;
