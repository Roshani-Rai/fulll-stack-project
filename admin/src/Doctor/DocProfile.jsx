import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { profileData, getProfileData, dtoken, backend_url, setProfileData } = useContext(DoctorContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (dtoken) getProfileData()
  }, [dtoken])

  const toggleAvailability = async () => {
    try {
      const { data } = await axios.post(
        backend_url + '/api/doctor/change-availability',
        { docId: profileData._id },
        { headers: { dtoken } }
      )
      if (data.success) {
        toast.success(data.message)
        setProfileData(prev => ({ ...prev, available: !prev.available }))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (!profileData) return (
    <div className='flex items-center justify-center h-full'>
      <p className='text-gray-400 text-sm'>Loading profile...</p>
    </div>
  )

  return (
    <div className='m-4 w-full'>
      <p className='ml-14 sm:ml-0 text-xl font-semibold text-gray-700 mb-6'>
        My <span className='text-primary'>Profile</span>
      </p>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full'>

        {/* Top Section */}
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8'>

          {/* Doctor Image */}
          <div className='flex-shrink-0'>
            {profileData.image
              ? <img
                  src={profileData.image}
                  alt={profileData.name}
                  className='w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-sm'
                />
              : <div className='w-28 h-28 rounded-full bg-gray-100 border-4 border-primary/20 flex items-center justify-center'>
                  <span className='text-3xl text-gray-400 font-semibold'>
                    {profileData.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
            }
          </div>

          {/* Name + Speciality */}
          <div className='flex-1 text-center sm:text-left'>
            <h2 className='text-2xl font-bold text-gray-800'>{profileData.name}</h2>
            <p className='text-primary font-medium mt-1'>{profileData.speciality}</p>
            <p className='text-sm text-gray-400 mt-1'>{profileData.degree}</p>
          </div>

          {/* Right side - Edit Button + Checkbox */}
          <div className='flex flex-col items-end gap-3 self-start'>

            {/* Edit Button */}
            <button
              onClick={() => navigate('/edit-profile', { state: { doctor: profileData } })}
              className='flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
              </svg>
              Edit Profile
            </button>

            {/* ✅ Availability Checkbox */}
            <label className='flex items-center gap-2 cursor-pointer select-none'>
              <input
                type='checkbox'
                checked={profileData.available}
                onChange={toggleAvailability}
                className='w-4 h-4 accent-primary cursor-pointer'
              />
              <span className={`text-sm font-medium ${profileData.available ? 'text-green-600' : 'text-gray-400'}`}>
                {profileData.available ? 'Available' : 'Not Available'}
              </span>
            </label>

          </div>
        </div>

        <hr className='border-gray-100 mb-6' />

        {/* Info Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>

          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Email</p>
            <p className='text-sm font-medium text-gray-700 break-all'>{profileData.email || '—'}</p>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Experience</p>
            <p className='text-sm font-medium text-gray-700'>{profileData.experience || '—'}</p>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Consultation Fees</p>
            <p className='text-sm font-medium text-gray-700'>
              ₹ {profileData.fees != null ? profileData.fees : '—'}
            </p>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Address Line 1</p>
            <p className='text-sm font-medium text-gray-700'>{profileData.address?.line1 || '—'}</p>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Address Line 2</p>
            <p className='text-sm font-medium text-gray-700'>{profileData.address?.line2 || '—'}</p>
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Speciality</p>
            <p className='text-sm font-medium text-gray-700'>{profileData.speciality || '—'}</p>
          </div>

        </div>

        {/* About */}
        <div className='mt-6 bg-gray-50 rounded-lg p-4'>
          <p className='text-xs text-gray-400 uppercase tracking-wide mb-2'>About</p>
          <p className='text-sm text-gray-600 leading-relaxed'>{profileData.about || '—'}</p>
        </div>

      </div>
    </div>
  )
}

export default DoctorProfile