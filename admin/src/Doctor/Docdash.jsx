import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Docdash = () => {
  const { dtoken, dashData, getDash,cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const navigate = useNavigate()  

  useEffect(() => {
    if (dtoken) getDash()
  }, [dtoken])

  const currency = '$'

  const slotDateFormat = (slotDate) => {  
    if (!slotDate) return ''
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const isCloudinaryImage = (url) => {  
    return url && url.includes('cloudinary.com')
  }

  if (!dashData) {
    return (
      <div className='flex items-center justify-center h-40 text-gray-400'>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className='m-3 sm:m-5'>
     
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 hover:shadow-md transition-shadow duration-300'>
          <div className='bg-blue-50 p-1 rounded-lg'>
            <img src={assets.earning_icon} alt="" className='w-12 h-12' />
          </div>
          <div>
            <p className='text-2xl font-bold text-gray-800'>{currency}{dashData.earnings}</p>
            <p className='text-sm text-gray-500 font-medium'>Earnings</p>
          </div>
        </div>

       
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 hover:shadow-md transition-shadow duration-300'>
          <div className='bg-purple-50 rounded-lg'>
            <img src={assets.appointments_icon} alt="" className='w-12 h-12' />
          </div>
          <div>
            <p className='text-2xl font-bold text-gray-800'>{dashData.appointments}</p>
            <p className='text-sm text-gray-500 font-medium'>Appointments</p>
          </div>
        </div>

        
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 hover:shadow-md transition-shadow duration-300'>
          <div className='bg-green-50 p-1 rounded-lg'>
            <img src={assets.patients_icon} alt="" className='w-12 h-12' />
          </div>
          <div>
            <p className='text-2xl font-bold text-gray-800'>{dashData.patients}</p>
            <p className='text-sm text-gray-500 font-medium'>Patients</p>
          </div>
        </div>

      </div>

      
      <div className='bg-white rounded-xl shadow-sm border border-gray-100'>

       
        <div className='flex items-center justify-between px-5 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <img src={assets.list_icon} alt="" className='w-5 h-5' />
            <p className='font-semibold text-gray-700'>Latest Bookings</p>
          </div>
          <button
            onClick={() => navigate('/doctor-appointment')}
            className='text-xs text-primary border border-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-all duration-200'
          >
            View All
          </button>
        </div>

       
        <div className='divide-y'>
          {dashData.latestAppointments && dashData.latestAppointments.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate('/doctor-appointment')}
              className='flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer'
            >

             
              {isCloudinaryImage(item.userData.image) ? (
                <img
                  src={item.userData.image}
                  alt=""
                  className='w-10 h-10 rounded-full object-cover flex-shrink-0'
                />
              ) : (
                <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0'>
                  <span className='text-white text-sm font-semibold'>
                    {item.userData.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-gray-700 truncate'>{item.userData.name}</p>  {/* ✅ userData */}
                <p className='text-xs text-gray-400'>
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>

              {/* Status / Action */}
              <div onClick={(e) => e.stopPropagation()}>
                {item.cancelled ? (
                  <span className='text-red-400 text-xs font-medium bg-red-50 px-2 py-1 rounded-full whitespace-nowrap'>
                    Cancelled
                  </span>
                ) : item.isCompleted ? (
                  <span className='text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-full whitespace-nowrap'>
                    Completed
                  </span>
                ) : item.payment ? (
                  <span className='text-blue-500 text-xs font-medium bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap'>
                    Paid
                  </span>
                ) :  (
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
        </div>

        
        {(!dashData.latestAppointments || dashData.latestAppointments.length === 0) && (  // ✅ fixed dash → dashData
          <div className='flex items-center justify-center h-32 text-gray-400'>
            <p className='text-sm'>No appointments yet</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Docdash