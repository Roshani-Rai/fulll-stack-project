import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from '../socket/socket.js'
import { DoctorContext } from './DoctorContext.jsx'
import { AdminContext } from './AdminContext.jsx'

const SocketContext = createContext()

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

  // CONSOLIDATED: All socket setup in ONE useEffect
  useEffect(() => {
    if (!dtoken || !profileData?._id) return

    socket.connect()

    // Connection handler
    const handleConnect = () => {
      setIsConnected(true)
      console.log('Doctor socket connected:', profileData._id)
      socket.emit('user:join', profileData._id)
      socket.emit('doctor:join', profileData._id)
      console.log('Doctor joined rooms:', profileData._id)
    }

    // Disconnect handler
    const handleDisconnect = () => {
      setIsConnected(false)
      console.log('Doctor socket disconnected')
    }

    // Notification handler
    const handleNotification = (data) => {
      console.log('Doctor notification received:', data)
      const newNotif = {
        ...data,
        id: data.id || `notif_${Date.now()}`,
        read: false,
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
      }
      setNotifications(prev => {
        const updated = [newNotif, ...prev]
        saveNotifications(updated)
        return updated
      })
    }

    // 🔴 ADD THIS - Listen for appointment bookings from patients
    const handleAppointmentBooked = (data) => {
      console.log('New appointment booked:', data)
      const newNotif = {
        type: 'appointment_booked',
        message: `New appointment request from ${data.patientName || 'Patient'}`,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        id: `appt_${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      }
      setNotifications(prev => {
        const updated = [newNotif, ...prev]
        saveNotifications(updated)
        return updated
      })
    }

    // 🔴 ADD THIS - Listen for appointment updates
    const handleAppointmentUpdated = (data) => {
      console.log('Appointment updated:', data)
      const newNotif = {
        type: 'appointment_updated',
        message: data.message || 'Appointment status changed',
        appointmentId: data.appointmentId,
        id: `appt_${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      }
      setNotifications(prev => {
        const updated = [newNotif, ...prev]
        saveNotifications(updated)
        return updated
      })
    }

    const handleAvailabilityChanged = ({ doctorId, status }) => {
      console.log('Availability updated:', doctorId, status)
    }

    // Register all listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('notification', handleNotification)
    socket.on('appointment:booked', handleAppointmentBooked)        
    socket.on('appointment:updated', handleAppointmentUpdated)     
    socket.on('doctor:availability:changed', handleAvailabilityChanged)

    // Cleanup
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('notification', handleNotification)
      socket.off('appointment:booked', handleAppointmentBooked)
      socket.off('appointment:updated', handleAppointmentUpdated)
      socket.off('doctor:availability:changed', handleAvailabilityChanged)
      socket.disconnect()
    }
  }, [dtoken, profileData?._id])



  const markAsRead = (id) =>
    setNotifications(prev => {
      const updated = prev.map(n => 
        String(n.id) === String(id) ? { ...n, read: true } : n
      )
      saveNotifications(updated)
      return updated
    })

  const markAllRead = () =>
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      saveNotifications(updated)
      return updated
    })

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('doctor_notifications')
  }

  const updateAvailability = (status) => {
    if (!profileData?._id) return
    socket.emit('doctor:availability:update', { 
      doctorId: profileData._id, 
      status 
    })
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