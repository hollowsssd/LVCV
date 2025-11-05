const express = require('express');
const router = express.Router();
const employerController = require('../app/controllers/employerController');



<<<<<<< HEAD
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

=======
router.get('/', employerController.index);

>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b


module.exports = router;
