const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/userController');



<<<<<<< HEAD
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

=======
router.get('/', userController.index);

>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b


module.exports = router;
