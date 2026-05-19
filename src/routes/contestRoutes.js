const express = require("express");

const router = express.Router();

const contestController = require("../controllers/contestController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");

router.post("/", authMiddleware, adminMiddleware, contestController.createContest);
router.get("/", optionalAuthMiddleware, contestController.getContests);
router.get("/:id", optionalAuthMiddleware, contestController.getContestById);
router.post("/:id/join", authMiddleware, contestController.joinContest);

module.exports = router;
