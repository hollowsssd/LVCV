const express = require("express");
const router = express.Router();
const jobController = require("../app/controllers/jobController");

const auth = require("../app/middlewares/auth");
const requireEmployer = require("../app/middlewares/requireEmployer");

// Danh sách
router.get("/", jobController.index);
//search
router.get("/search", jobController.search);
// Chi tiết theo id
router.get("/:id", jobController.show);


// employer-only
// Thêm mới
router.post("/", auth, requireEmployer, jobController.create);

// Cập nhật
router.put("/:id", auth, requireEmployer, jobController.update);

// Xóa
router.delete("/:id", auth, requireEmployer, jobController.delete);




module.exports = router;
