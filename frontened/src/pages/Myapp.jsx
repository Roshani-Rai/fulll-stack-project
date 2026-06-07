import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const navigate = useNavigate()
  const { backend_url, token, getDoctorData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  const slotDateFormat = (slotDate) => {
    const d = slotDate.split('_')
    return d[0] + " " + months[Number(d[1])] + " " + d[2]
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backend_url + '/api/user/appointments', { headers: { token } })
      if (data.success) setAppointments(data.appointments.reverse())
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // ── payment (your existing code, unchanged) ──
  const loadRazorpayScript = () => new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

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
          const { data } = await axios.post(backend_url + '/api/user/verifyRazorpay', response, { headers: { token } })
          if (data.success) { getUserAppointments(); navigate('/my-appointment'); toast.success("Payment Successful!") }
        } catch (error) { toast.error(error.message) }
      }
    }
    new window.Razorpay(options).open()
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) return toast.error("Razorpay SDK failed to load.")
      const { data } = await axios.post(backend_url + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
      if (data.success) initPay(data.order)
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }

  // ── cancel (free, no payment) ──
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backend_url + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) { toast.success(data.message); getUserAppointments(); getDoctorData() }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }

  // ── cancel + refund (paid appointment) ──
  const requestRefund = async (appointmentId) => {
    if (!window.confirm("Cancel this appointment? A refund of the paid amount will be initiated within 4 hours.")) return
    try {
      const { data } = await axios.post(backend_url + '/api/user/request-refund', { appointmentId }, { headers: { token } })
      if (data.success) { toast.success(data.message); getUserAppointments() }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }

  // ── mark completed ──
  const markCompleted = async (appointmentId) => {
    try {
      const { data } = await axios.post(backend_url + '/api/user/complete-appointment', { appointmentId }, { headers: { token } })
      if (data.success) { toast.success("Appointment marked as completed!"); getUserAppointments() }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }

  // ── download PDF ──
  const downloadPDF = (appointmentId) => {
    window.open(`${backend_url}/api/prescription/${appointmentId}`, '_blank')
  }

  useEffect(() => { if (token) getUserAppointments() }, [token])

  return (
    <div className='min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 lg:px-24 py-10'>
      <p className='text-center text-2xl font-bold text-gray-800 mb-6'>
        My <span className='text-primary'>Appointments</span>
      </p>

      {appointments.length === 0 && (
        <div className='flex flex-col items-center justify-center py-24 text-gray-400'>
          <p className='text-lg font-medium'>No appointments yet</p>
          <button onClick={() => navigate('/doctor')} className='mt-5 px-6 py-2 bg-primary text-white rounded-full text-sm hover:opacity-90'>
            Find Doctors
          </button>
        </div>
      )}

      <div className='flex flex-col gap-5'>
        {appointments.map((item, index) => (
          <div key={index} className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-300 ${item.cancelled ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>

            {/* Doctor image */}
            <div className='flex-shrink-0'>
              <img src={item.docData.image} alt="" className={`w-full sm:w-36 sm:h-36 object-contain rounded-xl ${item.cancelled ? 'grayscale opacity-60' : 'bg-primary/10'}`} />
            </div>

            {/* Info */}
            <div className='flex-1 flex flex-col justify-center gap-1.5'>
              <div className='flex items-center gap-2 flex-wrap'>
                <p className='text-lg font-semibold text-gray-800'>{item.docData.name}</p>
                {item.cancelled && <span className='text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-500'>Cancelled</span>}
                {!item.cancelled && item.isCompleted && <span className='text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-600'>Completed</span>}
                {!item.cancelled && !item.isCompleted && item.prescriptionSent && <span className='text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-600'>Prescription Ready</span>}
                {!item.cancelled && !item.isCompleted && !item.prescriptionSent && <span className='text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-600'>Upcoming</span>}
              </div>

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

              {/* Refund status banner */}
              {item.refundStatus === 'requested' && (
                <div className='mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2'>
                  🕐 Refund requested — will be processed within 4 hours after doctor approval.
                </div>
              )}
              {item.refundStatus === 'processed' && (
                <div className='mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2'>
                  ✅ Refund successfully credited to your original payment method.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className='flex sm:flex-col justify-start gap-3 sm:justify-center'>

              {/* Pay button — unpaid, not cancelled, no prescription yet */}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button onClick={() => appointmentRazorpay(item._id)} className='border border-primary text-primary text-sm px-5 py-2 font-medium rounded-lg hover:bg-primary hover:text-white transition-all whitespace-nowrap'>
                  Pay Online
                </button>
              )}

              {/* Paid badge */}
              {!item.cancelled && item.payment && !item.isCompleted && !item.prescriptionSent && (
                <button className='border border-green-500 text-white text-sm px-5 py-2 font-medium bg-green-500 whitespace-nowrap rounded-lg cursor-default'>
                  ✓ Paid
                </button>
              )}

              {/* Download PDF — prescription sent, not yet completed */}
              {!item.cancelled && item.prescriptionSent && !item.isCompleted && (
                <button onClick={() => downloadPDF(item._id)} className='border border-blue-500 text-blue-500 text-sm px-5 py-2 font-medium rounded-lg hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap'>
                  ⬇ Save PDF
                </button>
              )}

              {/* Mark completed — prescription sent, not yet completed */}
              {!item.cancelled && item.prescriptionSent && !item.isCompleted && (
                <button onClick={() => markCompleted(item._id)} className='border border-green-500 text-green-600 text-sm px-5 py-2 font-medium rounded-lg hover:bg-green-500 hover:text-white transition-all whitespace-nowrap'>
                  ✓ Complete
                </button>
              )}

              {/* Cancel (no payment) — hide if prescription sent */}
              {!item.cancelled && !item.payment && !item.isCompleted && !item.prescriptionSent && (
                <button onClick={() => cancelAppointment(item._id)} className='border border-red-400 text-red-400 text-sm px-5 py-2 font-medium rounded-lg hover:bg-red-400 hover:text-white transition-all whitespace-nowrap'>
                  Cancel
                </button>
              )}

              {/* Cancel + Refund (paid) — hide if prescription sent */}
              {!item.cancelled && item.payment && !item.isCompleted && !item.prescriptionSent && (
                <button onClick={() => requestRefund(item._id)} className='border border-red-400 text-red-400 text-sm px-5 py-2 font-medium rounded-lg hover:bg-red-400 hover:text-white transition-all whitespace-nowrap'>
                  Cancel & Refund
                </button>
              )}

              {/* Cancelled state */}
              {item.cancelled && !item.isCompleted && (
                <div className='flex flex-col items-center gap-1.5'>
                  <button className='border border-red-300 text-red-400 text-sm px-5 py-2 font-medium bg-red-50 whitespace-nowrap rounded-lg cursor-default w-full'>
                    Appointment Cancelled
                  </button>
                  <p className='text-xs text-gray-400 text-center'>
                    {item.cancelledBy === 'doctor' ? '⚠️ Cancelled by Doctor' : item.cancelledBy === 'admin' ? '⚠️ Cancelled by Admin' : 'Cancelled by You'}
                  </p>
                 
                </div>
              )}

              {/* Completed — show PDF download */}
              {!item.cancelled && item.isCompleted && (
                <div className='flex flex-col gap-2'>
                  <button className='border border-green-400 text-green-500 text-sm px-5 py-2 font-medium bg-green-50 whitespace-nowrap rounded-lg cursor-default'>
                    ✓ Completed
                  </button>
                  {item.prescriptionSent && (
                    <button onClick={() => downloadPDF(item._id)} className='border border-blue-400 text-white font-semibold bg-blue-500 text-sm px-5 py-2 font-medium rounded-lg hover:bg-blue-700 hover:text-white transition-all whitespace-nowrap'>
                      ⬇ Download PDF
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments