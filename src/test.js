

const {executeJavaScript} = require("./utils/codeExecuter");

( async() => {

    try {
        const result = await executeJavaScript(`console.log(2+2)`)

        console.log("Output " , result)

    } catch (error) {
        
        console.log("Execution error " , error)
        

    }
})()