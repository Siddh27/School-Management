import { initializeDatabase } from "./db/index.js"
import dotenv from 'dotenv'
import { app } from "./app.js"

dotenv.config({
    path:'./.env'
})

initializeDatabase()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is listening at PORT ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Database connection failed!!")
})