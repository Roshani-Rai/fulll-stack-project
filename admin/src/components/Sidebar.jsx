import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { useSocket } from '../context/SocketContext'   // ✅ ADD

const Sidebar = () => {
  const { atoken } = useContext(AdminContext)
  const { dtoken } = useContext(DoctorContext)
  const { notifications, markAsRead, clearAll, isConnected } = useSocket()  // ✅ ADD
  const [collapsed, setCollapsed] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)  // ✅ ADD
  const navigate = useNavigate()  // ✅ ADD

  const unread = notifications.filter(n => !n.read).length  // ✅ ADD

  const icons = {
    new_appointment:       '📅',
    appointment_cancelled: '❌',
    refund_requested:      '💰',
    payment_done:          '✅',
    new_message:           '💬',
  }

  const handleNotifClick = (notif) => {
    markAsRead(notif.id)
    setShowNotifs(false)
    setCollapsed(false)
    if (notif.type === 'new_appointment')       navigate('/doctor-appointment')
    if (notif.type === 'appointment_cancelled') navigate('/doctor-appointment')
    if (notif.type === 'refund_requested')      navigate('/doctor-appointment')
    if (notif.type === 'payment_done')          navigate('/doctor-dashboard')
    if (notif.type === 'new_message')           navigate('/doctor-appointment')
  }

  const adminNavItems = [
    { to: '/admin-dashboard', icon: assets.home_icon, label: 'Dashboard' },
    { to: '/all-appointment', icon: assets.appointment_icon, label: 'Appointments' },
    { to: '/add-doctor', icon: assets.add_icon, label: 'Add Doctor' },
    { to: '/doctor-list', icon: assets.people_icon, label: 'Doctor List' },
  ]

  const doctorNavItems = [
    { to: '/doctor-dashboard', icon: assets.home_icon, label: 'Dashboard' },
    { to: '/doctor-appointment', icon: assets.appointment_icon, label: 'Appointments' },
    { to: '/doctor-profile', icon: assets.people_icon, label: 'Profile' },
  ]

  if (!atoken && !dtoken) return null

  const isAdmin = !!atoken
  const navItems = isAdmin ? adminNavItems : doctorNavItems
  const panelLabel = isAdmin ? 'Admin Panel' : 'Doctor Panel'

  return (
    <div>
      {/* Mobile Toggle Button */}
      <button
        className='sm:hidden fixed top-4 left-2 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-sm'
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className='w-5 h-0.5 bg-gray-600 mb-1'></div>
        <div className='w-5 h-0.5 bg-gray-600 mb-1'></div>
        <div className='w-5 h-0.5 bg-gray-600'></div>

        {/* ✅ unread dot on hamburger */}
        {unread > 0 && dtoken && (
          <span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white'>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {collapsed && (
        <div
          className='sm:hidden fixed inset-0 bg-black/30 z-30'
          onClick={() => { setCollapsed(false); setShowNotifs(false) }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          min-h-screen bg-white border-r border-gray-100 shadow-sm
          fixed sm:sticky top-0 z-40
          transition-all duration-300 ease-in-out
          ${collapsed ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          w-60 flex flex-col
        `}
      >
        {/* Panel Title */}
        <div className='h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0'>
          <span className='text-primary font-semibold text-base tracking-tight'>
            {panelLabel}
          </span>
        </div>

        {/* Nav Items */}
        <ul className='flex flex-col gap-1 p-3 mt-2 flex-1'>
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={() => { setCollapsed(false); setShowNotifs(false) }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-4 border-transparent pl-3'
                  }`
                }
              >
                <img src={icon} alt={label} className='w-5 h-5 opacity-70 flex-shrink-0' />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}

          {/* ✅ Notifications row — doctor only, mobile only */}
          {dtoken && (
            <li className='sm:hidden mt-1'>
              <button
                onClick={() => setShowNotifs(o => !o)}
                className='w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-4 border-transparent pl-3'
              >
                {/* bell icon */}
                <div className='relative w-5 h-5 flex-shrink-0'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 opacity-70' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                  </svg>
                  {unread > 0 && (
                    <span className='absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white'>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>

                <span className='flex-1 text-left'>Notifications</span>

                {/* unread pill */}
                {unread > 0 && (
                  <span className='bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full'>
                    {unread}
                  </span>
                )}

                {/* chevron */}
                <svg xmlns='http://www.w3.org/2000/svg' className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showNotifs ? 'rotate-180' : ''}`} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {/* ✅ Inline notification panel — expands inside sidebar */}
              {showNotifs && (
                <div className='mx-2 mt-1 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden'>

                  {/* mini header */}
                  <div className='flex items-center justify-between px-3 py-2 border-b border-gray-100'>
                    <div className='flex items-center gap-1.5'>
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
                      <span className='text-xs text-gray-500'>{isConnected ? 'Live' : 'Offline'}</span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className='text-xs text-gray-400 hover:text-gray-600'
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* notification list */}
                  <div className='max-h-56 overflow-y-auto'>
                    {notifications.length === 0 ? (
                      <div className='flex flex-col items-center justify-center py-6 gap-1'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-gray-300' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                        </svg>
                        <p className='text-xs text-gray-400'>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer border-b border-gray-100 last:border-0 active:bg-gray-100 ${!n.read ? 'bg-blue-50' : ''}`}
                        >
                          <span className='text-base flex-shrink-0'>{icons[n.type] || '🔔'}</span>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-semibold text-gray-800 leading-tight'>{n.title}</p>
                            <p className='text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed'>{n.message}</p>
                          </div>
                          {!n.read && (
                            <span className='w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1' />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}
            </li>
          )}
        </ul>

        {/* ✅ Connection status — bottom of sidebar, doctor only */}
        {dtoken && (
          <div className='px-5 py-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0'>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
            <span className='text-xs text-gray-400'>{isConnected ? 'Socket connected' : 'Reconnecting…'}</span>
          </div>
        )}

      </div>
    </div>
  )
}

export default Sidebar