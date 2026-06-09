// controllers/doctorController.js
import doctorModel from "../models/doctorsch.js"
import appointmentModel from '../models/appointmentsch.js'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from '../models/usersch.js'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getIO = (req) => req.app.get('io')  // socket.io instance set in server.js

// ─── ADMIN: Change availability ───────────────────────────────────────────────
export const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body
    const docData = await doctorModel.findById(docId)
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
    res.json({ success: true, message: 'Availability Changed' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── ADMIN: Edit doctor ───────────────────────────────────────────────────────
export const editDoctor = async (req, res) => {
  try {
    const { docId, name, fees, speciality, degree, experience, about, address } = req.body
    const imageFile = req.file

    let updateData = { name, fees, speciality, degree, experience, about, address: JSON.parse(address) }

    if (imageFile) {
      const b64 = Buffer.from(imageFile.buffer).toString('base64')
      const dataURI = `data:${imageFile.mimetype};base64,${b64}`
      const formData = new FormData()
      formData.append('file', dataURI)
      formData.append('upload_preset', 'doctor_app')
      const response = await fetch('https://api.cloudinary.com/v1_1/du54hrrha/image/upload', { method: 'POST', body: formData })
      const imageUpload = await response.json()
      if (imageUpload.secure_url) updateData.image = imageUpload.secure_url
    }

    const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, updateData, { new: true })
    res.json({ success: true, message: 'Doctor Updated', doctor: updatedDoctor })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── ADMIN: Delete doctor ─────────────────────────────────────────────────────
export const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body
    await doctorModel.findByIdAndDelete(docId)
    await appointmentModel.deleteMany({ docId })
    res.json({ success: true, message: 'Doctor Deleted Successfully!!' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── PUBLIC: Doctor list ──────────────────────────────────────────────────────
export const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(['-password', '-email'])
    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

// ─── PUBLIC: Login ────────────────────────────────────────────────────────────
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    const doctor = await doctorModel.findOne({ email })
    if (!doctor) return res.json({ success: false, message: "Invalid Credentials" })
    const isMatch = await bcrypt.compare(password, doctor.password)
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Invalid Credentials" })
    }
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR: Get appointments ─────────────────────────────────────────────────
export const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body
    const appointments = await appointmentModel.find({ docId })
    res.json({ success: true, appointments })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR: Cancel appointment ───────────────────────────────────────────────
export const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {
      const updateData = { cancelled: true, cancelledBy: 'doctor' }
      if (appointmentData.payment) updateData.refundStatus = 'processed'
      await appointmentModel.findByIdAndUpdate(appointmentId, updateData)

      // Free the slot
      const { slotDate, slotTime } = appointmentData
      const docData = await doctorModel.findById(docId)
      if (docData) {
        let slots_booked = docData.slots_booked
        if (slots_booked[slotDate]) {
          slots_booked[slotDate] = slots_booked[slotDate].filter(s => s !== slotTime)
          await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }
      }

      // 🔔 Notify patient
      getIO(req).emitToUser(appointmentData.userId, 'notification', {
        type: 'appointment_cancelled',
        title: '❌ Appointment Cancelled',
        icon: '❌',
        message: `Dr. ${appointmentData.docData?.name} cancelled your appointment on ${slotDate} at ${slotTime} and refund will be initiated soon.`,
        data: { appointmentId }
      })

      return res.json({ success: true, message: 'Appointment cancelled successfully!!' })
    } else {
      res.json({ success: false, message: 'Cancellation Failed' })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR: Complete appointment ─────────────────────────────────────────────
export const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })

      // Free the slot
      const { slotDate, slotTime } = appointmentData
      const docData = await doctorModel.findById(docId)
      if (docData) {
        let slots_booked = docData.slots_booked
        if (slots_booked[slotDate]) {
          slots_booked[slotDate] = slots_booked[slotDate].filter(s => s !== slotTime)
          await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }
      }

      // 🔔 Notify patient
      getIO(req).emitToUser(appointmentData.userId, 'notification', {
        type: 'appointment_confirmed',
        title: '✅ Appointment Completed',
        icon: '✅',
        message: `Your appointment with Dr. ${appointmentData.docData?.name} on ${slotDate} has been marked as completed.`,
        data: { appointmentId }
      })

      return res.json({ success: true, message: 'Appointment completed successfully!!' })
    } else {
      res.json({ success: false, message: 'Mark Failed' })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR: Dashboard ────────────────────────────────────────────────────────
export const doctorDash = async (req, res) => {
  try {
    const { docId } = req.body
    const appointments = await appointmentModel.find({ docId })

    let earnings = 0
    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.refundStatus === 'processed' ? -item.amount : item.amount
      }
    })

    const patients = [...new Set(appointments.map(a => a.userId))]

    res.json({
      success: true,
      dashData: {
        earnings,
        appointments: appointments.length,
        patients: patients.length,
        latestAppointments: appointments.reverse().slice(0, 5)
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR: Get profile ──────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const { docId } = req.body
    const profileData = await doctorModel.findById(docId).select('-password')
    res.json({ success: true, profileData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── USER: Rate doctor ────────────────────────────────────────────────────────
export const rateDoctor = async (req, res) => {
  try {
    const { docId, rating, review } = req.body
    const userId = req.body.userId  // set by authUser middleware

    if (!rating || rating < 1 || rating > 5)
      return res.json({ success: false, message: 'Rating must be between 1 and 5' })

    const doctor = await doctorModel.findById(docId)
    if (!doctor) return res.json({ success: false, message: 'Doctor not found' })

    const alreadyRated = doctor.reviews.find(r => r.userId.toString() === userId)
    if (alreadyRated) return res.json({ success: false, message: 'You already rated this doctor' })

    const user = await userModel.findById(userId).select('name')
    doctor.reviews.push({ userId, userName: user?.name || 'Anonymous', rating: Number(rating), review: review || '' })

    const total = doctor.reviews.reduce((sum, r) => sum + r.rating, 0)
    doctor.rating = parseFloat((total / doctor.reviews.length).toFixed(1))
    doctor.totalRatings = doctor.reviews.length
    await doctor.save()

    // 🔔 Notify doctor about new review
    getIO(req).emitToDoctor(docId, 'notification', {
      type: 'new_review',
      title: '⭐ New Rating Received',
      icon: '⭐',
      message: `${user?.name || 'A patient'} gave you a ${rating}-star rating.`,
      data: { docId, rating, review }
    })

    res.json({ success: true, message: 'Rating submitted!', newRating: doctor.rating, totalRatings: doctor.totalRatings })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR: Add prescription ─────────────────────────────────────────────────
export const addPdf = async (req, res) => {
  try {
    const { appointmentId, medications, notes } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (appointment.cancelled) return res.json({ success: false, message: 'Appointment is cancelled' })

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      prescription: { medications, notes },
      prescriptionSent: true,
    })

    // 🔔 Notify patient
    const docData = await doctorModel.findById(req.body.docId).select('name')
    getIO(req).emitToUser(appointment.userId, 'notification', {
      type: 'prescription_added',
      title: '💊 New Prescription',
      icon: '💊',
      message: `Dr. ${docData?.name} has added a new prescription for your appointment.`,
      data: { appointmentId }
    })

    res.json({ success: true, message: 'Prescription sent to patient' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR: Accept refund ────────────────────────────────────────────────────
export const acceptRefund = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (appointment.refundStatus !== 'requested') return res.json({ success: false, message: 'No refund request found' })

    await appointmentModel.findByIdAndUpdate(appointmentId, { refundStatus: 'processed' })

    // 🔔 Notify patient
    getIO(req).emitToUser(appointment.userId, 'notification', {
      type: 'refund_processed',
      title: '💰 Refund Processed',
      icon: '💰',
      message: `Your refund of ₹${appointment.amount} has been approved and will be credited shortly.`,
      data: { appointmentId, amount: appointment.amount }
    })

    res.json({ success: true, message: 'Refund approved and processed' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// ─── DOCTOR/PATIENT: Get prescription ────────────────────────────────────────
export const getPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (!appointment.prescriptionSent) return res.json({ success: false, message: 'No prescription sent for this appointment' })

    res.json({
      success: true,
      prescription: appointment.prescription,
      patientName: appointment.userData.name,
      slotDate: appointment.slotDate,
      slotTime: appointment.slotTime,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── USER: Book appointment ───────────────────────────────────────────────────
export const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body

    const docData = await doctorModel.findById(docId).select('-password')
    if (!docData.available) return res.json({ success: false, message: 'Doctor not available' })

    let slots_booked = docData.slots_booked
    if (slots_booked[slotDate]?.includes(slotTime))
      return res.json({ success: false, message: 'Slot not available' })

    if (!slots_booked[slotDate]) slots_booked[slotDate] = []
    slots_booked[slotDate].push(slotTime)

    const userData = await userModel.findById(userId).select('-password')
    const appointmentData = {
      userId, docId,
      userData: userData.toObject(),
      docData: docData.toObject(),
      amount: docData.fees,
      slotDate, slotTime,
      date: Date.now()
    }

    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    const io = getIO(req)

    // 🔔 Notify patient
    io.emitToUser(userId, 'notification', {
      type: 'appointment_confirmed',
      title: '📅 Appointment Confirmed',
      icon: '📅',
      message: `Your appointment with Dr. ${docData.name} is confirmed for ${slotDate} at ${slotTime}.`,
      data: { appointmentId: newAppointment._id }
    })

    // 🔔 Notify doctor  ← was emitToUser(docId) before, now correctly emitToDoctor
    io.emitToDoctor(docId, 'notification', {
      type: 'appointment_booked',
      title: '🔔 New Appointment',
      icon: '🔔',
      message: `${userData.name} booked an appointment for ${slotDate} at ${slotTime}.`,
      data: { appointmentId: newAppointment._id }
    })

    res.json({ success: true, message: 'Appointment Booked' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── USER: Cancel appointment ─────────────────────────────────────────────────
export const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData.userId !== userId)
      return res.json({ success: false, message: 'Unauthorized action' })

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    const { docId, slotDate, slotTime } = appointmentData
    const docData = await doctorModel.findById(docId)
    let slots_booked = docData.slots_booked
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(s => s !== slotTime)
      await doctorModel.findByIdAndUpdate(docId, { slots_booked })
    }

    // 🔔 Notify doctor  ← was emitToUser(docId) before, now correctly emitToDoctor
    getIO(req).emitToDoctor(docId, 'notification', {
      type: 'appointment_cancelled',
      title: '❌ Appointment Cancelled',
      icon: '❌',
      message: `${appointmentData.userData?.name} cancelled their appointment on ${slotDate} at ${slotTime}.`,
      data: { appointmentId }
    })

    res.json({ success: true, message: 'Appointment Cancelled' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── USER: Request refund ─────────────────────────────────────────────────────
export const requestRefund = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (appointment.userId !== userId) return res.json({ success: false, message: 'Unauthorized' })
    if (!appointment.payment) return res.json({ success: false, message: 'No payment found' })
    if (appointment.refundStatus === 'requested' || appointment.refundStatus === 'processed')
      return res.json({ success: false, message: 'Refund already requested or processed' })

    await appointmentModel.findByIdAndUpdate(appointmentId, { refundStatus: 'requested' })

    // 🔔 Notify doctor  ← was emitToUser(docId) before, now correctly emitToDoctor
    getIO(req).emitToDoctor(appointment.docId, 'notification', {
      type: 'refund_requested',
      title: '💸 Refund Requested',
      icon: '💸',
      message: `${appointment.userData?.name} has requested a refund of ₹${appointment.amount}.`,
      data: { appointmentId, amount: appointment.amount }
    })

    res.json({ success: true, message: 'Refund requested successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ─── USER: Confirm payment ────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })

    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })

    const io = getIO(req)

    // 🔔 Notify patient
    io.emitToUser(appointment.userId, 'notification', {
      type: 'payment_received',
      title: '✅ Payment Confirmed',
      icon: '💳',
      message: `Payment of ₹${appointment.amount} for your appointment with Dr. ${appointment.docData?.name} is confirmed.`,
      data: { appointmentId, amount: appointment.amount }
    })

    // 🔔 Notify doctor  ← was emitToUser(docId) before, now correctly emitToDoctor
    io.emitToDoctor(appointment.docId, 'notification', {
      type: 'payment_received',
      title: '💳 Payment Received',
      icon: '💳',
      message: `${appointment.userData?.name} paid ₹${appointment.amount} for their appointment.`,
      data: { appointmentId, amount: appointment.amount }
    })

    res.json({ success: true, message: 'Payment confirmed' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}