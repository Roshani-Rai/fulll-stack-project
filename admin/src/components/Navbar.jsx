import React, { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { useSocket } from '../context/SocketContext'   // ✅ ADD

const icons = {
  new_appointment:       '📅',
  appointment_cancelled: '❌',
  refund_requested:      '💰',
  payment_done:          '✅',
  new_message:           '💬',
}

const Navbar = () => {
  const { atoken, setAtoken } = useContext(AdminContext)
  const { dtoken, setDtoken } = useContext(DoctorContext)
  const { notifications, markAsRead, clearAll, isConnected } = useSocket()  // ✅ ADD
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const unread = notifications.filter(n => !n.read).length
  const isAdmin = Boolean(atoken)

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = (notif) => {
    markAsRead(notif.id)
    setOpen(false)
    if (notif.type === 'new_appointment')       navigate('/doctor-appointment')
    if (notif.type === 'appointment_cancelled') navigate('/doctor-appointment')
    if (notif.type === 'refund_requested')      navigate('/doctor-appointment')
    if (notif.type === 'payment_done')          navigate('/doctor-dashboard')
    if (notif.type === 'new_message')           navigate('/doctor-appointment')
  }

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

      {/* Right — bell (doctor only) + logout */}
      <div className='flex items-center gap-3'>

        {/* ✅ Bell — only for doctor, not admin */}
        {dtoken && (
          <div className='relative' ref={dropdownRef}>

            {/* Bell button */}
            <button
              onClick={() => setOpen(o => !o)}
              className='relative flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200'
              aria-label='Notifications'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-gray-500' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
              </svg>

              {/* unread badge */}
              {unread > 0 && (
                <span className='absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white'>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}

              {/* connection dot */}
              <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white ${isConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
            </button>

            {/* Dropdown */}
            {open && (
              <div className='absolute right-0 top-12 w-72 sm:w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden'>

                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-gray-800'>Notifications</span>
                    {unread > 0 && (
                      <span className='bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full'>
                        {unread} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className='text-xs text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className='max-h-72 overflow-y-auto'>
                  {notifications.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-10 gap-2'>
                      <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-gray-300' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                      </svg>
                      <p className='text-sm text-gray-400'>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50 hover:bg-blue-50/80' : ''}`}
                      >
                        <span className='text-lg flex-shrink-0 mt-0.5'>{icons[n.type] || '🔔'}</span>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-800 leading-tight'>{n.title}</p>
                          <p className='text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2'>{n.message}</p>
                        </div>
                        {!n.read && (
                          <span className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5' />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className='px-4 py-2.5 border-t border-gray-100 bg-gray-50'>
                    <button
                      onClick={() => { navigate('/doctor-appointment'); setOpen(false) }}
                      className='text-xs text-blue-600 hover:text-blue-700 font-medium'
                    >
                      View all appointments →
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* Logout — unchanged */}
        <button
          onClick={logout}
          className='flex items-center gap-1.5 bg-primary text-white text-xs sm:text-sm font-semibold px-4 sm:px-8 py-2 rounded-full hover:opacity-90 hover:scale-105 transition-all duration-200'
        >
          <span className='hidden sm:inline'>Logout</span>
          <span className='sm:hidden'>⏻</span>
        </button>

      </div>
    </div>
  )
}

export default Navbar