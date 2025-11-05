const express = require('express');
const router = express.Router();
const candidateController = require('../app/controllers/candidateController');



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



module.exports = router;
