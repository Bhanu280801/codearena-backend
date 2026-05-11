const prisma = require("../config/db")

const submissionQueue = require("../jobs/submissionQueue")

const createSubmission = async(req , res)=>{
    try {
        
        const {
            problemId,
            sourceCode,
            language,

        }   = req.body;

        const userId = req.user.id

        const problem = await prisma.problem.findUnique({
            where : {
                id : Number(problemId)
            }
        })

        if(!problem){
            return res.status(404).json({
                message : "Problem not found"
            })
        }

        
       
        const submission = await prisma.submission.create({
            data :{
                sourceCode,
                language,
                userId,
                problemId : Number(problemId),
                status : "pending"
            }
        })

         await submissionQueue.add("processSubmission",{

            submissionId : submission.id
        })
        console.log("Job added to queue");

        return res.status(201).json({
            message : "Submission created sucessfully"
        })
    } catch (error) {

        console.error("Submission error " , error)
        
        return res.status(500).json({
            message : error.message
        })
        
    }
}

const getMySubmissions = async(req , res)=>{
    try {
        
        const userId = req.user.id;

        const submissions = await prisma.submission.findMany({
            where :{
                userId
            }, 
            include:{
                problem : true
            },
            orderBy:{
                createdAt :'desc'
            }
        })

       

        return res.status(200).json(submissions)

    } catch (error) {
        
        return res.status(500).json({

            message : error.message
        })
        
    }
}

const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        problem: true,
        user: true
      }
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found"
      });
    }

    return res.status(200).json(submission);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
    createSubmission,
    getMySubmissions,
    getSubmissionById
}