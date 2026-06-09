import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import AIChatModal from './AIChatModal';
import NotificationBell from './NotificationBail.jsx';
import { useSocket } from '../context/SocketContext'


const Navbar = () => {

  const { notifications } = useSocket()
  const mobileUnread = notifications.filter(n => !n.read).length

  const MobileBellBadge = () => mobileUnread > 0 ? (
    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-semibold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 border-2 border-white z-10'>
      {mobileUnread > 9 ? '9+' : mobileUnread}
    </span>
  ) : null

  const MobileUnreadCount = () => mobileUnread > 0 ? (
    <span className='bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full'>
      {mobileUnread}
    </span>
  ) : null

  const { token, setToken, user } = useContext(AppContext)

  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const profileImage = user && user.image && user.image.startsWith('http')
    ? user.image
    : assets.upload_area

  const logout = () => {
    setToken(false)
    localStorage.removeItem('token')
  }

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-primary font-semibold border-b-2 border-primary pb-0.5'
      : 'text-gray-600 hover:text-primary transition-colors duration-200'

  return (
    <div className="flex flex-row mt-6 justify-center">
      <div className='w-[90%] md:w-[76%] flex items-center justify-between px-6 py-4 shadow-md rounded-xl'>

        <img src={assets.logo} alt="logo" className='h-8' />

        <ul className='hidden md:flex items-center gap-6 font-medium'>
          <li><NavLink to='/' className={navLinkClass}>Home</NavLink></li>
          <li><NavLink to='/doctor' className={navLinkClass}>All Doctors</NavLink></li>
          <li><NavLink to='/about' className={navLinkClass}>About</NavLink></li>
          <li><NavLink to='/contact' className={navLinkClass}>Contact</NavLink></li>
        </ul>

        <div className='flex items-center gap-4'>

          {/* AI Chat — desktop only */}
          <button
            onClick={() => setShowChat(true)}
            title="AI Health Assistant"
            className='hidden md:flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-blue-200 hover:scale-105'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>AI Assistant</span>
          </button>

          {/* Desktop: Notification Bell — only when logged in */}
          {token && (
            <div className='hidden md:flex'>
              <NotificationBell />
            </div>
          )}

          {token ? (
            <div className="flex flex-row items-center gap-2 cursor-pointer group relative">
              <img className='w-8 h-8 rounded-full object-cover' src={profileImage} alt="profile" />
              <img className='w-2.5' src={assets.dropdown_icon} alt="" />
              <div className='absolute top-full right-0 pt-2 text-sm font-medium text-gray-700 z-20 hidden group-hover:block'>
                <div className='min-w-48 bg-gray-200 border border-gray-100 shadow-lg rounded-xl flex flex-col gap-1 p-2'>
                  <p
                    onClick={() => navigate('/my-profile')}
                    className='px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-black cursor-pointer transition-colors'>
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate('/my-appointment')}
                    className='px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-black cursor-pointer transition-colors'>
                    My Appointments
                  </p>
                  <p
                    onClick={logout}
                    className='px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors'>
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className='hidden md:block bg-primary text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-blue-600 hover:scale-105'>
              Create Account
            </button>
          )}

          {/* Hamburger - mobile only */}
          <img
            onClick={() => setShowMenu(true)}
            className='w-6 cursor-pointer md:hidden'
            src={assets.menu_icon}
            alt="menu"
          />
        </div>
      </div>

      {/* ── Mobile Slide-in Sidebar ── */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Sidebar header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-gray-100'>
          <img src={assets.logo} alt="logo" className='h-7' />
          <img
            onClick={() => setShowMenu(false)}
            src={assets.cross_icon}
            alt="close"
            className='w-5 cursor-pointer hover:opacity-70 transition-opacity'
          />
        </div>

        {/* Nav links */}
        <ul className='flex flex-col gap-1 px-4 py-6'>
          {[
            { to: '/', label: 'Home' },
            { to: '/doctor', label: 'All Doctors' },
            { to: '/about', label: 'About' },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
                  ${isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── BOTTOM SECTION ── */}
        <div className='mt-auto px-4 pb-8 flex flex-col gap-3'>

          <div className='border-t border-gray-100 mb-1' />

          {/* AI Health Assistant */}
          <button
            onClick={() => { setShowMenu(false); setShowChat(true); }}
            className='w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all duration-200 group'
          >
            <div className='w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200'>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className='text-left'>
              <p className='text-sm font-semibold text-blue-700'>AI Health Assistant</p>
              <p className='text-xs text-blue-400'>Ask symptoms, get guidance</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-auto text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Notifications row — only when logged in */}
          {token && (
            <button
              onClick={() => setShowMenu(false)}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer'
            >
              {/* Bell icon with badge */}
              <div className='relative w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0'>
                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-gray-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                </svg>
                <MobileBellBadge />
              </div>

              <div className='text-left flex-1'>
                <p className='text-sm font-semibold text-gray-700'>Notifications</p>
                <p className='text-xs text-gray-400'>Appointments, prescriptions & more</p>
              </div>
              <MobileUnreadCount />
            </button>
          )}

          {/* Profile / Login */}
          {token ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200">
              <img className='w-9 h-9 rounded-full object-cover flex-shrink-0' src={profileImage} alt="profile" />
              <div className='flex-1 text-left'>
                <p className='text-sm font-semibold text-gray-700 truncate'>{user?.name || 'My Account'}</p>
                <p className='text-xs text-gray-400'>View profile & appointments</p>
              </div>
              <div className='flex flex-col gap-1'>
                <button
                  onClick={() => { navigate('/my-profile'); setShowMenu(false); }}
                  className='text-xs text-primary font-medium hover:underline'
                >
                  Profile
                </button>
                <button
                  onClick={() => { logout(); setShowMenu(false); }}
                  className='text-xs text-red-500 font-medium hover:underline'
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { navigate('/login'); setShowMenu(false); }}
              className='w-full bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-blue-600 transition-all duration-300'>
              Create Account
            </button>
          )}

        </div>
      </div>

      {/* Backdrop */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className='fixed inset-0 bg-black/30 z-40 md:hidden'
        />
      )}

      {/* AI Chat Modal */}
      {showChat && <AIChatModal onClose={() => setShowChat(false)} />}
    </div>
  )
}

export default Navbar