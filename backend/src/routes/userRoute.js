const express = require("express");
const router = express.Router();

const auth = require("../app/middlewares/auth");
const userController = require("../app/controllers/userController");
const authorization = require("../app/middlewares/authorization");
const ratelimit = require("../app/middlewares/rateLimit");

router.get("/", auth, ratelimit, authorization("ADMIN"), userController.index);

// Chi tiết theo id
router.get("/:id", userController.show);

// Thêm mới
router.post("/", userController.create);

// Cập nhật
router.put("/:id", userController.update);

// Xóa
router.delete("/:id", userController.delete);

module.exports = router;