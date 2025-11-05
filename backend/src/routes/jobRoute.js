const express = require('express');
const router = express.Router();
const jobController = require('../app/controllers/jobController');



<<<<<<< HEAD
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

=======
router.get('/', jobController.index);

>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b


module.exports = router;
