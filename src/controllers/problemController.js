const prisma = require('../config/db')

const createProblem = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      tags,
      testCases,
      timeLimitMs,
      memoryLimitMb,
      executionMode,
      functionName,
      isPublished
    } = req.body

    if (!title || !slug || !description || !difficulty || !Array.isArray(testCases)) {
      return res.status(400).json({
        message: "title, slug, description, difficulty and testCases are required"
      })
    }

    if (testCases.length === 0) {
      return res.status(400).json({
        message: "testCases must contain at least one entry"
      })
    }

    const invalidCase = testCases.find((tc) => tc.output === undefined || tc.output === null)
    if (invalidCase !== undefined) {
      return res.status(400).json({
        message: "Each testCase must have an output field"
      })
    }

    const existingProblem = await prisma.problem.findUnique({
      where: { slug }
    })

    if (existingProblem) {
      return res.status(400).json({
        message: "Problem already exists"
      })
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        slug,
        description,
        difficulty,
        constraints,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        tags: tags || [],
        testCases,
        timeLimitMs,
        memoryLimitMb,
        executionMode,
        functionName,
        isPublished
      }
    })

    return res.status(201).json({
      message: 'Problem created successfully',
      problem
    })
  } catch (error) {
    console.error("CREATE PROBLEM ERROR", error)

    return res.status(500).json({
      message: error.message
    })
  }
}

const getAllProblems = async (req, res) => {
  try {
    const where = req.user && req.user.role === "ADMIN" ? {} : { isPublished: true }

    const problems = await prisma.problem.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json(problems)
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

const getProblemById = async (req, res) => {
  try {
    const { id } = req.params
    const problem = await prisma.problem.findFirst({
      where: {
        id: Number(id),
        ...(req.user && req.user.role === "ADMIN" ? {} : { isPublished: true })
      }
    })

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found"
      })
    }

    return res.status(200).json(problem)
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

const updateProblem = async (req, res) => {
  try {
    const { id } = req.params

    // Whitelist fields to prevent mass-assignment
    const {
      title,
      slug,
      description,
      difficulty,
      constraints,
      inputFormat,
      outputFormat,
      sampleInput,
      sampleOutput,
      tags,
      testCases,
      timeLimitMs,
      memoryLimitMb,
      executionMode,
      functionName,
      isPublished
    } = req.body

    const data = {}
    if (title !== undefined) data.title = title
    if (slug !== undefined) data.slug = slug
    if (description !== undefined) data.description = description
    if (difficulty !== undefined) data.difficulty = difficulty
    if (constraints !== undefined) data.constraints = constraints
    if (inputFormat !== undefined) data.inputFormat = inputFormat
    if (outputFormat !== undefined) data.outputFormat = outputFormat
    if (sampleInput !== undefined) data.sampleInput = sampleInput
    if (sampleOutput !== undefined) data.sampleOutput = sampleOutput
    if (tags !== undefined) data.tags = tags
    if (testCases !== undefined) data.testCases = testCases
    if (timeLimitMs !== undefined) data.timeLimitMs = timeLimitMs
    if (memoryLimitMb !== undefined) data.memoryLimitMb = memoryLimitMb
    if (executionMode !== undefined) data.executionMode = executionMode
    if (functionName !== undefined) data.functionName = functionName
    if (isPublished !== undefined) data.isPublished = isPublished

    const updatedProblem = await prisma.problem.update({
      where: {
        id: Number(id)
      },
      data
    })

    return res.status(200).json({
      message: "Problem updated successfully",
      problem: updatedProblem
    })
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Problem not found"
      })
    }

    return res.status(500).json({
      message: error.message
    })
  }
}

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params
    const problemId = Number(id)

    await prisma.$transaction([
      prisma.submission.deleteMany({
        where: { problemId }
      }),
      prisma.contestProblem.deleteMany({
        where: { problemId }
      }),
      prisma.problem.delete({
        where: { id: problemId }
      })
    ])

    return res.status(200).json({
      message: 'Problem deleted successfully'
    })
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Problem not found"
      })
    }

    return res.status(500).json({
      message: error.message
    })
  }
}

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
}
