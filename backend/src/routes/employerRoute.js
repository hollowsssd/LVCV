const express = require("express");
const router = express.Router();
const employerController = require("../app/controllers/employerController");
const auth = require("../app/middlewares/auth");
const authorization = require("../app/middlewares/authorization");
const requireRole = require("../app/middlewares/requireRole");
const { uploadLogo, handleImageUpload } = require("../app/config/upload");

router.get("/me", auth, requireRole, authorization("EMPLOYER"), employerController.me);

router.get("/", auth, requireRole, authorization("EMPLOYER"), employerController.index);

router.get("/:id", auth, requireRole, authorization("EMPLOYER"), employerController.show);

router.post("/", auth, requireRole, authorization("EMPLOYER"), employerController.create);

router.put("/:id", auth, requireRole, authorization("EMPLOYER"), employerController.update);

router.put("/:id/logo", auth, requireRole, authorization("EMPLOYER"), handleImageUpload(uploadLogo, "logo"), employerController.uploadLogo);

router.delete("/:id", auth, requireRole, authorization("EMPLOYER"), employerController.delete);

module.exports = router;