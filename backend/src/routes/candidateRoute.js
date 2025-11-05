const express = require('express');
const router = express.Router();
const candidateController = require('../app/controllers/candidateController');



<<<<<<< HEAD
// Danh sách
router.get('/', candidateController.index);

// Chi tiết theo id
router.get('/:id', candidateController.show);

// Thêm mới
router.post('/', candidateController.create);

// Cập nhật
router.put('/:id', candidateController.update);

// Xóa
router.delete('/:id', candidateController.delete);

=======
router.get('/', candidateController.index);

>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b


module.exports = router;
