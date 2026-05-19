const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimitMiddleware");

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
