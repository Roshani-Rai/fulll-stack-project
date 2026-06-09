import { createContext } from 'react'
import axios from 'axios'
import { useState } from 'react';
import { useEffect } from 'react';
import {toast} from 'react-toastify'


export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const currency = '$';
    const backend_url = import.meta.env.VITE_BACKEND_URL
    const [doctors,setDoctors] = useState([])
     const [token,setToken]=useState(localStorage.getItem('token')?localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(null)

    const getDoctorData = async()=>{
        try {
           const {data} = await axios.get(backend_url + '/api/doctor/list')
           if(data.success){
               setDoctors(data.doctors.filter(doc => doc.available === true))
           }
           else{
            toast.error(data.message)
           }
        } catch (error) {
            toast.error(error.message)
        }
    }

   const loadUserProfile = async () => {
  try {
    const { data } = await axios.get(backend_url + '/api/user/get-profile', { headers: { token } })
    if (data.success) {
      setUserData(data.userData)  
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.message)
  }
}

useEffect(() => {
  if (token) loadUserProfile()
  else setUserData(null) 
}, [token])

    useEffect(()=>{
     if(token) loadUserProfile()
        else setUserData(false)
    },[token])

    const value = {
        doctors , currency,
        backend_url,
        getDoctorData,
        token , setToken,
         userData, setUserData, loadUserProfile
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;