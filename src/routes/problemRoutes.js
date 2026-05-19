const express = require('express');

const router = express.Router()

const {createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
}                         = require('../controllers/problemController')
const authMiddleware = require("../middlewares/authMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware")

router.post("/", authMiddleware, adminMiddleware, createProblem);

router.get("/", optionalAuthMiddleware, getAllProblems);

router.get("/:id", optionalAuthMiddleware, getProblemById);

router.put("/:id", authMiddleware, adminMiddleware, updateProblem);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProblem)

module.exports = router
