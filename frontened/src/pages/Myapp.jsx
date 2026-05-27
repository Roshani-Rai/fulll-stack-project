import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const MyAppointments = () => {
  const { doctors } = useContext(AppContext)

  return (
    <div className='min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 lg:px-24 py-10'>

      <p className='text-center text-2xl font-bold text-gray-800 mb-6'>
        My <span className='text-primary'>Appointments</span>
      </p>

      <div className='flex flex-col gap-5'>
        {doctors.slice(0, 2).map((item, index) => (
          <div
            key={index}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-300'
          >
            {/* Doctor Image */}
           <div className='flex-shrink-0'>
  <img
    src={item.image}
    alt={item.name}
    className='w-full sm:w-36 sm:h-36 object-contain rounded-xl bg-primary/10'
  />
</div>

            {/* Doctor Info */}
            <div className='flex-1 flex flex-col justify-center gap-1.5'>
              <p className='text-lg font-semibold text-gray-800'>{item.name}</p>
              <p className='text-sm text-primary font-medium'>{item.speciality}</p>

              <div className='mt-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5'>Address</p>
                <p className='text-sm text-gray-600'>{item.address.line1}</p>
                <p className='text-sm text-gray-600'>{item.address.line2}</p>
              </div>

              <div className='mt-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5'>Date & Time</p>
                <p className='text-sm text-gray-700 font-medium'>Sunday, 20 July 2025 | 10:30 AM</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex sm:flex-col justify-start gap-3 sm:justify-center'>
              <button className='border border-primary text-primary text-sm px-5 py-2  font-medium hover:bg-primary hover:text-white transition-all duration-300 whitespace-nowrap'>
                Pay Online
              </button>
              <button className='border border-red-400 text-red-400 text-sm px-5 py-2 font-medium hover:bg-red-400 hover:text-white transition-all duration-300 whitespace-nowrap'>
                Cancel Appointment
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default MyAppointments