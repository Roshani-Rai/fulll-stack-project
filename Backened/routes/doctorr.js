// routes/doctorRoute.js
import express from 'express'
import {
  changeAvailability,
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
} from '../controller/doctorcon.js'

import authDoctor from '../middlewares/authDoctor.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const doctorRouter = express.Router()

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
doctorRouter.get('/list', doctorList)
doctorRouter.post('/login', loginDoctor)

// ─── DOCTOR PROTECTED ────────────────────────────────────────────────────────
doctorRouter.post('/change-availability',   authDoctor, changeAvailability)
doctorRouter.put('/edit',                   authDoctor, upload.single('image'), editDoctor)
doctorRouter.delete('/delete',              authDoctor, deleteDoctor)
doctorRouter.get('/appointments',           authDoctor, appointmentsDoctor)
doctorRouter.post('/complete-appointment',  authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment',    authDoctor, appointmentCancel)
doctorRouter.get('/dashboard',              authDoctor, doctorDash)
doctorRouter.get('/profile',               authDoctor, getProfile)
doctorRouter.post('/add-prescription',      authDoctor, addPdf)
doctorRouter.post('/accept-refund',         authDoctor, acceptRefund)
doctorRouter.get('/prescription/:appointmentId', authDoctor, getPrescription)

// ─── USER PROTECTED (patient rates doctor) ───────────────────────────────────
doctorRouter.post('/rate', authUser, rateDoctor)

export default doctorRouter