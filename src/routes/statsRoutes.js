const express = require("express");

const router = express.Router();

const statsController = require("../controllers/statsController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/me", authMiddleware, statsController.getMyStats);

module.exports = router;
