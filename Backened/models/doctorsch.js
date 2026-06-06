import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  userName:   { type: String, required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  review:     { type: String, default: "" },
  date:       { type: Date, default: Date.now },
})

const doctorSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  image:        { type: String, required: true },
  speciality:   { type: String, required: true },
  degree:       { type: String, required: true },
  experience:   { type: String, required: true },
  about:        { type: String, required: true },
  available:    { type: Boolean, default: true },
  fees:         { type: Number, required: true },
  address:      { type: Object, required: true },
  date:         { type: Number, required: true },
  slots_booked: { type: Object, default: {} },

  rating:       { type: Number, default: 3 },       
  totalRatings: { type: Number, default: 0 },        
  reviews:      { type: [reviewSchema], default: [] } 

}, { minimize: false })

const doctorModel = mongoose.model('doctor', doctorSchema)
export default doctorModel