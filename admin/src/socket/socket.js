import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true
})

socket.on('connect', () => console.log('SOCKET CONNECTED ✅', socket.id))
socket.on('connect_error', (err) => console.log('SOCKET ERROR ❌', err.message))