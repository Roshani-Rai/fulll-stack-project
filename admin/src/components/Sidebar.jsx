import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'

const Sidebar = () => {
  const { atoken } = useContext(AdminContext)
  const { dtoken } = useContext(DoctorContext)
  const [collapsed, setCollapsed] = useState(false)

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

  // ✅ Decide which nav to show
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
      </button>

      {/* Mobile Overlay */}
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
          w-60
        `}
      >

        {/* Panel Title */}
        <div className='h-16 flex items-center px-5 border-b border-gray-100'>
          <span className='text-primary font-semibold text-base tracking-tight'>
            {panelLabel}  {/* ✅ shows correct panel name */}
          </span>
        </div>

        {/* Nav Items */}
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
    </div>
  )
}

export default Sidebar