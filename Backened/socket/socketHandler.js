// socket/socketHandler.js
import chatModel from '../models/chatModel.js'

const onlineUsers = new Map()

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    socket.on('user:join', (userId) => {
      onlineUsers.set(String(userId), socket.id)
      socket.userId = String(userId)
      socket.join(`user:${userId}`)
      console.log(`user:join → ${userId}`)
    })

    socket.on('doctor:join', (doctorId) => {
      onlineUsers.set(String(doctorId), socket.id)
      socket.userId = String(doctorId)
      socket.join(`user:${doctorId}`)
      socket.join(`doctor:${doctorId}`)
      console.log(`doctor:join → ${doctorId}`)
    })

    socket.on('chat:join', (roomId) => socket.join(`chat:${roomId}`))
    socket.on('chat:leave', (roomId) => socket.leave(`chat:${roomId}`))

    socket.on('chat:send', async ({ roomId, message, senderId, senderName, senderRole, receiverId }) => {
      try {
        const newMsg = await chatModel.create({
          appointmentId: roomId,
          senderId,
          senderName,
          senderRole,
          message,
          timestamp: new Date()
        })
        io.to(`chat:${roomId}`).emit('chat:receive', newMsg)

        if (receiverId) {
          const roomSockets = io.sockets.adapter.rooms.get(`chat:${roomId}`)
          const receiverInRoom = roomSockets && [...roomSockets].some(
            sid => io.sockets.sockets.get(sid)?.userId === String(receiverId)
          )
          if (!receiverInRoom) {
            io.to(`user:${receiverId}`).emit('notification', {
              id: `notif_${Date.now()}`,
              type: 'new_message',
              title: `💬 New message from ${senderName}`,
              icon: '💬',
              message: message.length > 60 ? message.slice(0, 57) + '...' : message,
              timestamp: new Date().toISOString(),
              read: false,
              data: { roomId, senderId, senderName }
            })
          }
        }
      } catch (err) {
        console.error('chat:send error:', err)
      }
    })

    socket.on('chat:typing', ({ roomId, userName, isTyping }) => {
      socket.to(`chat:${roomId}`).emit('chat:typing', { userName, isTyping })
    })

    socket.on('doctor:availability:update', ({ doctorId, status }) => {
      io.emit('doctor:availability:changed', { doctorId, status })
    })

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId)
        console.log(`User ${socket.userId} disconnected`)
      }
    })
  })

  // ─── HELPERS called from controllers ─────────────────────────────────────
  io.emitToUser = (userId, event, data) => {
    console.log(`emitToUser → userId: ${userId}, event: ${event}`)
    io.to(`user:${userId}`).emit(event, {
      id: `notif_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      read: false,
    })
  }

  io.emitToDoctor = (doctorId, event, data) => {
    io.to(`doctor:${doctorId}`).emit(event, {
      id: `notif_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      read: false,
    })
  }
}

export default socketHandler