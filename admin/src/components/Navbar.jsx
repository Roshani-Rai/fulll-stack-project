import React ,{useContext} from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import {useNavigate} from 'react-router-dom'

const Navbar = () => {

    const {atoken,setAtoken} = useContext(AdminContext)
    const navigate = useNavigate()

    const logout=()=>{
        atoken && setAtoken('')
        atoken && localStorage.removeItem('aToken')
    }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-sm'>
        <img className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
        <p className='text-sm px-5 py-2 border rounded-full border-gray-500 text-gray-600'>{atoken ? 'Admin' : 'Doctor'}</p>
      </div>
      <button className='bg-primary font-semibold text-white text-sm px-10 py-2 rounded-full hover:scale-105  hover:transition-all duration-400' onClick={logout}>Logout</button>
    </div>
  )
}

export default Navbar
