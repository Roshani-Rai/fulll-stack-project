import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({

  userId:      { type: String, required: true },
  docId:       { type: String, required: true },
  slotDate:    { type: String, required: true },
  slotTime:    { type: String, required: true },
  userData:    { type: Object, required: true },
  docData:     { type: Object, required: true },
  amount:      { type: Number, required: true },
  date:        { type: Number, required: true },
  cancelled:   { type: Boolean, default: false },
  payment:     { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },

  cancelledBy: {
    type: String,
    enum: ['user', 'doctor', 'admin', null],
    default: null,
  },


  prescriptionSent: { type: Boolean, default: false },

  prescription: {
    medications: [
      {
        name:     { type: String, default: '' },
        dosage:   { type: String, default: '' },
        duration: { type: String, default: '' },
      }
    ],
    notes: { type: String, default: '' },
  },

  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'processed'],
    default: 'none',
  },

})

const appointmentModel = mongoose.model('appointment', appointmentSchema)

export default appointmentModel