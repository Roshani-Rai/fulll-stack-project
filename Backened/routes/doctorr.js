import express from 'express'
import { appointmentCancel, appointmentComplete, getPrescription , appointmentsDoctor,editDoctor, doctorDash, doctorList, loginDoctor, getProfile, changeAvailability, addPdf, acceptRefund } from '../controller/doctorcon.js'
import authDoctor from '../middlewares/authDoctor.js'
import upload from '../middlewares/multer.js';

const doctorRouter = express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDash)
doctorRouter.post('/edit-profile', authDoctor,upload.single('image'), editDoctor)
doctorRouter.get('/profile',authDoctor,getProfile)
doctorRouter.post('/change-availability',authDoctor,changeAvailability)
doctorRouter.post('/add-prescription',authDoctor,addPdf)
doctorRouter.post('/accept-refund',authDoctor,acceptRefund)
doctorRouter.get('/get-prescription/:appointmentId', authDoctor, getPrescription)


export default doctorRouter