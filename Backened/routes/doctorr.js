import express from 'express'
import { appointmentCancel, appointmentComplete, appointmentsDoctor,editDoctor, doctorDash, doctorList, loginDoctor, getProfile, changeAvailability } from '../controller/doctorcon.js'
import { googleLogin , forgotPassword , resetPassword } from '../controller/usercon.js'
import authDoctor from '../middlewares/authDoctor.js'
import upload from '../middlewares/multer.js';

const doctorRouter = express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.post('/google-login', googleLogin)
doctorRouter.post('/forgot-password', forgotPassword)
doctorRouter.post('/reset-password', resetPassword)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDash)
doctorRouter.post('/edit-profile', authDoctor,upload.single('image'), editDoctor)
doctorRouter.get('/profile',authDoctor,getProfile)
doctorRouter.post('/change-availability',authDoctor,changeAvailability)


export default doctorRouter