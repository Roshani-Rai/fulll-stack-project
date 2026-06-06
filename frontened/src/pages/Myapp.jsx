import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const navigate = useNavigate()
  const { backend_url, token, getDoctorData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backend_url + '/api/user/verifyRazorpay',
            response,
            { headers: { token } }
          )
          if (data.success) {
            getUserAppointments()
            navigate('/my-appointment')
            toast.success("Payment Successful!")
          }
        } catch (error) {
          toast.error(error.message)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error("Razorpay SDK failed to load. Check internet connection.")
        return
      }
      const { data } = await axios.post(
        backend_url + '/api/user/payment-razorpay',
        { appointmentId },
        { headers: { token } }
      )
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

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

  
  const getCancelledLabel = (item) => {
    if (item.cancelledBy === 'doctor') return '⚠️ Cancelled by Doctor'
    if (item.cancelledBy === 'admin') return '⚠️ Cancelled by Admin'
    return 'Cancelled by You'
  }

  return (
    <div className='min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 lg:px-24 py-10'>
      <p className='text-center text-2xl font-bold text-gray-800 mb-6'>
        My <span className='text-primary'>Appointments</span>
      </p>

      {/* ✅ empty state */}
      {appointments.length === 0 && (
        <div className='flex flex-col items-center justify-center py-24 text-gray-400'>
          <svg xmlns="http://www.w3.org/2000/svg" className='w-14 h-14 mb-4 text-gray-300' fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className='text-lg font-medium'>No appointments yet</p>
          <p className='text-sm mt-1'>Book an appointment with a doctor to get started</p>
          <button
            onClick={() => navigate('/doctor')}
            className='mt-5 px-6 py-2 bg-primary text-white rounded-full text-sm hover:opacity-90 transition'
          >
            Find Doctors
          </button>
        </div>
      )}

      <div className='flex flex-col gap-5'>
        {appointments.map((item, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col sm:flex-row gap-5 
              hover:shadow-md transition-shadow duration-300
              ${item.cancelled ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}
          >
            
            <div className='flex-shrink-0'>
              <img
                src={item.docData.image}
                alt=""
                className={`w-full sm:w-36 sm:h-36 object-contain rounded-xl 
                  ${item.cancelled ? 'grayscale opacity-60' : 'bg-primary/10'}`}
              />
            </div>

            {/* Info */}
            <div className='flex-1 flex flex-col justify-center gap-1.5'>
              <div className='flex items-center gap-2 flex-wrap'>
                <p className='text-lg font-semibold text-gray-800'>{item.docData.name}</p>

                {/* ✅ status badge */}
                {item.cancelled && (
                  <span className='text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-500'>
                    Cancelled
                  </span>
                )}
                {!item.cancelled && item.isCompleted && (
                  <span className='text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-600'>
                    Completed
                  </span>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <span className='text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-500'>
                    Upcoming
                  </span>
                )}
              </div>

              <p className='text-sm text-primary font-medium'>{item.docData.speciality}</p>
              <div className='flex items-center gap-1 px-4 pb-4 mt-1'>
  {[1,2,3,4,5].map(star => (
    <span key={star} className={`text-sm ${star <= Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
  ))}
  <span className='text-xs text-gray-400 ml-1'>{item.rating?.toFixed(1)} ({item.totalRatings || 0})</span>
</div>

              <div className='mt-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5'>Address</p>
                <p className='text-sm text-gray-600'>{item.docData.address.line1}</p>
                <p className='text-sm text-gray-600'>{item.docData.address.line2}</p>
              </div>

              <div className='mt-1'>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5'>Date & Time</p>
                <p className='text-sm text-gray-700 font-medium'>
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
            </div>

           
            <div className='flex sm:flex-col justify-start gap-3 sm:justify-center'>

             
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className='border border-green-500 text-white text-sm px-5 py-2 font-medium bg-green-500 whitespace-nowrap rounded-lg cursor-default'>
                  ✓ Paid
                </button>
              )}

            
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className='border border-primary text-primary text-sm px-5 py-2 font-medium rounded-lg hover:bg-primary hover:text-white transition-all duration-300 whitespace-nowrap'>
                  Pay Online
                </button>
              )}

              
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='border border-red-400 text-red-400 text-sm px-5 py-2 font-medium rounded-lg hover:bg-red-400 hover:text-white transition-all duration-300 whitespace-nowrap'>
                  Cancel
                </button>
              )}


              {item.cancelled &&  !item.isCompleted &&(
                <div className='flex flex-col items-center gap-1.5'>
                  <button className='border border-red-300 text-red-400 text-sm px-5 py-2 font-medium bg-red-50 whitespace-nowrap rounded-lg cursor-default w-full'>
                    Appointment Cancelled
                  </button>
                  <p className='text-xs text-gray-400 text-center'>
                    {getCancelledLabel(item)}
                  </p>
                </div>
              )}

             
              {!item.cancelled && item.isCompleted && (
                <button className='border border-green-400 text-green-500 text-sm px-5 py-2 font-medium bg-green-50 whitespace-nowrap rounded-lg cursor-default'>
                  ✓ Completed
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments