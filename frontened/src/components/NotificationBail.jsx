import { useState, useRef, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'

const icons = {
  appointment_booked:    '📅',
  appointment_confirmed: '📅',
  appointment_cancelled: '❌',
  prescription_added:    '💊',
  refund_processed:      '💰',
  refund_requested:      '💸',
  payment_confirmed:     '✅',
  payment_received:      '💳',
  new_message:           '💬',
}

const formatGroupDate = (iso) => {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const groupByDate = (notifications) => {
  const groups = {}
  notifications.forEach(n => {
    const key = formatGroupDate(n.createdAt || new Date().toISOString())
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })
  return groups
}

const NotificationBell = () => {
  const { notifications, markAsRead, markAllRead, clearAll, isConnected } = useSocket()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const unread = notifications.filter(n => !n.read).length
  const grouped = groupByDate(notifications)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(o => !o)
    if (!open && unread > 0) markAllRead()
  }

  const handleClick = (notif) => {
    markAsRead(notif.id)
    setOpen(false)
    if (notif.type === 'appointment_booked')    navigate('/my-appointment')
    if (notif.type === 'appointment_confirmed') navigate('/my-appointment')
    if (notif.type === 'appointment_cancelled') navigate('/my-appointment')
    if (notif.type === 'prescription_added')    navigate('/my-appointment')
    if (notif.type === 'payment_confirmed')     navigate('/my-appointment')
    if (notif.type === 'refund_processed')      navigate('/my-appointment')
  }

  return (
    <div className='relative' ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={handleOpen}
        className='relative flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200'
        aria-label='Notifications'
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-gray-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
          <path strokeLinecap='round' strokeLinejoin='round' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
        </svg>

        {unread > 0 && (
          <span className='absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white'>
            {unread > 9 ? '9+' : unread}
          </span>
        )}

        <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className='absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden'>

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
                className='text-xs text-gray-400 hover:text-red-500 transition-colors'
              >
                Clear all
              </button>
            )}
          </div>

          {/* List grouped by date */}
          <div className='max-h-96 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 gap-2'>
                <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-gray-300' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                </svg>
                <p className='text-sm text-gray-400'>No notifications yet</p>
              </div>
            ) : (
              Object.entries(grouped).map(([date, items]) => (
                <div key={date}>

                  {/* Date label */}
                  <div className='px-4 py-1.5 bg-gray-50 border-y border-gray-100 sticky top-0 z-10'>
                    <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wider'>
                      {date}
                    </p>
                  </div>

                  {/* Items */}
                  {items.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50 hover:bg-blue-50/80' : ''}`}
                    >
                      <span className='text-xl flex-shrink-0 mt-0.5'>
                        {icons[n.type] || '🔔'}
                      </span>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-gray-800 leading-tight'>{n.title}</p>
                        <p className='text-xs text-gray-500 mt-0.5 leading-relaxed'>{n.message}</p>
                        <p className='text-[10px] text-gray-400 mt-1'>{formatTime(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <span className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5' />
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='px-4 py-2.5 border-t border-gray-100 bg-gray-50'>
              <button
                onClick={() => { navigate('/my-appointment'); setOpen(false) }}
                className='text-xs text-blue-600 hover:text-blue-700 font-medium'
              >
                View all appointments →
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default NotificationBell