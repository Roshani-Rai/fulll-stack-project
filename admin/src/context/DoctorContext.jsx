import { useState } from 'react';
import {createContext} from 'react'
import {toast} from 'react-toastify'
import axios from 'axios'


export const DoctorContext = createContext();

 const DoctorContextProvider = (props)=>{
    const backend_url = import.meta.env.VITE_BACKENED_URL
   const [dtoken, setDtoken] = useState(
  localStorage.getItem('dtoken') ? localStorage.getItem('dtoken') : ''
)
  const [profileData, setProfileData] = useState(null)
  const [appointments,setAppointments] = useState([])
  const [dashData,setDashData] = useState([])

  const getAppointments = async()=>{
    try {
       const {data} =  await axios.get(backend_url + '/api/doctor/appointments' ,{headers:{dtoken}}) 
       if(data.success){
        setAppointments(data.appointments.reverse())
       }
       else{
        toast.error(data.message)
       }
    } catch (error) {
        console.log(error)
        toast.error(error.message)
    }
 }
  
  const getProfileData = async () => {
    try {
      const { data } = await axios.get(backend_url + '/api/doctor/profile', { headers: { dtoken } })
      if (data.success) {
        setProfileData(data.profileData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

   const completeAppointment = async(appointmentId)=>{
    try {
        const {data} = await axios.post(backend_url + '/api/doctor/complete-appointment' ,{appointmentId} ,{headers:{dtoken}})
        if(data.success){
            toast.success(data.message)
            await getAppointments()
            getDash()
        }
        else toast.error(data.error)
    } catch (error) {
         console.log(error)
        toast.error(error.message)
    }
   }


    const cancelAppointment = async(appointmentId)=>{
    try {
        const {data} = await axios.post(backend_url + '/api/doctor/cancel-appointment' ,{appointmentId} ,{headers:{dtoken}})
        if(data.success){
            toast.success(data.message)
            await getAppointments()
            getDash()
        }
        else toast.error(data.error)
    } catch (error) {
         console.log(error)
        toast.error(error.message)
    }
   }

   const getDash = async()=>{
    try {
       const {data} = await axios.get(backend_url + '/api/doctor/dashboard' ,{headers:{dtoken}}) 
       if(data.success){
        setDashData(data.dashData)
       }
       else{
        toast.error(data.message)
       }
    } catch (error) {
          console.log(error)
        toast.error(error.message)
    }
   }

    const value ={
      dtoken , setDtoken , 
      backend_url,
      setAppointments,appointments,
      getAppointments,
      cancelAppointment,
      completeAppointment,
      dashData,setDashData,getDash,
       profileData, setProfileData, getProfileData,
    }
    return(
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider