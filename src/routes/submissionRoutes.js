const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/",
  authMiddleware,
  submissionController.createSubmission
);

router.get(
  "/me",
  authMiddleware,
  submissionController.getMySubmissions
);

router.get(
  "/:id",
  authMiddleware,
  submissionController.getSubmissionById
);

module.exports = router;