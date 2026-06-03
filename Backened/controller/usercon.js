import validator from 'validator'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from '../models/usersch.js'
import cloudinary from '../config/cloudinary.js'
import doctorModel from '../models/doctorsch.js'
import appointmentModel from '../models/appointmentsch.js'
import Razorpay from 'razorpay'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import admin from 'firebase-admin'

// ✅ Initialize Firebase Admin once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  })
}

// ✅ Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
})

// ✅ Razorpay instance (only created when keys exist)
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" })
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" })
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = new userModel({ name, email, password: hashedPassword })
    const user = await newUser.save()
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.json({ success: true, token })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'User does not exist' })
    }
    const match = await bcrypt.compare(password, user.password)
    if (match) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getProfile = async (req, res) => {
  try {
    const { userId } = req.user
    const userData = await userModel.findById(userId).select('-password')
    res.json({ success: true, userData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user
    const { name, phone, gender, dob } = req.body
    const imageFile = req.file

    let address = req.body.address
    if (address.startsWith('"')) address = address.slice(1, -1)
    address = JSON.parse(address)

    if (!name || !phone || !address || !gender || !dob) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    await userModel.findByIdAndUpdate(userId, { name, phone, address, gender, dob })

    if (imageFile) {
      const b64 = Buffer.from(imageFile.buffer).toString('base64')
      const dataURI = `data:${imageFile.mimetype};base64,${b64}`
      const formData = new FormData()
      formData.append('file', dataURI)
      formData.append('upload_preset', 'doctor_app')
      const response = await fetch('https://api.cloudinary.com/v1_1/du54hrrha/image/upload', {
        method: 'POST',
        body: formData
      })
      const imageUpload = await response.json()
      if (!imageUpload.secure_url) {
        return res.json({ success: false, message: 'Image upload failed' })
      }
      await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url })
    }

    res.json({ success: true, message: 'Profile Updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body
    const { userId } = req.user
    const docData = await doctorModel.findById(docId).select('-password')

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" })
    }

    let slots_booked = docData.slots_booked
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" })
      } else {
        slots_booked[slotDate].push(slotTime)
      }
    } else {
      slots_booked[slotDate] = []
      slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select('-password')
    const docDataPlain = docData.toObject()
    delete docDataPlain.slots_booked

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docDataPlain,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now()
    }

    const newAppointment = new appointmentModel(appointmentData)
    await newAppointment.save()
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })
    res.json({ success: true, message: 'Appointment Booked' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const listAppointment = async (req, res) => {
  try {
    const { userId } = req.user
    const appointments = await appointmentModel.find({ userId })
    res.json({ success: true, appointments })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const cancelAppointment = async (req, res) => {
  try {
    const { userId } = req.user
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (appointment.userId !== userId.toString()) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    const { docId, slotDate, slotTime } = appointment
    const docData = await doctorModel.findById(docId)
    let slots_booked = docData.slots_booked
    slots_booked[slotDate] = slots_booked[slotDate].filter(s => s !== slotTime)
    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Cancelled' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment || appointment.cancelled) {
      return res.json({ success: false, message: 'Appointment not found or cancelled' })
    }

    // ✅ create razorpay order
    const options = {
      amount: appointment.amount * 100,  // paise
      currency: 'INR',
      receipt: appointmentId,
    }

    const order = await getRazorpayInstance().orders.create(options)  // ✅ use function
    res.json({ success: true, order })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'Email not found' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000

    await userModel.findByIdAndUpdate(user._id, { resetToken, resetTokenExpiry })

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below. It expires in 15 minutes.</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    })

    res.json({ success: true, message: 'Reset link sent to your email' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body

    const user = await userModel.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return res.json({ success: false, message: 'Invalid or expired reset link' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    })

    res.json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body
    const decoded = await admin.auth().verifyIdToken(idToken)
    const { email, name, picture } = decoded

    let user = await userModel.findOne({ email })
    if (!user) {
      user = await userModel.create({
        name,
        email,
        image: picture,
        
      })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.json({ success: true, token })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  forgotPassword,
  resetPassword,
  googleLogin,
}