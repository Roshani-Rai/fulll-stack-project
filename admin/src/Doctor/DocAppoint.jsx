import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const DocAppoint = () => {
  const {
    dtoken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    backend_url,
  } = useContext(DoctorContext)

  const navigate = useNavigate()

  const [openRx, setOpenRx]         = useState(null)   
  const [viewRx, setViewRx]         = useState(null)   
  const [rxForms, setRxForms]       = useState({})

  useEffect(() => {
    if (dtoken) getAppointments()
  }, [dtoken])

  // ── date helpers ──────────────────────────────────────────────────────────
  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const d = slotDate.split('_')
    return d[0] + ' ' + months[Number(d[1])] + ' ' + d[2]
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    return new Date().getFullYear() - new Date(dob).getFullYear()
  }

  const isCloudinaryImage = (url) => url && url.includes('cloudinary.com')

  // ── prescription helpers ──────────────────────────────────────────────────
  const addMedication = (id) => {
    setRxForms(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        medications: [...(prev[id]?.medications || []), { name: '', dosage: '', duration: '' }],
      },
    }))
  }

  const removeMedication = (id, i) => {
    setRxForms(prev => {
      const meds = [...(prev[id]?.medications || [])]
      meds.splice(i, 1)
      return { ...prev, [id]: { ...prev[id], medications: meds } }
    })
  }

  const updateMed = (id, i, field, val) => {
    setRxForms(prev => {
      const meds = [...(prev[id]?.medications || [])]
      meds[i] = { ...meds[i], [field]: val }
      return { ...prev, [id]: { ...prev[id], medications: meds } }
    })
  }

  const sendPrescription = async (id) => {
    const form = rxForms[id]
    if (!form?.medications?.length)
      return toast.error('Add at least one medication')
    if (form.medications.some(m => !m.name.trim()))
      return toast.error('Please fill medicine name for all entries')

    try {
      const { data } = await axios.post(
        backend_url + '/api/doctor/add-prescription',
        { appointmentId: id, medications: form.medications, notes: form.notes || '' },
        { headers: { dtoken } }
      )
      if (data.success) {
        toast.success(data.message)
        setOpenRx(null)
        getAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  const acceptRefund = async (id) => {
    try {
      const { data } = await axios.post(
        backend_url + '/api/doctor/accept-refund',
        { appointmentId: id },
        { headers: { dtoken } }
      )
      if (data.success) {
        toast.success(data.message)
        getAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  // ── toggle helpers (close others when opening one) ────────────────────────
  const toggleRxForm = (id) => {
    const next = openRx === id ? null : id
    setOpenRx(next)
    setViewRx(null)
    if (next && !rxForms[id]?.medications?.length) addMedication(id)
  }

  const toggleViewRx = (id) => {
    setViewRx(viewRx === id ? null : id)
    setOpenRx(null)
  }

  return (
    <div className='w-full max-w-6xl m-3 sm:m-5'>
      <p className='mb-3 text-lg font-medium'>
        All <span className='text-primary'>Appointments</span>
      </p>

      <div className='bg-white border rounded-xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-auto'>

        {/* ── desktop header ── */}
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_1fr_3fr_1fr_1.8fr] py-3 px-6 border-b bg-gray-50 font-semibold text-gray-600'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments && appointments.map((item, index) => (
          <div key={index} className='border-b hover:bg-gray-50 transition-colors duration-200'>

            {/* ── refund NOTIFICATION banner (top, eye-catching) ── */}
            {item.refundStatus === 'requested' && !item.isCompleted && (
              <div className='mx-4 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3'>
                <div className='flex items-start gap-2'>
                  {/* animated bell dot */}
                  <span className='relative flex h-5 w-5 mt-0.5 flex-shrink-0'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-5 w-5 bg-amber-500 items-center justify-center text-white text-xs'>!</span>
                  </span>
                  <div>
                    <p className='text-xs font-bold text-amber-800'>Refund Request — Action Required</p>
                    <p className='text-xs text-amber-700 mt-0.5'>
                      <span className='font-semibold'>{item.userData.name}</span> cancelled this paid appointment
                      and is requesting a refund of <span className='font-semibold'>₹{item.amount}</span>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => acceptRefund(item._id)}
                  className='text-xs bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all whitespace-nowrap font-semibold flex-shrink-0'
                >
                  ✓ Accept & Process Refund
                </button>
              </div>
            )}

            

            {/* ── main row ── */}
            <div className='flex flex-col gap-3 p-4 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_1fr_3fr_1fr_1.8fr] sm:items-center sm:py-3 sm:px-6 sm:gap-0'>

              {/* # */}
              <p className='hidden sm:block font-semibold text-gray-500'>{index + 1}</p>

              {/* Patient */}
              <div className='flex items-center gap-2'>
                {isCloudinaryImage(item.userData.image) ? (
                  <img src={item.userData.image} alt='' className='w-9 h-9 rounded-full object-cover flex-shrink-0' />
                ) : (
                  <div className='w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0'>
                    <span className='text-white text-sm font-semibold'>
                      {item.userData.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className='font-medium text-gray-700'>{item.userData.name}</p>
                  <p className='text-xs text-gray-400 sm:hidden'>Age: {calculateAge(item.userData.dob)}</p>
                </div>
              </div>

              {/* Payment badge */}
              <div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  item.payment
                    ? 'bg-green-50 border border-green-100 text-green-500'
                    : 'bg-yellow-50 border border-yellow-100 text-yellow-600'
                }`}>
                  {item.payment ? 'Online' : 'Cash'}
                </span>
              </div>

              {/* Age */}
              <p className='hidden sm:block text-gray-600'>{calculateAge(item.userData.dob)}</p>

              {/* Date & Time */}
              <div>
                <p className='text-xs text-gray-400 sm:hidden font-semibold uppercase tracking-wide mb-0.5'>Date & Time</p>
                <p className='text-gray-600'>{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>

              {/* Fees */}
              <div>
                <p className='text-xs text-gray-400 sm:hidden font-semibold uppercase tracking-wide mb-0.5'>Fees</p>
                <p className='font-semibold text-gray-600'>₹{item.amount}</p>
              </div>

              {/* ── ACTION COLUMN ── */}
              <div className='flex flex-wrap items-center gap-1.5'>

                {/* ── CANCELLED state ── */}
                {item.cancelled ? (
                  <div className='flex flex-col gap-1'>
                    <span className='text-red-400 text-xs font-medium bg-red-50 px-2 py-1 rounded-full'>
                      Cancelled
                    </span>
                    {/* view prescription even after cancel (if sent before cancel — edge case) */}
                    {item.prescriptionSent && (
                      <button
                        onClick={() => toggleViewRx(item._id)}
                        className='text-xs px-2 py-1 rounded-full border border-indigo-300 text-indigo-500 hover:bg-indigo-50 transition-all whitespace-nowrap'
                      >
                        {viewRx === item._id ? 'Hide Rx' : 'View Rx'}
                      </button>
                    )}
                  </div>

                ) : item.isCompleted ? (
                  // ── COMPLETED state ──
                  <div className='flex flex-wrap gap-1.5 items-center'>
                    <span className='text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded-full'>
                      Completed
                    </span>
                    {item.prescriptionSent && (
                      <button
                        onClick={() => toggleViewRx(item._id)}
                        className='text-xs px-2 py-1 rounded-full border border-indigo-300 text-indigo-500 hover:bg-indigo-50 transition-all whitespace-nowrap'
                      >
                        {viewRx === item._id ? 'Hide Prescription' : 'View Prescription'}
                      </button>
                    )}
                  </div>

                ) : (
                  // ── ACTIVE appointment ──
                  <>
                    {/* JOIN consultation — only if paid AND no refund requested */}
                    {item.payment && item.refundStatus !== 'requested' && item.refundStatus !== 'processed' && (
                      <button
                        onClick={() => navigate(`/doctor-chat/${item._id}`)}
                        className='text-xs px-2.5 py-1.5 rounded-full border border-blue-400 text-blue-500 hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap'
                      >
                        💬 Chat
                      </button>
                    )}

                    {/* ADD PRESCRIPTION — paid, no refund, not sent yet */}
                    {item.payment && !item.prescriptionSent
                      && item.refundStatus !== 'requested'
                      && item.refundStatus !== 'processed' && (
                      <button
                        onClick={() => toggleRxForm(item._id)}
                        className='text-xs px-2.5 py-1.5 rounded-full border border-indigo-400 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap'
                      >
                        {openRx === item._id ? 'Close ✕' : 'Add Prescription'}
                      </button>
                    )}

                    {/* PRESCRIPTION SENT label + view button */}
                    {item.prescriptionSent && (
                      <button
                        onClick={() => toggleViewRx(item._id)}
                        className='text-xs px-2.5 py-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all whitespace-nowrap'
                      >
                        {viewRx === item._id ? 'Hide Prescription ✕' : '✓ View Prescription'}
                      </button>
                    )}

                    {/* CANCEL — hide after prescription sent or refund in progress */}
                    {!item.prescriptionSent
                      && item.refundStatus !== 'requested'
                      && item.refundStatus !== 'processed' && (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        title='Cancel appointment'
                        className='w-7 h-7 flex items-center justify-center rounded-full border border-red-300 text-red-400 hover:bg-red-400 hover:text-white transition-all text-xs'
                      >
                        ✕
                      </button>
                    )}

                    {/* COMPLETE — available unless refund in progress */}
                    {item.refundStatus !== 'requested' && item.refundStatus !== 'processed' && (
                      <button
                        onClick={() => completeAppointment(item._id)}
                        title='Mark complete'
                        className='w-7 h-7 flex items-center justify-center rounded-full border border-green-300 text-green-500 hover:bg-green-500 hover:text-white transition-all text-xs'
                      >
                        ✓
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ── VIEW PRESCRIPTION panel ── */}
            {viewRx === item._id && item.prescription && (
              <div className='mx-4 mb-4 p-4 bg-white border border-indigo-100 rounded-xl shadow-sm'>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-sm font-bold text-gray-700'>
                    ℞ Prescription — {item.userData.name}
                  </p>
                  <button
                    onClick={() => setViewRx(null)}
                    className='text-gray-400 hover:text-gray-600 text-lg leading-none'
                  >×</button>
                </div>

                <div className='space-y-1.5 mb-3'>
                  {item.prescription.medications?.map((med, i) => (
                    <div key={i} className='flex flex-wrap gap-3 bg-indigo-50 rounded-lg px-3 py-2 text-xs text-gray-700'>
                      <span className='font-semibold text-indigo-700'>{i + 1}. {med.name}</span>
                      {med.dosage   && <span className='text-gray-500'>Dosage: <span className='font-medium text-gray-700'>{med.dosage}</span></span>}
                      {med.duration && <span className='text-gray-500'>Duration: <span className='font-medium text-gray-700'>{med.duration}</span></span>}
                    </div>
                  ))}
                </div>

                {item.prescription.notes && (
                  <div className='bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600'>
                    <span className='font-semibold text-gray-700'>Notes: </span>
                    {item.prescription.notes}
                  </div>
                )}
              </div>
            )}

            {/* ── WRITE PRESCRIPTION form ── */}
            {openRx === item._id && (
              <div className='mx-4 mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl'>
                <p className='text-sm font-semibold text-gray-700 mb-3'>
                  Write Prescription for {item.userData.name}
                </p>

                {(rxForms[item._id]?.medications || []).map((med, i) => (
                  <div key={i} className='flex gap-2 mb-2 flex-wrap items-center'>
                    <input
                      placeholder='Medicine name *'
                      value={med.name}
                      onChange={e => updateMed(item._id, i, 'name', e.target.value)}
                      className='border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px] bg-white focus:outline-none focus:border-indigo-400'
                    />
                    <input
                      placeholder='Dosage e.g. 500mg'
                      value={med.dosage}
                      onChange={e => updateMed(item._id, i, 'dosage', e.target.value)}
                      className='border rounded-lg px-3 py-1.5 text-sm w-32 bg-white focus:outline-none focus:border-indigo-400'
                    />
                    <input
                      placeholder='Duration e.g. 5 days'
                      value={med.duration}
                      onChange={e => updateMed(item._id, i, 'duration', e.target.value)}
                      className='border rounded-lg px-3 py-1.5 text-sm w-32 bg-white focus:outline-none focus:border-indigo-400'
                    />
                    {(rxForms[item._id]?.medications || []).length > 1 && (
                      <button
                        onClick={() => removeMedication(item._id, i)}
                        className='text-red-400 hover:text-red-600 text-xl leading-none px-1'
                        title='Remove'
                      >×</button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addMedication(item._id)}
                  className='text-xs text-indigo-500 hover:text-indigo-700 hover:underline mb-3 block font-medium'
                >
                  + Add another medicine
                </button>

                <textarea
                  placeholder='Doctor notes / advice (optional)'
                  value={rxForms[item._id]?.notes || ''}
                  onChange={e => setRxForms(prev => ({
                    ...prev,
                    [item._id]: { ...prev[item._id], notes: e.target.value },
                  }))}
                  className='w-full border rounded-lg px-3 py-2 text-sm mb-3 resize-none bg-white focus:outline-none focus:border-indigo-400'
                  rows={2}
                />

                <div className='flex gap-2'>
                  <button
                    onClick={() => sendPrescription(item._id)}
                    className='bg-green-500 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-600 transition-all font-medium'
                  >
                    Send to Patient ✓
                  </button>
                  <button
                    onClick={() => setOpenRx(null)}
                    className='border border-gray-300 text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-all'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}


                   {/* refund processed confirmation */}
            {item.refundStatus === 'processed' && (
              <div className='mx-4 mb-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-xs text-green-700 font-medium flex items-center gap-2'>
                <span>✅</span>
                <span>Refund of ₹{item.amount} approved and processed for {item.userData.name}.</span>
              </div>
            )}

          </div>
        ))}



        {/* ── empty state ── */}
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