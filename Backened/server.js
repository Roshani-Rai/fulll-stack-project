import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/mongodb.js'
import adminRouter from './routes/adminr.js'
import doctorRouter from './routes/doctorr.js'
import userRouter from './routes/userr.js'
import aiChatRouter from './routes/aiChat.js';

const app = express()
const port = process.env.PORT || 4000
connectDb()

// ── 1. CORS first — before everything else ──
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ── 2. Handle preflight OPTIONS requests ──


// ── 3. Body parsers after CORS ──
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── 4. Routes ──
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/ai-chat', aiChatRouter);

app.get('/', (req, res) => {
  res.send("API working");
})

app.listen(port, () => console.log("Server started on port", port))
