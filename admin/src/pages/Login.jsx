import React, { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('Admin')
  const { setAtoken, backened_url } = useContext(AdminContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validate = () => {
    let valid = true
    setEmailError('')
    setPasswordError('')

    if (!email.trim()) {
      setEmailError('Email is required.')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.')
      valid = false
    }

    if (!password) {
      setPasswordError('Password is required.')
      valid = false
    }

    return valid
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const endpoint =
        state === 'Admin'
          ? `${backened_url}/api/admin/login`
          : `${backened_url}/api/doctor/login`

      const { data } = await axios.post(endpoint, { email, password })

      if (data.success) {
        localStorage.setItem('atoken', data.token)
        setAtoken(data.token)
         setEmail('')       
         setPassword('') 
      } else {
       toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4 w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8 shadow-lg text-sm text-gray-600"
      >
        <p className="text-2xl font-semibold text-center">
          <span className="text-primary">{state}</span> Login
        </p>


        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="font-semibold text-gray-500">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="new-password"
            className={`border rounded w-full p-2 outline-none focus:ring-2 focus:ring-primary/30 transition ${
              emailError ? 'border-red-400' : 'border-[#DADADA]'
            }`}
          />
          {emailError && (
            <span className="text-xs text-red-500">{emailError}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-semibold text-gray-500">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder='........'
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            
            className={`border rounded w-full p-2 outline-none focus:ring-2 focus:ring-primary/30 transition ${
              passwordError ? 'border-red-400' : 'border-[#DADADA]'
            }`}
          />
          {passwordError && (
            <span className="text-xs text-red-500">{passwordError}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white w-full py-2 rounded-md text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        {state === 'Admin' ? (
          <p className="text-center text-gray-500">
            Doctor Login?{' '}
            <button
              type="button"
              onClick={() => setState('Doctor')}
              className="text-primary underline cursor-pointer font-semibold"
            >
              Click here
            </button>
          </p>
        ) : (
          <p className="text-center text-gray-500">
            Admin Login?{' '}
            <button
              type="button"
              onClick={() => setState('Admin')}
              className="text-primary underline cursor-pointer font-semibold"
            >
              Click here
            </button>
          </p>
        )}
      </form>
    </div>
  )
}

export default Login