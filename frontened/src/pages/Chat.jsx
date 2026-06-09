import { useEffect, useRef, useState, useContext } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const Chat = () => {
  const { appointmentId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { userData, backend_url, token } = useContext(AppContext)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingName, setTypingName] = useState('')
  const [loading, setLoading] = useState(true)

  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  const doctorName       = state?.doctorName       || 'Doctor'
  const doctorImage      = state?.doctorImage       || ''
  const doctorSpeciality = state?.doctorSpeciality  || ''

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(
          `${backend_url}/api/chat/history/${appointmentId}`,
          { headers: { token } }
        )
        if (data.success) setMessages(data.messages)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchHistory()
  }, [appointmentId, token])

  useEffect(() => {
    if (!socket) return
    socket.emit('chat:join', appointmentId)
    socket.on('chat:receive', (msg) => setMessages(prev => [...prev, msg]))
    socket.on('chat:typing', ({ userName, isTyping }) => {
      setIsTyping(isTyping)
      setTypingName(userName)
    })
    return () => {
      socket.emit('chat:leave', appointmentId)
      socket.off('chat:receive')
      socket.off('chat:typing')
    }
  }, [socket, appointmentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleTyping = (e) => {
    setInput(e.target.value)
    if (!socket || !userData) return
    socket.emit('chat:typing', {
      roomId: appointmentId,
      userName: userData?.name || 'Patient',
      isTyping: true,
    })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit('chat:typing', {
        roomId: appointmentId,
        userName: userData?.name || 'Patient',
        isTyping: false,
      })
    }, 1000)
  }

  const sendMessage = () => {
    if (!input.trim() || !userData) return
    socket.emit('chat:send', {
      roomId: appointmentId,
      message: input.trim(),
      senderId: userData._id,
      senderName: userData.name,
      senderRole: 'patient',
      receiverId: state?.doctorId,
    })
    setInput('')
    socket.emit('chat:typing', {
      roomId: appointmentId,
      userName: userData.name,
      isTyping: false,
    })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const formatDate = (ts) => {
    const d = new Date(ts)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const grouped = messages.reduce((acc, msg) => {
    const dateKey = new Date(msg.timestamp).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(msg)
    return acc
  }, {})

  return (
    <div
      className='flex flex-col bg-gray-50 w-full'
      style={{ height: 'calc(100vh - 88px - 0px)' }}
    >
      <div className='flex flex-col flex-1 min-h-0 w-[90%] md:w-[76%] mx-auto py-4 gap-3'>

        {/* ── Single joined card: header + messages ── */}
        <div className='flex flex-col flex-1 min-h-0 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden'>

          {/* Header — top of the card */}
          <div className='flex items-center gap-3 px-4 sm:px-5 py-3 flex-shrink-0 border-b border-gray-100'>
            <button
              onClick={() => navigate('/my-appointment')}
              className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-gray-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
              </svg>
            </button>

            <img
              src={doctorImage}
              alt={doctorName}
              className='w-9 h-9 rounded-full object-cover bg-primary/10 flex-shrink-0'
            />

            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-800 truncate'>{doctorName}</p>
              <p className='text-xs text-primary truncate hidden sm:block'>{doctorSpeciality}</p>
            </div>

            <div className='flex items-center gap-1.5 flex-shrink-0'>
              <span className='w-2 h-2 rounded-full bg-green-400'></span>
              <span className='text-xs text-gray-400 hidden sm:block'>Online</span>
            </div>
          </div>

          {/* Messages — scrollable middle section */}
          <div className='flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-4 flex flex-col gap-1 bg-gray-50'>

            {loading ? (
              <div className='flex items-center justify-center flex-1 py-20'>
                <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
              </div>
            ) : messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center flex-1 py-20 gap-3 px-4'>
                <div className='w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                  </svg>
                </div>
                <p className='text-gray-500 text-sm font-medium text-center'>No messages yet</p>
                <p className='text-gray-400 text-xs text-center'>Start the conversation with {doctorName}</p>
              </div>
            ) : (
              Object.entries(grouped).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  <div className='flex items-center gap-3 my-4'>
                    <div className='flex-1 h-px bg-gray-200'></div>
                    <span className='text-xs text-gray-400 font-medium px-3 py-1 bg-white rounded-full whitespace-nowrap border border-gray-100'>
                      {formatDate(msgs[0].timestamp)}
                    </span>
                    <div className='flex-1 h-px bg-gray-200'></div>
                  </div>

                  {msgs.map((msg, i) => {
                    const mine = msg.senderRole === 'patient'
                    const showAvatar = i === 0 || msgs[i - 1]?.senderRole !== msg.senderRole
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex items-end gap-2 mb-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className='w-7 h-7 flex-shrink-0'>
                          {showAvatar && (
                            mine
                              ? <div className='w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold'>
                                  {userData?.name?.charAt(0) || 'P'}
                                </div>
                              : <img src={doctorImage} className='w-7 h-7 rounded-full object-cover bg-primary/10' alt='' />
                          )}
                        </div>

                        <div className={`max-w-[70%] sm:max-w-sm md:max-w-md flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                          <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words ${
                            mine
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                          }`}>
                            {msg.message}
                          </div>
                          <span className='text-[10px] text-gray-400 mt-1 px-1'>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}

            {isTyping && (
              <div className='flex items-end gap-2 mb-1'>
                <img src={doctorImage} className='w-7 h-7 rounded-full object-cover bg-primary/10 flex-shrink-0' alt='' />
                <div className='bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-full bg-gray-400 animate-bounce' style={{ animationDelay: '0ms' }}></span>
                  <span className='w-2 h-2 rounded-full bg-gray-400 animate-bounce' style={{ animationDelay: '150ms' }}></span>
                  <span className='w-2 h-2 rounded-full bg-gray-400 animate-bounce' style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className='text-xs text-gray-400 hidden sm:inline'>{typingName} is typing…</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar — bottom of the card */}
          <div className='flex-shrink-0 border-t border-gray-100 bg-white px-3 sm:px-4 py-3'>
            <div className='flex items-end gap-2 sm:gap-3'>
              <textarea
                value={input}
                onChange={handleTyping}
                onKeyDown={handleKey}
                placeholder={`Message ${doctorName}…`}
                rows={1}
                className='flex-1 resize-none border border-gray-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors leading-relaxed overflow-y-auto'
                style={{ maxHeight: '8rem' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-0.5'
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 rotate-90' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                </svg>
              </button>
            </div>
            <p className='text-[9px] sm:text-[10px] text-gray-400 mt-1.5 text-center'>
              Enter to send · Shift+Enter for new line
            </p>
          </div>

        </div>
        {/* ── end joined card ── */}

      </div>
    </div>
  )
}

export default Chat