const express = require('express');
const router = express.Router();
const applicationController = require('../app/controllers/applicationController');



<<<<<<< HEAD
// Danh sách
router.get('/', applicationController.index);

// Chi tiết theo id
router.get('/:id', applicationController.show);

// Thêm mới
router.post('/', applicationController.create);

// Cập nhật
router.put('/:id', applicationController.update);

// Xóa
router.delete('/:id', applicationController.delete);

=======
router.get('/', applicationController.index);

>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b


module.exports = router;
