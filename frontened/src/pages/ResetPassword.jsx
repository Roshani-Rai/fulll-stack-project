import React, { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const ResetPassword = () => {
  const { resetToken } = useParams()
  const { backend_url } = useContext(AppContext)
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data } = await axios.post(backend_url + '/api/user/reset-password', { resetToken, newPassword })
    if (data.success) {
      toast.success(data.message)
      navigate('/login')
    } else {
      toast.error(data.message)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='bg-white p-8 rounded-2xl shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Reset Password</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-4'>
          <input
            type='password'
            placeholder='Enter new password'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className='border border-gray-300 rounded-full px-4 py-2 outline-none'
            required
          />
          <button className='bg-primary text-white py-2 rounded-full hover:opacity-90'>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword