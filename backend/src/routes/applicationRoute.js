const express = require('express');
const router = express.Router();
const applicationController = require('../app/controllers/applicationController');



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



module.exports = router;
