const express = require("express");
const router = express.Router();

const auth = require("../app/middlewares/auth");
const userController = require("../app/controllers/userController");
const authorization = require("../app/middlewares/authorization");
const ratelimit = require("../app/middlewares/rateLimit");


router.get("/", auth, authorization("ADMIN"), userController.index);

router.get("/profile", auth, userController.profile);

router.get("/:id", userController.show);

router.post("/", auth, authorization("ADMIN"), ratelimit, userController.create);

router.put("/:id", userController.update);

router.delete("/:id", auth, authorization("ADMIN"), userController.delete);

module.exports = router;