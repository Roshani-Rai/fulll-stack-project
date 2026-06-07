import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const DocAppoint = () => {
  const { dtoken, appointments, getAppointments, cancelAppointment, completeAppointment, backend_url } = useContext(DoctorContext)
  const navigate = useNavigate()

  const [openRx, setOpenRx] = useState(null)
  const [rxForms, setRxForms] = useState({})
  const [viewRx, setViewRx] = useState(null)
  const [rxData, setRxData] = useState({})

  useEffect(() => {
    if (dtoken) getAppointments()
  }, [dtoken])

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const d = slotDate.split('_')
    return d[0] + " " + months[Number(d[1])] + " " + d[2]
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    return new Date().getFullYear() - new Date(dob).getFullYear()
  }

  const isCloudinaryImage = (url) => url && url.includes('cloudinary.com')

  const addMedication = (id) => {
    setRxForms(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        medications: [...(prev[id]?.medications || []), { name: '', dosage: '', duration: '' }]
      }
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
    const incomplete = form.medications.some(m => !m.name.trim())
    if (incomplete)
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

  const toggleViewRx = async (id) => {
    if (viewRx === id) return setViewRx(null)
    if (rxData[id]) return setViewRx(id)
    try {
      const { data } = await axios.get(
        backend_url + `/api/doctor/get-prescription/${id}`,
        { headers: { dtoken } }
      )
      if (data.success) {
        setRxData(prev => ({ ...prev, [id]: data.prescription }))
        setViewRx(id)
      } else {
        toast.error(data.message)
      }
    } catch (e) {
      toast.error(e.message)
    }
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

        {appointments && appointments.map((item, index) => (
          <div key={index} className='border-b hover:bg-gray-50 transition-colors duration-200'>

            {/* ── main row ── */}
            <div className='flex flex-col gap-3 p-4 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_1fr_3fr_1fr_1fr] sm:items-center sm:py-3 sm:px-6 sm:gap-0'>

              <p className='hidden sm:block font-semibold text-gray-500'>{index + 1}</p>

              {/* Patient */}
              <div className='flex items-center gap-2'>
                {isCloudinaryImage(item.userData.image) ? (
                  <img src={item.userData.image} alt="" className='w-9 h-9 rounded-full object-cover flex-shrink-0' />
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

              {/* Payment — fixed */}
              <div className='flex sm:block items-center gap-2'>
                <p className='text-xs text-gray-400 font-semibold uppercase tracking-wide sm:hidden'>Payment:</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  item.payment
                    ? 'bg-green-50 border border-green-200 text-green-600'
                    : 'bg-yellow-50 border border-yellow-200 text-yellow-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.payment ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
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
                <p className='font-semibold text-gray-700'>₹{item.amount}</p>
              </div>

              {/* ── Action ── */}
              <div className='flex flex-wrap items-center gap-2'>

                {item.cancelled ? (
                  <div className='flex flex-col gap-1'>
                    <span className='text-center text-red-400 text-xs font-medium bg-red-50 border border-red-100 px-1 py-1 rounded-full'>
                      Cancelled
                    </span>
                    {item.payment && item.refundStatus === 'processed' && (
                      <span className='text-xs font-medium bg-green-50 border border-green-100 text-green-600 px-2 py-1 rounded-full whitespace-nowrap'>
                        ✅ Refund Processed
                      </span>
                    )}
                  </div>

                ) : item.isCompleted ? (
                  <div className='flex flex-col gap-1'>
                    <span className='text-center text-green-500 text-xs font-medium bg-green-50 border border-green-100 px-4 py-1 rounded-full'>
                      Completed
                    </span>
                    {item.prescriptionSent && (
                      <div className='flex items-center gap-1'>
                        <span className='text-xs font-medium bg-blue-50 border border-blue-100 text-blue-500 px-2 py-1 rounded-full whitespace-nowrap'>
                          ✓ Rx Sent
                        </span>
                        <button
                          onClick={() => toggleViewRx(item._id)}
                          className='text-xs p-1 rounded-lg text-indigo-500 hover:underline whitespace-nowrap'
                        >
                          {viewRx === item._id ? 'Hide' : 'View'}
                        </button>
                      </div>
                    )}
                  </div>

                ) : (
                  <>
                    {item.payment && !item.prescriptionSent && (
                      <button
                        onClick={() => {
                          setOpenRx(openRx === item._id ? null : item._id)
                          if (!rxForms[item._id]?.medications?.length) addMedication(item._id)
                        }}
                        className='text-xs px-3 py-1.5 rounded-full border border-indigo-400 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap'
                      >
                        {openRx === item._id ? 'Close ✕' : '+ Prescription'}
                      </button>
                    )}

                    {item.prescriptionSent && (
                      <div className='flex items-center gap-1'>
                        <span className='text-xs font-medium bg-blue-50 border border-blue-100 text-blue-500 px-2 py-1 rounded-full whitespace-nowrap'>
                          ✓ Rx Sent
                        </span>
                        <button
                          onClick={() => toggleViewRx(item._id)}
                          className='border border-blue-100 text-xs text-indigo-500 hover:underline whitespace-nowrap hover:bg-blue-200 transition-all duration-300'
                        >
                          {viewRx === item._id ? 'Hide' : 'View'}
                        </button>
                      </div>
                    )}

                    {!item.prescriptionSent && (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        title='Cancel'
                        className='w-8 h-8 flex items-center justify-center rounded-full border border-red-300 text-red-400 hover:bg-red-400 hover:text-white transition-all'
                      >
                        ✕
                      </button>
                    )}

                    <button
                      onClick={() => completeAppointment(item._id)}
                      title='Mark Complete'
                      className='w-8 h-8 flex items-center justify-center rounded-full border border-green-300 text-green-500 hover:bg-green-500 hover:text-white transition-all'
                    >
                      ✓
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ── view prescription panel ── */}
            {viewRx === item._id && rxData[item._id] && (
              <div className='mx-4 mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl'>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-sm font-semibold text-gray-700'>
                    📋 Prescription — {item.userData.name}
                  </p>
                  <button onClick={() => setViewRx(null)} className='text-gray-400 hover:text-gray-600 text-lg leading-none'>
                    ✕
                  </button>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full text-xs border-collapse'>
                    <thead>
                      <tr className='bg-blue-100 text-gray-600'>
                        <th className='text-left px-3 py-2 rounded-tl-lg'>#</th>
                        <th className='text-left px-3 py-2'>Medicine</th>
                        <th className='text-left px-3 py-2'>Dosage</th>
                        <th className='text-left px-3 py-2 rounded-tr-lg'>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rxData[item._id].medications.map((med, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'}>
                          <td className='px-3 py-2 text-gray-500'>{i + 1}</td>
                          <td className='px-3 py-2 font-medium text-gray-700'>{med.name}</td>
                          <td className='px-3 py-2 text-gray-600'>{med.dosage || '—'}</td>
                          <td className='px-3 py-2 text-gray-600'>{med.duration || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rxData[item._id].notes && (
                  <div className='mt-3 p-3 bg-white border border-blue-100 rounded-lg'>
                    <p className='text-xs font-semibold text-gray-500 mb-1'>Doctor's Notes</p>
                    <p className='text-xs text-gray-700'>{rxData[item._id].notes}</p>
                  </div>
                )}

                <p className='text-xs text-gray-400 mt-3'>
                  Sent on: {rxData[item._id].createdAt
                    ? new Date(rxData[item._id].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            )}

            {/* ── refund request banner ── */}
            {item.refundStatus === 'requested' && (
              <div className='mx-4 mb-3 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5'>
                <div>
                  <p className='text-xs font-semibold text-amber-700'>⚠️ Refund requested by patient</p>
                  <p className='text-xs text-amber-600 mt-0.5'>Patient cancelled this paid appointment and is requesting ₹{item.amount} refund.</p>
                </div>
                <button
                  onClick={() => acceptRefund(item._id)}
                  className='text-xs bg-green-500 text-white px-4 py-1.5 rounded-lg hover:bg-green-600 transition-all whitespace-nowrap font-medium'
                >
                  Accept Refund
                </button>
              </div>
            )}

            {!item.cancelled && item.refundStatus === 'processed' && (
              <div className='mx-4 mb-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-xs text-green-700 font-medium'>
                ✅ Refund of ₹{item.amount} approved and processed.
              </div>
            )}

            {/* ── prescription form ── */}
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
                        className='text-red-400 hover:text-red-600 text-lg leading-none px-1'
                        title='Remove'
                      >
                        ×
                      </button>
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
                    [item._id]: { ...prev[item._id], notes: e.target.value }
                  }))}
                  className='w-full border rounded-lg px-3 py-2 text-sm mb-3 resize-none bg-white focus:outline-none focus:border-indigo-400'
                  rows={2}
                />

                <div className='flex gap-2'>
                  <button
                    onClick={() => sendPrescription(item._id)}
                    className='bg-green-500 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-600 transition-all font-medium'
                  >
                    Send Prescription to Patient ✓
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

          </div>
        ))}

        {/* Empty state */}
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
