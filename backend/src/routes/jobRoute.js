const express = require("express");
const router = express.Router();
const jobController = require("../app/controllers/jobController");
const authorization = require("../app/middlewares/authorization")
const auth = require("../app/middlewares/auth");
const requireEmployer = require("../app/middlewares/requireEmployer");

// Danh sách
router.get("/", jobController.index);
//search
router.get("/search", jobController.search);
//show job dựa trên employer
router.get("/showJobEmployer", auth, authorization("EMPLOYER"), requireEmployer, jobController.showJobEmployer);
// Chi tiết theo id
router.get("/:id", jobController.show);


// Thêm mới
router.post("/", auth, authorization("EMPLOYER"), requireEmployer, jobController.create);

// Cập nhật
router.put("/:id", auth, authorization("EMPLOYER"), requireEmployer, jobController.update);

// Xóa
router.delete("/:id", auth, authorization("EMPLOYER"), requireEmployer, jobController.delete);




module.exports = router;
