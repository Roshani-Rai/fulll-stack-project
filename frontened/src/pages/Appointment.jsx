import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoc from '../components/RelatedDoc';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, currency, backend_url, token, getDoctorData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const [docInfo, setDocInfo] = useState(null);
  const [docSlot, setDocSlot] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const submitRating = async () => {
    if (!token) return toast.warn('Login to rate doctor')
    if (rating === 0) return toast.warn('Please select a star rating')
    try {
      const { data } = await axios.post(
        backend_url + '/api/user/rate-doctor',
        { docId, rating, review },
        { headers: { token } }
      )
      if (data.success) {
        toast.success('Rating submitted! Thank you.')
        setRatingSubmitted(true)
        getDoctorData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }
    if (!slotTime) {
      toast.warn('Please select a time slot')
      return
    }
    try {
      const date = docSlot[slotIndex][0].datetime
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()
      const slotDate = day + "_" + month + "_" + year

      const { data } = await axios.post(
        backend_url + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        getDoctorData()
        navigate('/my-appointment')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const getAvailSlot = async () => {
    setDocSlot([]);
    let today = new Date();
    for (let i = 0; i < 7; i++) {
      let current = new Date(today);
      current.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === current.getDate()) {
        current.setHours(current.getHours() > 10 ? current.getHours() + 1 : 10)
        current.setMinutes(current.getMinutes() > 30 ? 30 : 0)
      } else {
        current.setHours(10)
        current.setMinutes(0)
      }

      let timeslot = [];
      while (current < endTime) {
        let formTime = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let day = current.getDate()
        let month = current.getMonth() + 1
        let year = current.getFullYear()
        const slotDate = day + "_" + month + "_" + year
        const slotTime = formTime

        const isSlotAvailable = docInfo.slots_booked[slotDate]
          ? !docInfo.slots_booked[slotDate].includes(slotTime)
          : true

        if (isSlotAvailable) {
          timeslot.push({
            datetime: new Date(current),
            time: formTime
          });
        }
        current.setMinutes(current.getMinutes() + 30);
      }
      setDocSlot(prev => ([...prev, timeslot]));
    }
  }

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId);
    setDocInfo(docInfo);
  }

  useEffect(() => {
    if (docInfo) getAvailSlot()
  }, [docInfo])

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId])

  if (!doctors.length) return (
    <div className='flex flex-col items-center justify-center py-32 text-center'>
      <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4'>
        <svg xmlns="http://www.w3.org/2000/svg" className='w-8 h-8 text-red-400' fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        </svg>
      </div>
      <p className='text-lg font-semibold text-gray-700'>Unable to load doctor info</p>
      <p className='text-sm text-gray-400 mt-1'>Server may be down. Please try again later.</p>
      <button onClick={() => navigate('/')}
        className='mt-5 px-6 py-2 bg-primary text-white rounded-full text-sm hover:opacity-90 transition'>
        Go Home
      </button>
    </div>
  )

  if (docInfo && !docInfo.available) return (
    <div className='flex flex-col items-center justify-center py-32 text-center'>
      <div className='w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4'>
        <svg xmlns="http://www.w3.org/2000/svg" className='w-8 h-8 text-yellow-400' fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.364 5.636l-1.414 1.414M12 8v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        </svg>
      </div>
      <img src={docInfo.image} alt={docInfo.name}
        className='w-20 h-20 rounded-full object-cover border-4 border-yellow-100 mb-3' />
      <p className='text-lg font-semibold text-gray-700'>Dr. {docInfo.name} is currently unavailable</p>
      <p className='text-sm text-gray-400 mt-1'>This doctor is not accepting appointments right now.</p>
      <button onClick={() => navigate('/doctors')}
        className='mt-5 px-6 py-2 bg-primary text-white rounded-full text-sm hover:opacity-90 transition'>
        Find Other Doctors
      </button>
    </div>
  )

  return docInfo && (
    <div className="flex flex-row justify-center">
      <div className='w-[76%]'>

        {/* ── Doctor Info Card ── */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className='mt-9 bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
          </div>
          <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-9'>
            <p className='flex items-center gap-2 text-3xl font-medium text-gray-900'>
              {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
            </p>
            <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
              <p>{docInfo.degree}  -  {docInfo.speciality}</p>
              <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
            </div>

            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
              <p className='text-gray-700 text-medium font-semibold mt-4'>
                Appointment fee: <span className='text-gray-600'>{currency} {docInfo.fees}</span>
              </p>

              {/* ✅ Average Rating */}
              <div className='flex items-center gap-2 mt-3'>
                <div className='flex items-center gap-0.5'>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={`text-lg ${star <= Math.round(docInfo.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
                <span className='text-sm font-semibold text-gray-700'>{docInfo.rating?.toFixed(1)}</span>
                <span className='text-sm text-gray-400'>({docInfo.totalRatings || 0} reviews)</span>
              </div>

              {/* ✅ Reviews List inside doctor card */}
              {docInfo.reviews?.length > 0 && (
                <div className='mt-4'>
                  <p className='text-sm font-semibold text-gray-700 mb-3'>Patient Reviews</p>
                  <div className='flex flex-col gap-3 max-h-64 overflow-y-auto pr-1'>
                    {docInfo.reviews.map((r, i) => (
                      <div key={i} className='border border-gray-100 rounded-xl px-4 py-3 bg-gray-50'>
                        <div className='flex items-center justify-between mb-1'>
                          <p className='text-sm font-medium text-gray-700'>{r.userName}</p>
                          <span className='text-yellow-400 text-sm'>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                        </div>
                        {r.review && <p className='text-xs text-gray-500 leading-relaxed'>{r.review}</p>}
                        <p className='text-xs text-gray-300 mt-1'>{new Date(r.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Booking Slots ── */}
        <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
          <p>Booking slots</p>
          <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
            {docSlot.length && docSlot.map((item, index) => (
              <div key={index} onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer 
                  ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))}
          </div>

          {docSlot.length && docSlot[slotIndex].length === 0
            ? <div className='flex items-center gap-2 mt-4 text-sm text-red-400'>
                <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4' fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
                No slots available for this day
              </div>
            : <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                {docSlot.length && docSlot[slotIndex].map((item, index) => (
                  <p key={index}
                    onClick={() => setSlotTime(item.time)}
                    className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer 
                      ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}>
                    {item.time.toLowerCase()}
                  </p>
                ))}
              </div>
          }
        </div>

        {/* ── Book Button ── */}
        <button
          onClick={bookAppointment}
          className='sm:text-sm mt-4 bg-primary text-white md:ml-72 lg:ml-72 text-sm font-light px-14 py-3 rounded-full'
        >
          Book an appointment
        </button>

        {/* ── Rate this Doctor ── */}
        <div className='sm:ml-72 sm:pl-4 mt-8'>
          <p className='font-medium text-gray-700 mb-3'>Rate this Doctor</p>

          {ratingSubmitted ? (
            <div className='flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-xl px-4 py-3 w-fit'>
              ✅ Thank you! Your rating has been submitted.
            </div>
          ) : (
            <div className='border border-gray-200 rounded-xl p-5 bg-white w-full max-w-md shadow-sm'>

              {/* Stars */}
              <div className='flex items-center gap-1 mb-4'>
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl cursor-pointer transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >★</span>
                ))}
                {rating > 0 && (
                  <span className='ml-2 text-sm text-gray-500'>{rating} / 5</span>
                )}
              </div>

              {/* Review textarea */}
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Share your experience (optional)..."
                rows={3}
                className='w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary resize-none text-gray-600'
              />

              {/* Submit button */}
              <button
                onClick={submitRating}
                className='mt-3 px-6 py-2 bg-primary text-white text-sm rounded-full hover:opacity-90 transition'
              >
                Submit Rating
              </button>
            </div>
          )}
        </div>

        <RelatedDoc docId={docId} speciality={docInfo.speciality} />

      </div>
    </div>
  )
}

export default Appointment