const express = require("express");
const router = express.Router();
const jobController = require("../app/controllers/jobController");
const authorization = require("../app/middlewares/authorization")
const auth = require("../app/middlewares/auth");
const requireEmployer = require("../app/middlewares/requireEmployer");
const rateLimit = require("../app/middlewares/rateLimit")


router.get("/", jobController.index);

router.get("/search", jobController.search);

//show job dựa trên employer
router.get("/showJobEmployer", auth, authorization("EMPLOYER"), requireEmployer, jobController.showJobEmployer);

router.get("/:id", jobController.show);


router.post("/", auth, authorization("EMPLOYER"), requireEmployer, jobController.create);

router.put("/:id", auth, authorization("EMPLOYER"), requireEmployer, jobController.update);

router.delete("/:id", auth, authorization("EMPLOYER"), requireEmployer, jobController.delete);




module.exports = router;
