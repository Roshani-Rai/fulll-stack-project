import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import AIChatModal from './AIChatModal';

const Navbar = () => {
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>AI Assistant</span>
          </button>

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

        {/* ── BOTTOM SECTION — pushes to bottom with mt-auto ── */}
        <div className='mt-auto px-4 pb-8 flex flex-col gap-3'>

          {/* Divider */}
          <div className='border-t border-gray-100 mb-1' />

          {/* AI Health Assistant — pinned at bottom */}
          <button
            onClick={() => { setShowMenu(false); setShowChat(true); }}
            className='w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all duration-200 group'
          >
            <div className='w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200'>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className='text-left'>
              <p className='text-sm font-semibold text-blue-700'>AI Health Assistant</p>
              <p className='text-xs text-blue-400'>Ask symptoms, get guidance</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-auto text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Create Account button (if not logged in) */}
          {!token && (
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
