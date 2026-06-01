import { createContext,useState} from "react";
import {toast} from 'react-toastify'
import axios from 'axios'
export const AdminContext = createContext();

const AdminContextProvider = (props)=>{
    
   const [doctors,setDoctors]=useState([])
    const [atoken,setAtoken]=useState(localStorage.getItem('atoken')?localStorage.getItem('atoken') : '')
    const backened_url = import.meta.env.VITE_BACKENED_URL
      console.log('Backend URL:', backened_url) 

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

    const value={
      atoken ,setAtoken,
      backened_url,
      changeAvailability,
      doctors,getAllDoctors,
    }
    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider