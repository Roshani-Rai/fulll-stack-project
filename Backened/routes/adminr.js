import express from 'express'
import { addDoctor , allDoctor, loginAdmin} from '../controller/admincon.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailability } from '../controller/doctorcon.js'

const adminRouter=express.Router()

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctor)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
export default adminRouter