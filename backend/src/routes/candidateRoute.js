const express = require("express");
const router = express.Router();
const candidateController = require("../app/controllers/candidateController");
const auth = require("../app/middlewares/auth");
const authorization = require("../app/middlewares/authorization");


router.get("/", auth, authorization("CANDIDATE"), candidateController.index);
router.get("/:id", auth, authorization("CANDIDATE"), candidateController.show);
router.post("/", auth, authorization("CANDIDATE"), candidateController.create);
router.put("/:id", auth, authorization("CANDIDATE"), candidateController.update);
router.delete("/:id", auth, authorization("CANDIDATE"), candidateController.delete);

module.exports = router;