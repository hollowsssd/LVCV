const express = require("express");
const router = express.Router();
const employerController = require("../app/controllers/employerController");
const auth = require("../app/middlewares/auth");
const authorization = require("../app/middlewares/authorization");
const requireRole = require("../app/middlewares/requireRole");

router.get("/", auth, requireRole, authorization("EMPLOYER"), employerController.index);

router.get("/:id", auth, requireRole, authorization("EMPLOYER"), employerController.show);

router.post("/", auth, requireRole, authorization("EMPLOYER"), employerController.create);

router.put("/:id", auth, requireRole, authorization("EMPLOYER"), employerController.update);

router.delete("/:id", auth, requireRole, authorization("EMPLOYER"), employerController.delete);

module.exports = router;