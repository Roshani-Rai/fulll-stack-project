import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import  {toast}  from 'react-toastify'
import axios from 'axios'
const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const handleImg = (e) => {
    const file = e.target.files[0]
    if (file) {
      setDocImg(file)                                  // ✅ store actual file
      setImgPreview(URL.createObjectURL(file))
    }
  }

  const { backened_url, atoken } = useContext(AdminContext)

  const onSubmit = async(e) => {
    e.preventDefault()
    try {
      if (!docImg) return toast.error('Image not selected')

      const formData = new FormData()
      formData.append('image', docImg)                 // ✅ append file, not URL
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', fees)
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`)
      })

      const {data}= await axios.post(backened_url + '/api/admin/add-doctor',formData,{headers:{atoken}})
      if(data.success){
        toast.success(data.message);
        setDocImg(false)
        setName('')
        setAbout('')
        setDegree('')
        setEmail('')
        setAddress1('')
        setAddress2('')
        setFees('')
        setImgPreview('')
        setPassword('')
        setExperience('1 Year')
        setSpeciality('General Physician')
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='m-1 w-full'>
      <p className='ml-12 text-xl font-semibold text-gray-700 mb-6'>Add <span className='text-xl font-semibold text-primary mb-6'>Doctor</span></p>

      <form onSubmit={onSubmit} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full'>

        {/* Image Upload */}
        <div className='flex items-center gap-4 mb-8'>
          <label htmlFor='doc-img' className='cursor-pointer flex-shrink-0'>
            <img
              src={imgPreview || assets.upload_area}
              alt='Upload'
              className='w-20 h-20 rounded-full object-cover border-2 border-dashed border-primary/40 hover:border-primary transition'
            />
          </label>
          <input onChange={handleImg} type='file' id='doc-img' accept='image/*' hidden />
          <div>
            <p className='text-sm font-medium text-gray-700'>Upload Doctor Picture</p>
            <p className='text-xs text-gray-400 mt-1'>Click the image to upload</p>
          </div>
        </div>

        {/* Form Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

          {/* Left Column */}
          <div className='flex flex-col gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Doctor Name</label>
              <input
                onChange={(e) => setName(e.target.value)} value={name}
                type='text'
                placeholder='Full name'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Doctor Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)} value={email}  // ✅ lowercase email
                type='email'
                autoComplete='new-password'
                placeholder='Email address'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Doctor Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)} value={password}  // ✅ fixed typo
                type='password'
                 autoComplete='new-password'
                placeholder='Password'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Experience</label>
              <select onChange={(e) => setExperience(e.target.value)} value={experience} className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white'>
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i + 1} value={`${i + 1} Year`}>{i + 1} Year</option>
                ))}
              </select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Fees</label>
              <input
                onChange={(e) => setFees(e.target.value)} value={fees}
                type='number'
                placeholder='Consultation fees'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>
          </div>

          {/* Right Column */}
          <div className='flex flex-col gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Speciality</label>
              <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white'>
                <option value='General physician'>General Physician</option>
                <option value='Gynecologist'>Gynecologist</option>
                <option value='Dermatologist'>Dermatologist</option>
                <option value='Pediatricians'>Pediatricians</option>
                <option value='Neurologist'>Neurologist</option>
                <option value='Gastroenterologist'>Gastroenterologist</option>
              </select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Education</label>
              <input
                onChange={(e) => setDegree(e.target.value)} value={degree}
                type='text'
                placeholder='Degree / University'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Address</label>
              <input
                onChange={(e) => setAddress1(e.target.value)} value={address1}
                type='text'
                placeholder='Address line 1'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition mb-2'
              />
              <input
                onChange={(e) => setAddress2(e.target.value)} value={address2}
                type='text'
                placeholder='Address line 2'
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>
          </div>
        </div>

        {/* About Doctor */}
        <div className='mt-6'>
          <label className='text-sm font-medium text-gray-600 block mb-1'>About Doctor</label>
          <textarea
            onChange={(e) => setAbout(e.target.value)} value={about}
            placeholder='Write about the doctor — experience, specializations, achievements...'
            rows={5}
            required
            className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none'
          />
        </div>

        {/* Submit */}
        <button
          type='submit'
          className='mt-6 bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-60'
        >
          Add Doctor
        </button>

      </form>
    </div>
  )
}

export default AddDoctor