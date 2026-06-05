import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../context/DoctorContext'

const DocAppoint = () => {
  const { dtoken, appointments, getAppointments,cancelAppointment,completeAppointment } = useContext(DoctorContext)

  useEffect(() => {
    if (dtoken) getAppointments()
  }, [dtoken])

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dob)
    return today.getFullYear() - birthDate.getFullYear()
  }

  const isCloudinaryImage = (url) => {
    return url && url.includes('cloudinary.com')
  }

  return (
    <div className='w-full max-w-6xl m-3 sm:m-5'>
      <p className='mb-3 text-lg font-medium'>
        All <span className='text-primary'>Appointments</span>
      </p>

      <div className='bg-white border rounded-xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto'>

        {/* Header - Desktop Only */}
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_1fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50 font-semibold text-gray-600'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Rows */}
        {appointments && appointments.reverse().map((item, index) => (
          <div
            key={index}
            className='
              flex flex-col gap-3 p-4 border-b hover:bg-gray-50 transition-colors duration-200
              sm:grid sm:grid-cols-[0.5fr_3fr_1fr_1fr_3fr_1fr_1fr] sm:items-center sm:py-3 sm:px-6 sm:gap-0
            '
          >
            {/* Index */}
            <p className='hidden font-semibold  sm:block text-gray-500'>{index + 1}</p>

            {/* Patient */}
            <div className='flex items-center gap-2'>
              {isCloudinaryImage(item.userData.image) ? (
                <img
                  src={item.userData.image}
                  alt=""
                  className='w-9 h-9 rounded-full object-cover flex-shrink-0'
                />
              ) : (
                <div className='w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0'>
                  <span className='text-white text-sm font-semibold'>
                    {item.userData.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className='font-medium text-gray-700'>{item.userData.name}</p>
                <p className='text-xs text-gray-400 sm:hidden'>
                  Age: {calculateAge(item.userData.dob)}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                item.payment
                  ? 'bg-green-50 border border-green-100  text-green-500'
                  : 'bg-yellow-50 border border-yellow-100 text-yellow-600'
              }`}>
                {item.payment ? 'Online' : 'Cash'}
              </span>
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
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            {/* Fees */}
            <div>
              <p className='text-xs text-gray-400 sm:hidden font-semibold uppercase tracking-wide mb-0.5'>
                Fees
              </p>
              <p className=' font-semibold text-gray-600'>₹{item.amount}</p>
            </div>

            {/* Action */}
            <div>
              {item.cancelled ? (
                <span className='text-red-400 text-xs font-medium bg-red-50 px-2 py-1 rounded-full'>
                  Cancelled
                </span>
              ) : item.isCompleted ? (
                <span className='text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-full'>
                  Completed
                </span>
              ) : (
                <div className='flex items-center gap-2'>
                
                  <button
                   onClick={()=>cancelAppointment(item._id)}
                    title='Cancel'
                    className='w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border border-red-300 text-red-400 hover:bg-red-400 hover:text-white transition-all duration-200'
                  >
                    ✕
                  </button>
                 
                  <button
                    title='Mark Complete'
                    onClick={()=>completeAppointment(item._id)}
                    className='w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border border-green-300 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200'
                  >
                    ✓
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}

        {/* Empty State */}
        {(!appointments || appointments.length === 0) && (
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

export default DocAppoint