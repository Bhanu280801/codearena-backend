const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middlewares/authMiddleware");
const { submissionLimiter } = require("../middlewares/rateLimitMiddleware");

router.post(
  "/",
  authMiddleware,
  submissionLimiter,
  submissionController.createSubmission
);

router.get(
  "/me",
  authMiddleware,
  submissionController.getMySubmissions
);

router.get(
  "/problem/:problemId",
  authMiddleware,
  submissionController.getMySubmissionsByProblem
);

router.get(
  "/:id",
  authMiddleware,
  submissionController.getSubmissionById
);

module.exports = router;
