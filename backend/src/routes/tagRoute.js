const express = require('express');
const router = express.Router();
const tagController = require('../app/controllers/tagController');



<<<<<<< HEAD
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

=======
router.get('/', tagController.index);

>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b


module.exports = router;
