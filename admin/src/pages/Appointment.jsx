import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import {assets} from '../assets/assets'
const Appointment = () => {
  const { atoken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)

  useEffect(() => {
    if (atoken) getAllAppointments()
  }, [atoken])

 const isCloudinaryImage = (url) => {
  return url && url.includes('cloudinary.com')
}

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dob)
    return today.getFullYear() - birthDate.getFullYear()
  }

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  return atoken && (
    <div className=' w-full max-w-6xl m-3 sm:m-5'>
     
    
       <p className='ml-11 text-xl font-semibold text-gray-700 mb-6'>All  <span className='text-xl font-semibold text-primary mb-6'>Appointments</span></p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto'>

        {/* Header Row - Desktop Only */}
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50 font-semibold text-gray-600'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {/* Appointment Rows */}
        {appointments && appointments.map((item, index) => (
          <div
            key={index}
            className='
              flex flex-col gap-3 p-4 border-b hover:bg-gray-50 transition-colors duration-200
              sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] sm:items-center sm:py-3 sm:px-6 sm:gap-0
            '
          >
            {/* Index */}
            <p className='hidden sm:block text-gray-500'>{index + 1}</p>

            {/* Patient */}
            <div className='flex items-center gap-2'>
  {isCloudinaryImage(item.userData.image) ? (
    <img
      src={item.userData.image}
      alt=""
      className='w-9 h-9 rounded-full object-cover flex-shrink-0'
    />
  ) : (
    <div className='w-9 h-9 rounded-full  flex items-center justify-center flex-shrink-0'>
       <img className=' w-9 h-9  rounded-full object-cover flex-shrink-0' src= {assets.patients_icon} />
    </div>
  )}
              <div>
                <p className='font-medium text-gray-700'>{item.userData.name}</p>
                <p className='text-xs text-gray-400 sm:hidden'>
                  Age: {calculateAge(item.userData.dob)} &nbsp;|&nbsp; ₹{item.amount}
                </p>
              </div>
            </div>

            {/* Age - Desktop Only */}
            <p className='hidden sm:block text-gray-600'>
              {calculateAge(item.userData.dob)}
            </p>

            {/* Date & Time */}
            <div>
              <p className='text-xs text-gray-400 sm:hidden font-semibold uppercase tracking-wide mb-0.5'>
                Date & Time
              </p>
              <p className='text-gray-600'>
                {slotDateFormat(item.slotDate)} &nbsp;|&nbsp; {item.slotTime}
              </p>
            </div>

            {/* Doctor */}
            <div className='flex items-center gap-2'>
              {item.docData.image ? (
                <img
                  src={item.docData.image}
                  alt=""
                  className='w-9 h-9 rounded-full object-cover flex-shrink-0 hidden sm:block'
                />
              ) : (
                <div className='w-9 h-9 rounded-full bg-blue-500 items-center justify-center flex-shrink-0 hidden sm:flex'>
                  <span className='text-white text-sm font-semibold'>
                    {item.docData.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className='text-xs text-gray-400 sm:hidden font-semibold uppercase tracking-wide mb-0.5'>
                  Doctor
                </p>
                <p className='text-gray-700'>{item.docData.name}</p>
                <p className='text-xs text-primary sm:hidden'>{item.docData.speciality}</p>
              </div>
            </div>

            {/* Fees - Desktop Only */}
            <p className='hidden sm:block text-gray-600'>₹{item.amount}</p>

            {/* Actions */}
           {/* Actions */}
<div className='flex flex-col gap-1.5 sm:block'>
  {item.cancelled ? (
    <span className='text-red-400 text-xs font-medium bg-red-50 px-2 py-1 rounded-full'>
      Cancelled
    </span>
  ) : item.payment ? (
    <div className='flex flex-col gap-1.5'>

      {/* Paid badge */}
      <span className='text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-full text-center'>
        ✓ Paid
      </span>

      {/* ✅ Prescription status */}
      {item.prescriptionId ? (
        <button
          onClick={() => window.open(
            `${import.meta.env.VITE_BACKEND_URL}/api/prescription/${item.prescriptionId}`, '_blank'
          )}
          className='text-xs px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 text-center'
        >
          📄 View Rx
        </button>
      ) : (
        <span className='text-xs px-2 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-500 text-center'>
          ⏳ No Rx yet
        </span>
      )}

    </div>
  ) : (
    <button
      onClick={() => cancelAppointment(item._id)}
      className='flex items-center cursor-pointer gap-1 text-red-400 hover:text-red-600 text-xs border border-red-300 hover:border-red-500 px-2 py-1 rounded-full transition-all duration-200'
      title='Cancel Appointment'
    >
      <span>✕</span>
      <span className='sm:hidden'>Cancel</span>
    </button>
  )}
</div>

          </div>
        ))}

        {/* Empty State */}
        {appointments && appointments.length === 0 && (
          <div className='flex flex-col items-center justify-center h-40 text-gray-400 gap-2'>
            <svg className='w-10 h-10 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
            <p className='text-sm'>No appointments found</p>
          </div>
        )}

      </div>
    </div>
  
  )
}

export default Appointment