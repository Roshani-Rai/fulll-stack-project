import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const ForgotPassword = () => {
  const { backend_url } = useContext(AppContext)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data } = await axios.post(backend_url + '/api/user/forgot-password', { email })
    if (data.success) {
      setSent(true)
      toast.success(data.message)
    } else {
      toast.error(data.message)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='bg-white p-8 rounded-2xl shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Forgot Password</h2>
        {sent
          ? <p className='text-green-600'>Check your email for the reset link.</p>
          : <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-4'>
              <input
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='border border-gray-300 rounded-full px-4 py-2 outline-none'
                required
              />
              <button className='bg-primary text-white py-2 rounded-full hover:opacity-90'>
                Send Reset Link
              </button>
            </form>
        }
      </div>
    </div>
  )
}

export default ForgotPassword