const fs = require("fs")
const path = require("path")
const {exec} = require("child_process")
const { stdout, stdin, stderr } = require("process")
const { error } = require("console")



const executeJavaScript = (code)=>{

    return new Promise((resolve , reject)=>{

        const fileName = `temp_${Date.now()}.js`

    const filePath = path.join(__dirname,"../../temp", fileName);

    fs.writeFileSync(filePath , code);

    exec(`node ${filePath}`, (error ,stdout , stderr)=>{

        fs.unlinkSync(filePath);

        if(error){
            return reject(stderr || error.message)
        }

        resolve(stdout.trim())

    })  

    })

    
}
 
module.exports = {
    executeJavaScript
};