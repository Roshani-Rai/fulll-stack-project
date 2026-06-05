import { createContext,useState} from "react";
import {toast} from 'react-toastify'
import axios from 'axios'
export const AdminContext = createContext();

const AdminContextProvider = (props)=>{
    
  const [dash,setDash] = useState([])
   const [doctors,setDoctors]=useState([])
    const [appointments,setAppointments] = useState([])
    const [atoken,setAtoken]=useState(localStorage.getItem('atoken')?localStorage.getItem('atoken') : '')
    const backened_url = import.meta.env.VITE_BACKENED_URL
    //  console.log('Backend URL:', backened_url) 

    const deleteDoctor = async (docId) => {
    try {
    const { data } = await axios.post(backened_url + '/api/admin/delete-doctor', { docId }, { headers: { atoken } })
    if (data.success) {
      toast.success(data.message)
      getAllDoctors()
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.message)
  }
}

     const getAllDoctors = async()=>{
       try {
        const {data}=await axios.post(backened_url + '/api/admin/all-doctors',{},{headers:{atoken}})
        if(data.success){
          setDoctors(data.doctors)
        }
        else{
          toast.error(data.message)
        }
       } catch (error) {
         toast.error(error.message)
       }
     }


     const getDash = async()=>{
      try {
        const {data} = await axios.get(backened_url+'/api/admin/dashboard',{headers:{atoken}})
        if(data.success){
          setDash(data.dashData)
        }
        else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
     }


       const changeAvailability = async(docId)=>{
        try {
          const {data}= await axios.post(backened_url + '/api/admin/change-availability',{docId},{headers:{atoken}})
          if(data.success){
            toast.success(data.message)
             getAllDoctors()
          }
          else{
            toast.error(data.message)
          }
        } catch (error) {
          toast.error(error.message)
        }
       }

       const cancelAppointment =async(appointmentId)=>{
        try {
          const {data} = await axios.post(backened_url + '/api/admin/cancel-appointment',{appointmentId},{headers:{atoken}})
          if(data.success){
            toast.success(data.message)
            getAllAppointments()
          }
          else{
            toast.error(data.error)
          }
        } catch (error) {
          console.log(error.message)
          toast.error(error.message)
        }
       }

    const getAllAppointments = async()=>{
      try {
        const {data} = await axios.get(backened_url + '/api/admin/appointments' , {headers:{atoken}})
        if(data.success){
         setAppointments(data.appointments)
        }
        else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    const value={
      atoken ,setAtoken,
      backened_url,
      changeAvailability,
      deleteDoctor,
      doctors,getAllDoctors,
      appointments,setAppointments,
      getAllAppointments,
      cancelAppointment,
      dash,getDash,getDash,
    }
    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider