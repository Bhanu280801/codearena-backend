const express = require('express');

const router = express.Router()

const {createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
}                         = require('../controllers/problemController')

router.post("/", createProblem);

router.get("/", getAllProblems);

router.get("/:id",getProblemById);

router.put("/:id",updateProblem);

router.delete("/:id", deleteProblem)

module.exports = router