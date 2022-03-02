const app = require("./app");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database")

//handling uncaught exceptions
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught exceptions");
    process.exit(1)

})


//for config

dotenv.config({path: "backend/config/config.env"})

//connect to database
connectDatabase()



const server = app.listen(process.env.PORT, ()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`);
})


//uncaught error below = so to handle this type of error ...we have to make a function for this above
// console.log(youtube);


//Unhandled Promise rejection = invalid connection string
//we have to crash the server intentinally during this type of error =spelling mistake in mongodb config

process.on("unhandleRejection", error=>{
    console.log(`Error: ${err.message} `);
    console.log("Shutting down the server due to unhandled promise Rejection");
     //closing the server

     server.close(()=>{
         process.exit(1);
     })
})

