import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoc from '../components/RelatedDoc';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const {docId} = useParams();
  const navigate = useNavigate();
  const {doctors,currency,backend_url,token,getDoctorData} = useContext(AppContext);
  const daysOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  const [docInfo,setDocInfo]=useState(null);
  const [docSlot,setDocSlot]=useState([]);
  const [slotIndex,setSlotIndex]=useState(0);
  const [slotTime,setSlotTime]=useState('');

  const bookAppointment = async()=>{
    if(!token){
      toast.warn('Login to book appointment')
      return navigate('/login')
    }
    if(!slotTime){                                             // ✅ guard empty slotTime
      toast.warn('Please select a time slot')
      return
    }
    try {
      const date = docSlot[slotIndex][0].datetime
      let day = date.getDate()
      let month = date.getMonth()+1                           // ✅ was data.getMonth()
      let year = date.getFullYear()                           // ✅ was data.getFullYear()
      const slotDate = day+"_"+month+"_"+year
      const {data} = await axios.post(backend_url + '/api/user/book-appointment',{docId,slotDate,slotTime},{headers:{token}})
      if(data.success){
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

  const getAvailSlot = async()=>{
    setDocSlot([]);
    let today = new Date();
    for(let i=0;i<7;i++){
      let current = new Date(today);
      current.setDate(today.getDate()+i);

      let endTime = new Date();
      endTime.setDate(today.getDate()+i);
      endTime.setHours(21,0,0,0);

      if(today.getDate()===current.getDate()){
        current.setHours(current.getHours()>10 ? current.getHours()+1 : 10)
        current.setMinutes(current.getMinutes()>30 ? 30 : 0)
      } else {
        current.setHours(10)
        current.setMinutes(0)
      }

      let timeslot = [];
      while(current < endTime){
        let formTime = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let day = current.getDate()                          
        let month = current.getMonth()+1                    
        let year = current.getFullYear()                     
        const slotDate = day+"_"+month+"_"+year
        const slotTime = formTime

        const isSlotAvailable = docInfo.slots_booked[slotDate]
          ? !docInfo.slots_booked[slotDate].includes(slotTime)  
          : true

        if(isSlotAvailable){
          timeslot.push({
            datetime: new Date(current),
            time: formTime
          });
        }
        current.setMinutes(current.getMinutes()+30);
      }
      setDocSlot(prev => ([...prev, timeslot]));
    }
  }

  const fetchDocInfo = async()=>{
    const docInfo = doctors.find(doc=>doc._id===docId);
    setDocInfo(docInfo);
  }

  useEffect(()=>{
    if(docInfo) getAvailSlot()                               // ✅ guard against null docInfo
  },[docInfo])

  useEffect(()=>{
    console.log(docSlot)
  },[docSlot])

  useEffect(()=>{
    fetchDocInfo();
  },[doctors,docId])

  return docInfo && (
    <div className="flex flex-row justify-center">
      <div className='w-[76%]'>
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
            </div>
          </div>
        </div>

        <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
          <p>Booking slots</p>
          <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
            {docSlot.length && docSlot.map((item,index)=>(
              <div key={index} onClick={()=>setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex===index ? 'bg-primary text-white' : 'border border-gray-200'}`}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
            {docSlot.length && docSlot[slotIndex].map((item,index)=>(
              <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time===slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={index}>
                {item.time.toLowerCase()}
              </p>
            ))}
          </div>
        </div>

        <button onClick={bookAppointment} className='sm:text-sm mt-4 bg-primary text-white md:ml-72 lg:ml-72 text-sm font-light px-14 py-3 rounded-full'>
          Book an appointment
        </button>
        <RelatedDoc docId={docId} speciality={docInfo.speciality} />
      </div>
    </div>
  )
}

export default Appointment