import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  senderId:       { type: String, required: true },
  senderRole:     { type: String, enum: ['patient', 'doctor'], required: true },
  senderName:     { type: String, required: true },
  message:        { type: String, required: true },
  timestamp:      { type: Date, default: Date.now }
})

const chatModel = mongoose.models.chat || mongoose.model('chat', messageSchema)
export default chatModel