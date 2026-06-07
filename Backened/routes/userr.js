import express from 'express'
import { forgotPassword, resetPassword , googleLogin,registerUser, loginUser,cancelAppointment, getProfile, updateProfile, bookAppointment, listAppointment, paymentRazorpay, verifyRazorpay, refundRequest, completeAppointment } from '../controller/usercon.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'
import { rateDoctor } from '../controller/doctorcon.js'


const userRouter = express.Router()


userRouter.post('/rate-doctor', authUser, rateDoctor)
userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',authUser, upload.single('image'),updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)
userRouter.post('/google-login', googleLogin)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/payment-razorpay',authUser,paymentRazorpay)
userRouter.post('/verifyRazorpay',authUser,verifyRazorpay)
userRouter.post('/request-refund', authUser, refundRequest)
userRouter.post('/complete-appointment',authUser,completeAppointment)

export default userRouter