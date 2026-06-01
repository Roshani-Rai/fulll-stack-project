import validator from "validator"
import bcrypt from 'bcrypt'
import doctorModel from "../models/doctorsch.js"
import jwt from "jsonwebtoken"

const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree,
                experience, about, fees, address } = req.body
        const image = req.file

        if (!image) {
            return res.json({ success: false, message: "Please upload an image" })
        }
        if (!name || !email || !password || !speciality || !degree ||
            !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const b64 = Buffer.from(image.buffer).toString("base64")  
        const dataURI = `data:${image.mimetype};base64,${b64}`   

        const formData = new FormData()
        formData.append('file', dataURI)
        formData.append('upload_preset', 'doctor_app')

        const response = await fetch('https://api.cloudinary.com/v1_1/du54hrrha/image/upload', {
            method: 'POST',
            body: formData
        })
        const imageUpload = await response.json()

        if (!imageUpload.secure_url) {
            return res.json({ success: false, message: "Image upload failed" })
        }

        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address.replace(/^"|"$/g, '')),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        return res.json({ success: true, message: "Doctor Added Successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const allDoctor = async(req,res)=>{
    try {
        const doctors=await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export { addDoctor, loginAdmin ,allDoctor}