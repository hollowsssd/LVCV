const express = require("express");
const router = express.Router();
const candidateController = require("../app/controllers/candidateController");
const auth = require("../app/middlewares/auth");
const authorization = require("../app/middlewares/authorization");
const requireRole = require("../app/middlewares/requireRole");
const { uploadAvatar, handleImageUpload } = require("../app/config/upload");

router.get("/me", auth, requireRole, authorization("CANDIDATE"), candidateController.me);


router.get("/", auth, requireRole, authorization("CANDIDATE"), candidateController.index);


router.get("/:id", auth, requireRole, authorization("CANDIDATE"), candidateController.show);

router.post("/", auth, requireRole, authorization("CANDIDATE"), candidateController.create);

router.put("/:id", auth, requireRole, authorization("CANDIDATE"), candidateController.update);

router.put("/:id/avatar", auth, requireRole, authorization("CANDIDATE"), handleImageUpload(uploadAvatar, "avatar"), candidateController.uploadAvatar);

router.delete("/:id", auth, requireRole, authorization("CANDIDATE"), candidateController.delete);

module.exports = router;