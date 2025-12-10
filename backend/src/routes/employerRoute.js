const express = require("express");
const router = express.Router();
const employerController = require("../app/controllers/employerController");
const auth = require("../app/middlewares/auth");
const authorization = require("../app/middlewares/authorization");

router.get("/", auth, authorization("EMPLOYER"), employerController.index);

router.get("/:id", auth, authorization("EMPLOYER"), employerController.show);

router.post("/", auth, authorization("EMPLOYER"), employerController.create);

router.put("/:id", auth, authorization("EMPLOYER"), employerController.update);

router.delete("/:id", auth, authorization("EMPLOYER"), employerController.delete);

module.exports = router;