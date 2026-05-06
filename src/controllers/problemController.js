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
            testCases
        }   = req.body

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
            tags,
            testCases

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
        const problems = await prisma.problem.findMany({
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
    const problem = await prisma.problem.findUnique({
        where :{
            id: Number(id)
        }
    });

    if(!problem){
        return res.status(401).json({
            message  : "Problem not found"
        })
    }


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

        return res.status(20).json({

         message : " Problem updated sucessfully ",

         updateProblem
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