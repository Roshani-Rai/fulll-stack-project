import express from 'express'
import chatModel from '../models/chatModel.js'
import authUser from '../middlewares/authUser.js'
import authDoctor from '../middlewares/authDoctor.js'

const chatRouter = express.Router()

// get chat history for an appointment
chatRouter.get('/history/:appointmentId', authUser, async (req, res) => {
  try {
    const messages = await chatModel.find({ 
      appointmentId: req.params.appointmentId 
    }).sort({ timestamp: 1 })
    res.json({ success: true, messages })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

// doctor fetch history
chatRouter.get('/doctor-history/:appointmentId', authDoctor, async (req, res) => {
  try {
    const messages = await chatModel.find({ 
      appointmentId: req.params.appointmentId 
    }).sort({ timestamp: 1 })
    res.json({ success: true, messages })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

export default chatRouter