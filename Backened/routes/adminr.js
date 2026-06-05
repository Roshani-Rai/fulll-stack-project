import express from 'express'
import { addDoctor , adminDashboard, allDoctor, appointmentAdmin, appointmentCancel, loginAdmin} from '../controller/admincon.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailability , deleteDoctor, editDoctor } from '../controller/doctorcon.js'

const adminRouter=express.Router()

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctor)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.post('/edit-doctor', authAdmin, upload.single('image'), editDoctor)
adminRouter.post('/delete-doctor', authAdmin, deleteDoctor)
adminRouter.get('/appointments',authAdmin,appointmentAdmin)
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
adminRouter.get('/dashboard',authAdmin,adminDashboard)

export default adminRouter