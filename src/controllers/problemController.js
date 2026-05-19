const prisma = require('../config/db')

const createProblem =  async(req , res)=>{

    try{

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
        }   = req.body

        if (!title || !slug || !description || !difficulty || !Array.isArray(testCases)) {
            return res.status(400).json({
                message: "title, slug, description, difficulty and testCases are required"
            })
        }

        const existingProblem = await prisma.problem.findUnique({
            where : {slug}
        })

        if(existingProblem){
            return res.status(400).json({
                message : "Problem already exists"
            });
        }

        const problem = await prisma.problem.create({
            data :{
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
            message :'Problem created successfully',

            problem
        })

    }catch (error){
        console.error( "CREATE PROBLEM ERROR " , error)

        return res.status(500).json({
            message : error.message
        })
    }
}

const getAllProblems = async(req , res)=>{

    try {
        const where = req.user && req.user.role === "ADMIN" ? {} : { isPublished: true };

        const problems = await prisma.problem.findMany({
            where,
            orderBy:{
                createdAt :'desc'
            }
        });

        return res.status(200).json(problems)
        
    } catch (error) {
        
        return res.status(500).json({
            message : error.message
        })
    }
}

const getProblemById = async(req , res)=>{

  try{

    const {id}  = req.params;
    const problem = await prisma.problem.findFirst({
        where :{
            id: Number(id),
            ...(req.user && req.user.role === "ADMIN" ? {} : { isPublished: true })
        }
    });

    if(!problem){
        return res.status(404).json({
            message  : "Problem not found"
        })
    }

    return res.status(200).json(problem)


  }catch(error){

     return res.status(500).json({
      message: error.message
    });

  }
}

const updateProblem = async(req, res)=>{

    try{

        const {id}  = req.params;

        const updatedProblem = await prisma.problem.update({

            where :{
                id : Number(id)
            },
            data : req.body
        })

        return res.status(200).json({

         message : " Problem updated sucessfully ",

         problem: updatedProblem
        })

    }catch(error){
        
        return res.status(500).json({
            message : error.message
        })
    }
}

const deleteProblem = async(req, res)=>{

    try {

        const {id}  = req.params;

        await prisma.problem.delete({
            where :{
                id : Number(id)
            }
        })

        return res.status(200).json({
            message :'Problem deleted successfully'
        })


    } catch (error) {
        
        return res.status(500).json({
            message : error.message
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
