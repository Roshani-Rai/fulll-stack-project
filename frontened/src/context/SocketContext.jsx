import React, { createContext, useContext, useEffect, useState } from 'react'
import { socket } from '../socket/socket'
import { AppContext } from './AppContext'

const SocketContext = createContext()

const loadNotifications = () => {
  try {
    const stored = localStorage.getItem('patient_notifications')
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

const saveNotifications = (notifs) => {
  localStorage.setItem('patient_notifications', JSON.stringify(notifs))
}

export const SocketProvider = ({ children }) => {
  const { userData } = useContext(AppContext)
  const [notifications, setNotifications] = useState(loadNotifications)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userData?._id) return

    socket.connect()

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('user:join', userData._id)
    })

    socket.on('disconnect', () => setIsConnected(false))

    socket.on('notification', (data) => {
      const newNotif = {
        ...data,
        id: data.id || `notif_${Date.now()}`,
        read: false,
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(), // ✅ fixed
      }
      setNotifications(prev => {
        const updated = [newNotif, ...prev]
        saveNotifications(updated)
        return updated
      })
      if (Notification.permission === 'granted') {
        new Notification(data.title, { body: data.message })
      }
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('notification')
      socket.disconnect()
    }
  }, [userData?._id])
  

  const markAsRead = (id) =>
    setNotifications(prev => {
      const updated = prev.map(n => String(n.id) === String(id) ? { ...n, read: true } : n) // ✅ fixed
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
    localStorage.removeItem('patient_notifications')
  }

  return (
    <SocketContext.Provider value={{ socket, notifications, isConnected, markAsRead, markAllRead, clearAll }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)