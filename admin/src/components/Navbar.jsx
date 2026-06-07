import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {
  const { atoken, setAtoken } = useContext(AdminContext)
  const { dtoken, setDtoken } = useContext(DoctorContext)
  const navigate = useNavigate()

  const logout = () => {
    if (atoken) {
      setAtoken('')
      localStorage.removeItem('atoken')
    } else {
      setDtoken('')
      localStorage.removeItem('dtoken')
    }
    navigate('/')
  }

  const isAdmin = Boolean(atoken)

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white shadow-sm'>

      {/* Left — logo + role badge */}
      <div className='flex items-center gap-2 sm:gap-3'>
        <img
          className='w-28 sm:w-36 cursor-pointer'
          src={assets.admin_logo}
          alt="logo"
        />
        <span className={`text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium border ${
          isAdmin
            ? 'border-indigo-400 text-indigo-600 bg-indigo-50'
            : 'border-green-400 text-green-600 bg-green-50'
        }`}>
          {isAdmin ? '🛡 Admin' : '🩺 Doctor'}
        </span>
      </div>

      {/* Right — logout */}
      <button
        onClick={logout}
        className='flex items-center gap-1.5 bg-primary text-white text-xs sm:text-sm font-semibold px-4 sm:px-8 py-2 rounded-full hover:opacity-90 hover:scale-105 transition-all duration-200'
      >
        <span className='hidden sm:inline'>Logout</span>
        <span className='sm:hidden'>⏻</span>
      </button>

    </div>
  )
}

export default Navbar