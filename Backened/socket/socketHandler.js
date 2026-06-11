// socket/socketHandler.js
import chatModel from '../models/chatModel.js'

const onlineUsers = new Map()

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    // ─── USER JOIN ────────────────────────────────────────────────────────────
    socket.on('user:join', (userId) => {
      const id = String(userId)
      onlineUsers.set(id, socket.id)
      socket.userId = id
      socket.userRole = 'user'
      socket.join(`user:${id}`)      // for receiving notifications via emitToUser()
      socket.join(`patient:${id}`)   // dedicated patient room (mirrors doctor:join pattern)
      console.log(`user:join → ${id}`)
    })

    // ─── DOCTOR JOIN ──────────────────────────────────────────────────────────
    socket.on('doctor:join', (doctorId) => {
      const id = String(doctorId)
      onlineUsers.set(id, socket.id)
      socket.userId = id
      socket.userRole = 'doctor'
      socket.join(`user:${id}`)      // keeps emitToUser() working for doctors too
      socket.join(`doctor:${id}`)    // dedicated doctor room
      console.log(`doctor:join → ${id}`)
    })

    // ─── CHAT ─────────────────────────────────────────────────────────────────
    socket.on('chat:join', (roomId) => socket.join(`chat:${roomId}`))
    socket.on('chat:leave', (roomId) => socket.leave(`chat:${roomId}`))

    socket.on('chat:send', async ({
      roomId,
      message,
      senderId,
      senderName,
      senderRole,
      receiverId
    }) => {
      try {
        const newMsg = await chatModel.create({
          appointmentId: roomId,
          senderId,
          senderName,
          senderRole,
          message,
          timestamp: new Date()
        })

        // Deliver message to everyone in the chat room
        io.to(`chat:${roomId}`).emit('chat:receive', newMsg)

        // Send notification only if receiver is NOT currently in the chat room
        if (receiverId) {
          const roomSockets = io.sockets.adapter.rooms.get(`chat:${roomId}`)

          // Safely check if receiver is in the room (explicit false if room doesn't exist)
          const receiverInRoom = roomSockets
            ? [...roomSockets].some(
                (sid) => io.sockets.sockets.get(sid)?.userId === String(receiverId)
              )
            : false

          console.log(
            `chat:send → receiverId: ${receiverId}, receiverInRoom: ${receiverInRoom}, roomSockets count: ${roomSockets?.size ?? 0}`
          )

          if (!receiverInRoom) {
            const notifPayload = {
              id: `notif_${Date.now()}`,
              type: 'new_message',
              title: `💬 New message from ${senderName}`,
              icon: '💬',
              message: message.length > 60 ? message.slice(0, 57) + '...' : message,
              timestamp: new Date().toISOString(),
              read: false,
              data: { roomId, senderId, senderName }
            }

            // ✅ Emit to BOTH user:<id> and doctor:<id> / patient:<id> rooms
            // This ensures notification reaches receiver regardless of their role
            // or which join event they used on the frontend
            io.to(`user:${receiverId}`)
              .to(`doctor:${receiverId}`)
              .to(`patient:${receiverId}`)
              .emit('notification', notifPayload)
          }
        }
      } catch (err) {
        console.error('chat:send error:', err)
      }
    })

    socket.on('chat:typing', ({ roomId, userName, isTyping }) => {
      socket.to(`chat:${roomId}`).emit('chat:typing', { userName, isTyping })
    })

    // ─── DOCTOR AVAILABILITY ──────────────────────────────────────────────────
    socket.on('doctor:availability:update', ({ doctorId, status }) => {
      io.emit('doctor:availability:changed', { doctorId, status })
    })

    // ─── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId)
        console.log(`User ${socket.userId} (${socket.userRole ?? 'unknown'}) disconnected`)
      }
    })
  })

  // ─── HELPERS called from controllers ─────────────────────────────────────

  /**
   * Send a notification to a patient/user.
   * Emits to both user:<id> and patient:<id> rooms so it works regardless
   * of which join event the frontend called.
   * @param {string|number} userId
   * @param {string} event   - e.g. 'notification'
   * @param {object} data    - notification payload (type, title, message, icon, data)
   */
  io.emitToUser = (userId, event, data) => {
    const payload = {
      id: `notif_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      read: false,
    }
    console.log(`emitToUser → userId: ${userId}, event: ${event}`)
    // ✅ Emit to both rooms for reliability
    io.to(`user:${userId}`).to(`patient:${userId}`).emit(event, payload)
  }

  /**
   * Send a notification to a doctor.
   * Emits to BOTH doctor:<id> and user:<id> rooms so it works regardless
   * of whether the frontend called doctor:join or user:join.
   * @param {string|number} doctorId
   * @param {string} event   - e.g. 'notification'
   * @param {object} data    - notification payload (type, title, message, icon, data)
   */
  io.emitToDoctor = (doctorId, event, data) => {
    const payload = {
      id: `notif_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      read: false,
    }
    console.log(`emitToDoctor → doctorId: ${doctorId}, event: ${event}`)
    // ✅ Emit to both rooms for reliability
    io.to(`doctor:${doctorId}`).to(`user:${doctorId}`).emit(event, payload)
  }
}

export default socketHandler