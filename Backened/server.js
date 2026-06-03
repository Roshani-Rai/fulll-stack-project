import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/mongodb.js'
import adminRouter from './routes/adminr.js' 
import doctorRouter from './routes/doctorr.js'
import userRouter from './routes/userr.js'


const app=express()
const port=process.env.PORT || 4000
connectDb()

// meddlewares

app.use(express.json())
app.use(cors())
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)


app.get('/',(req,res)=>{
    res.send("API working");
})


app.listen(port,()=>console.log("server started",port))
