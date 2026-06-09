import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_BACKENED_URL 

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],   
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

