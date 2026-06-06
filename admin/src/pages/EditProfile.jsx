import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const EditDoctor = () => {
  const { state } = useLocation()
  const doctor = state?.doctor
  const navigate = useNavigate()

  const { dtoken, backend_url, getProfileData } = useContext(DoctorContext)
  const { atoken, getAllDoctors } = useContext(AdminContext)

  // ✅ detect who is editing
  const isAdmin = Boolean(atoken)
  const token = isAdmin ? atoken : dtoken
  const tokenKey = isAdmin ? 'atoken' : 'dtoken'

  const [name, setName] = useState(doctor?.name || '')
  const [email, setEmail] = useState(doctor?.email || '')
  const [fees, setFees] = useState(doctor?.fees || '')
  const [speciality, setSpeciality] = useState(doctor?.speciality || '')
  const [degree, setDegree] = useState(doctor?.degree || '')
  const [experience, setExperience] = useState(doctor?.experience || '')
  const [about, setAbout] = useState(doctor?.about || '')
  const [address1, setAddress1] = useState(doctor?.address?.line1 || '')
  const [address2, setAddress2] = useState(doctor?.address?.line2 || '')
  const [docImg, setDocImg] = useState(null)
  const [imgPreview, setImgPreview] = useState(doctor?.image || null)

  const handleImg = (e) => {
    const file = e.target.files[0]
    if (file) {
      setDocImg(file)
      setImgPreview(URL.createObjectURL(file))
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('docId', doctor._id)
      formData.append('name', name)
      formData.append('fees', fees)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('experience', experience)
      formData.append('about', about)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))
      if (docImg) formData.append('image', docImg)

      // ✅ use correct endpoint and token based on role
      const endpoint = isAdmin
        ? backend_url + '/api/admin/edit-doctor'
        : backend_url + '/api/doctor/edit-profile'

      const { data } = await axios.post(
        endpoint,
        formData,
        { headers: { [tokenKey]: token } }
      )

      if (data.success) {
        toast.success(data.message)

        if (isAdmin) {
          await getAllDoctors()               // ✅ refresh admin doctor list
          navigate('/doctor-list', { replace: true })
        } else {
          await getProfileData()             // ✅ refresh doctor profile
          navigate('/doctor-profile', { replace: true })
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='m-4 w-full'>
      <p className='ml-14 sm:ml-0 text-xl font-semibold text-gray-700 mb-6'>
        Edit <span className='text-primary'>Doctor</span>
      </p>

      <form onSubmit={onSubmitHandler} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full'>

        {/* Image Upload */}
        <div className='flex items-center gap-4 mb-8'>
          <label htmlFor='doc-img' className='cursor-pointer flex-shrink-0'>
            {imgPreview
              ? <img
                  src={imgPreview}
                  alt={doctor?.name}
                  className='w-20 h-20 rounded-full object-cover border-2 border-dashed border-primary/40 hover:border-primary transition'
                />
              : <div className='w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-primary/40 flex items-center justify-center'>
                  <span className='text-2xl text-gray-400 font-semibold'>
                    {doctor?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
            }
          </label>
          <input onChange={handleImg} type='file' id='doc-img' accept='image/*' hidden />
          <div>
            <p className='text-sm font-medium text-gray-700'>{doctor?.name}</p>
            <p className='text-xs text-gray-400 mt-1'>Click the image to update</p>
              <div className='flex items-center gap-1.5 mt-2'>
              {[1,2,3,4,5].map(star => (
                <span key={star} className={`text-base ${star <= Math.round(doctor?.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
              <span className='text-xs font-semibold text-gray-600'>{doctor?.rating?.toFixed(1)}</span>
              <span className='text-xs text-gray-400'>({doctor?.totalRatings || 0} reviews)</span>
            </div>
          </div>
          </div>
       

        {/* Form Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

          {/* Left Column */}
          <div className='flex flex-col gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Doctor Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                type='text'
                placeholder='Full name'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Doctor Email</label>
              <input
                value={email}
                type='email'
                disabled
                className='w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed'
              />
              <p className='text-xs text-gray-400 mt-1'>Email cannot be changed</p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Experience</label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white'
              >
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i + 1} value={`${i + 1} Year`}>{i + 1} Year</option>
                ))}
              </select>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Fees</label>
              <input
                value={fees}
                onChange={e => setFees(e.target.value)}
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
              <select
                value={speciality}
                onChange={e => setSpeciality(e.target.value)}
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-white'
              >
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
                value={degree}
                onChange={e => setDegree(e.target.value)}
                type='text'
                placeholder='Degree / University'
                required
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-600 block mb-1'>Address</label>
              <input
                value={address1}
                onChange={e => setAddress1(e.target.value)}
                type='text'
                placeholder='Address line 1'
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition mb-2'
              />
              <input
                value={address2}
                onChange={e => setAddress2(e.target.value)}
                type='text'
                placeholder='Address line 2'
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition'
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className='mt-6'>
          <label className='text-sm font-medium text-gray-600 block mb-1'>About Doctor</label>
          <textarea
            value={about}
            onChange={e => setAbout(e.target.value)}
            placeholder='Write about the doctor...'
            rows={5}
            required
            className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none'
          />
        </div>

        {/* Buttons */}
        <div className='flex gap-3 mt-6'>
          <button
            type='submit'
            className='bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition'
          >
            Save Changes
          </button>
          <button
            type='button'
            onClick={() => navigate(isAdmin ? '/doctor-list' : '/doctor-profile')}
            className='border border-gray-300 text-gray-600 px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition'
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}

export default EditDoctor