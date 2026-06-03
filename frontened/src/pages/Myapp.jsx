import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const { backend_url, token, getDoctorData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
 const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
 const slotDateFormat = (slotDate) =>{
  const dateArray = slotDate.split('_')
  return dateArray[0]+" "+months[Number(dateArray[1])]+" "+dateArray[2]
 }
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backend_url + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
console.log("backend_url =", backend_url)
console.log("request =", backend_url + "/api/user/appointments")
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backend_url + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()  
        getDoctorData()       
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) getUserAppointments()
  }, [token])

  return (
    <div className='min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 lg:px-24 py-10'>

      <p className='text-center text-2xl font-bold text-gray-800 mb-6'>
        My <span className='text-primary'>Appointments</span>
      </p>

      <div className='flex flex-col gap-5'>
        {appointments.map((item, index) => (
          <div
            key={index}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-300'
          >
            {/* Doctor Image */}
            <div className='flex-shrink-0'>
              <img
                src={item.docData.image}
                alt=""
                className='w-full sm:w-36 sm:h-36 object-contain rounded-xl bg-primary/10'
              />
            </div>

            {/* Doctor Info */}
            <div className='flex-1 flex flex-col justify-center gap-1.5'>
              <p className='text-lg font-semibold text-gray-800'>{item.docData.name}</p>
              <p className='text-sm text-primary font-medium'>{item.docData.speciality}</p>

              <div className='mt-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5'>Address</p>
                <p className='text-sm text-gray-600'>{item.docData.address.line1}</p>
                <p className='text-sm text-gray-600'>{item.docData.address.line2}</p>
              </div>

              <div className='mt-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5'>Date & Time</p>
                <p className='text-sm text-gray-700 font-medium'>{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex sm:flex-col justify-start gap-3 sm:justify-center'>
             {!item.cancelled &&  <button className='border border-primary text-primary text-sm px-5 py-2 font-medium hover:bg-primary hover:text-white transition-all duration-300 whitespace-nowrap'>
                Pay Online
              </button>}
              {!item.cancelled
                && <button
                    onClick={() => cancelAppointment(item._id)}  
                    className='border border-red-400 text-red-400 text-sm px-5 py-2 font-medium hover:bg-red-400 hover:text-white transition-all duration-300 whitespace-nowrap'>
                    Cancel Appointment
                  </button>
                
              }
              {item.cancelled && <button className='border border-blue-600 text-white text-sm px-5 py-2 font-medium bg-red-400  whitespace-nowrap'>Appointment cancelled</button>}
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default MyAppointments