import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  const { atoken } = useContext(AdminContext)
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { to: '/admin-dashboard', icon: assets.home_icon, label: 'Dashboard' },
    { to: '/all-appointment', icon: assets.appointment_icon, label: 'Appointments' },
    { to: '/add-doctor', icon: assets.add_icon, label: 'Add Doctor' },
    { to: '/doctor-list', icon: assets.people_icon, label: 'Doctor List' },
  ]

  if (!atoken) return null

  return (
    <>
      {/* Mobile toggle button */}
      <button
  className={`sm:hidden fixed top-11.1 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow-sm ${collapsed ? 'top-4 ml-1' : ''}`}
  onClick={() => setCollapsed(!collapsed)}
>
        <div className='w-5 h-0.5 bg-gray-600 mb-1'></div>
        <div className='w-5 h-0.5 bg-gray-600 mb-1'></div>
        <div className='w-5 h-0.5 bg-gray-600'></div>
      </button>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          className='sm:hidden fixed inset-0 bg-black/30 z-30'
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          min-h-screen bg-white border-r border-gray-100 shadow-sm
          fixed sm:sticky top-0 z-40
          transition-all duration-300 ease-in-out
          ${collapsed ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          w-60 sm:w-60
        `}
      >
        {/* Logo area */}
        <div className='h-16 flex items-center px-5 border-b border-gray-100'>
          <span className={`text-primary font-semibold text-base tracking-tight ${collapsed ?'ml-8':''}`}>Admin Panel</span>
        </div>

        {/* Nav items */}
        <ul className='flex flex-col gap-1 p-3 mt-2'>
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={() => setCollapsed(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-4 border-transparent pl-3'
                  }`
                }
              >
                <img
                  src={icon}
                  alt={label}
                  className='w-5 h-5 opacity-70 flex-shrink-0'
                />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Sidebar