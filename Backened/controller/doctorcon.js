import doctorModel from "../models/doctorsch.js";
import appointmentModel from '../models/appointmentsch.js'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from '../models/usersch.js' 

const changeAvailability = async(req,res)=>{
    try {
        
     const {docId}= req.body;
     const docData = await doctorModel.findById(docId)
     await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
     res.json({success:true,message:'Availablity Changed'})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

const editDoctor = async (req, res) => {
  try {
    const { docId, name, fees, speciality, degree, experience, about, address } = req.body
    const imageFile = req.file

    let updateData = {
      name, fees, speciality, degree, experience, about,
      address: JSON.parse(address)
    }

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
      if (imageUpload.secure_url) {
        updateData.image = imageUpload.secure_url
      }
    }

    // ✅ { new: true } returns the updated document
    const updatedDoctor = await doctorModel.findByIdAndUpdate(docId, updateData, { new: true })

    res.json({ success: true, message: 'Doctor Updated', doctor: updatedDoctor })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}
const deleteDoctor = async (req, res) => {
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


const doctorList = async(req,res)=>{
   try {
     const doctors = await doctorModel.find({}).select(['-password','-email'])
     res.json({success:true,doctors})
   } catch (error) {
     console.log(error.message)
     res.json({success:false,message:error.message})
   }
}

const loginDoctor = async(req,res)=>{
  try {
    const {email,password}=req.body
    const doctor = await doctorModel.findOne({email})
    if(!doctor){
      res.json({success:false,message:"Invalid Credentials"})
    }
    const isMatch = await bcrypt.compare(password,doctor.password)
    if(isMatch){
      const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)
      res.json({success:true,token})
    }
    else{
      res.json({success:false,message:"Invalid Credentials"})
    }
  } catch (error) {
    console.log(error.message)
     res.json({success:false,message:error.message})
  }
}

const appointmentsDoctor = async(req,res)=>{
 try {
   const {docId} = req.body
   const appointments = await appointmentModel.find({docId})
   res.json({success:true,appointments})
 } catch (error) {
  console.log(error)
  res.json({success:false,message:error.message})
 }
}

// ✅ Doctor cancel — add slot freeing
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {

      const updateData = { cancelled: true, cancelledBy: 'doctor' }
      if (appointmentData.payment) updateData.refundStatus = 'processed'

      await appointmentModel.findByIdAndUpdate(appointmentId, updateData)

      // ✅ Free the slot
      const { slotDate, slotTime } = appointmentData
      const docData = await doctorModel.findById(docId)
      if (docData) {
        let slots_booked = docData.slots_booked
        if (slots_booked[slotDate]) {
          slots_booked[slotDate] = slots_booked[slotDate].filter(s => s !== slotTime)
          await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }
      }

      return res.json({ success: true, message: 'Appointment cancelled successfully!!' })
    } else {
      res.json({ success: false, message: 'Cancellation Failed' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// ✅ Complete — free the slot too
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })

      // ✅ Free the slot
      const { slotDate, slotTime } = appointmentData
      const docData = await doctorModel.findById(docId)
      if (docData) {
        let slots_booked = docData.slots_booked
        if (slots_booked[slotDate]) {
          slots_booked[slotDate] = slots_booked[slotDate].filter(s => s !== slotTime)
          await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        }
      }

      return res.json({ success: true, message: 'Appointment completed successfully!!' })
    } else {
      res.json({ success: false, message: 'Mark Failed' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const doctorDash = async (req, res) => {
  try {
    const { docId } = req.body
    const appointments = await appointmentModel.find({ docId })

    let earnings = 0
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        if (item.refundStatus === 'processed') {
          earnings -= item.amount  
        } 
        else {
          earnings += item.amount
        }
      }
    })

    let patients = []
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId)
      }
    })

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    }

    res.json({ success: true, dashData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const getProfile = async (req, res) => {
  try {
    const { docId } = req.body
    const profileData = await doctorModel.findById(docId).select('-password')
    res.json({ success: true, profileData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const rateDoctor = async (req, res) => {
  try {
    const { docId, rating, review } = req.body
    const userId = req.user.userId  // ✅ matches your authUser middleware

    if (!rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    const doctor = await doctorModel.findById(docId)
    if (!doctor) return res.json({ success: false, message: 'Doctor not found' })

    // Prevent duplicate rating from same user
    const alreadyRated = doctor.reviews.find(r => r.userId.toString() === userId)
    if (alreadyRated) return res.json({ success: false, message: 'You already rated this doctor' })

    // Get user name from user collection
    const user = await userModel.findById(userId).select('name')

    doctor.reviews.push({
      userId,
      userName: user?.name || 'Anonymous',
      rating: Number(rating),
      review: review || ''
    })

    // Recalculate average
    const total = doctor.reviews.reduce((sum, r) => sum + r.rating, 0)
    doctor.rating = parseFloat((total / doctor.reviews.length).toFixed(1))
    doctor.totalRatings = doctor.reviews.length

    await doctor.save()

    res.json({
      success: true,
      message: 'Rating submitted!',
      newRating: doctor.rating,
      totalRatings: doctor.totalRatings
    })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

  
  const addPdf = async (req, res) => {
  try {
    const { appointmentId, medications, notes } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (appointment.cancelled) return res.json({ success: false, message: 'Appointment is cancelled' })

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      prescription: { medications, notes },
      prescriptionSent: true,
    })

    res.json({ success: true, message: 'Prescription sent to patient' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const acceptRefund = async(req,res)=>{
  try {
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) return res.json({ success: false, message: 'Appointment not found' })
    if (appointment.refundStatus !== 'requested') return res.json({ success: false, message: 'No refund request found' })

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      refundStatus: 'processed',
    })

    res.json({ success: true, message: 'Refund approved and processed' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const getPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params

    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (!appointment.prescriptionSent) {
      return res.json({ success: false, message: 'No prescription sent for this appointment' })
    }

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

export {changeAvailability,
  doctorList,
  editDoctor,
  deleteDoctor,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDash,
  getProfile,
  rateDoctor,
  addPdf,
  acceptRefund,
  getPrescription,
}