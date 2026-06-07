
import express from 'express'
import cors from 'cors'
import 'dotenv/config'        
import connectDb from './config/mongodb.js'
import adminRouter from './routes/adminr.js'
import doctorRouter from './routes/doctorr.js'
import userRouter from './routes/userr.js'
import aiChatRouter from './routes/aiChat.js'
import prescriptionRoutes from './routes/prescribtion.js'

const app = express()
const port = process.env.PORT || 4000         
connectDb()


app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174","https://doctor-appointment-frontened-3mxv.onrender.com","https://doctor-appointment-admin-hyvf.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}))


app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/ai-chat', aiChatRouter)
app.use('/api/prescription', prescriptionRoutes)

app.get('/', (req, res) => {
  res.send("API working")
})

app.listen(port, () => console.log("Server started on port", port)) 

 