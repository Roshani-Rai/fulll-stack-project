import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from '../socket/socket.js'
import { DoctorContext } from './DoctorContext.jsx'
import { AdminContext } from './AdminContext.jsx'

const SocketContext = createContext()

// load from localStorage once on startup
const loadNotifications = () => {
  try {
    const stored = localStorage.getItem('doctor_notifications')
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

const saveNotifications = (notifs) => {
  localStorage.setItem('doctor_notifications', JSON.stringify(notifs))
}

const SocketProvider = ({ children }) => {
  const { dtoken, profileData } = useContext(DoctorContext)
  const { atoken } = useContext(AdminContext)

  const [notifications, setNotifications] = useState(loadNotifications)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!dtoken || !profileData?._id) return

    socket.connect()

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('user:join', profileData._id)
      socket.emit('doctor:join', profileData._id)
      console.log('Doctor socket connected:', profileData._id)
    })

    socket.on('disconnect', () => setIsConnected(false))

    socket.on('notification', (data) => {
      setNotifications(prev => {
        const updated = [
          {
            ...data,
            id: Date.now(),
            read: false,
            createdAt: data.createdAt || new Date().toISOString(), // ← persist timestamp
          },
          ...prev,
        ]
        saveNotifications(updated)
        return updated
      })
    })

    socket.on('doctor:availability:changed', ({ doctorId, status }) => {
      console.log('Availability updated:', doctorId, status)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('notification')
      socket.off('doctor:availability:changed')
      socket.disconnect()
    }
  }, [dtoken, profileData?._id])

  const markAsRead = (id) =>
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      saveNotifications(updated)
      return updated
    })

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('doctor_notifications')
  }

  const markAllRead = () =>
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      saveNotifications(updated)
      return updated
    })

  const updateAvailability = (status) => {
    if (!profileData?._id) return
    socket.emit('doctor:availability:update', { doctorId: profileData._id, status })
  }

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      isConnected,
      markAsRead,
      markAllRead,
      clearAll,
      updateAvailability,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
export default SocketProvider