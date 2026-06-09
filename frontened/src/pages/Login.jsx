import React, { useState } from 'react'
import { AppContext } from '../context/AppContext';
import { useContext } from 'react';
import axios from 'axios'
import {toast} from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '../context/firebase'
import { signInWithPopup } from 'firebase/auth'

const Login = () => {
  const {backend_url , token,setToken} = useContext(AppContext)
  const navigate = useNavigate()
  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if(state === 'Sign Up'){
        const {data}= await axios.post(backend_url + '/api/user/register' , {name,email,password})
        if(data.success){
          toast.success("Account created Successfully!!")
          localStorage.setItem('token',data.token)
          setToken(data.token)
          navigate('/')
        }
        else{
          toast.error(data.message)
        }
      }
      else{
        const {data}= await axios.post(backend_url + '/api/user/login' , {email,password})
        if(data.success){
          toast.success("User logged in Successfully!!")
          localStorage.setItem('token',data.token)
          setToken(data.token)
          navigate('/')
        }
        else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // ✅ Google login — added
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const { data } = await axios.post(backend_url + '/api/user/google-login', { idToken })
      if (data.success) {
        toast.success("Logged in with Google!")
        localStorage.setItem('token', data.token)
        setToken(data.token)
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className='min-h-[80vh] flex items-center justify-center bg-gray-50 px-4'
    >
      <div className='bg-white w-full max-w-md rounded-2xl shadow-lg px-10 py-10 flex flex-col gap-5'>

        {/* Header */}
        <div className='text-center mb-2'>
          <p className='text-2xl font-bold text-gray-800'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </p>
          <p className='text-sm text-gray-500 mt-1'>
            Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment
          </p>
        </div>

        {/* Full Name — only on Sign Up */}
        {state === 'Sign Up' && (
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Full Name</label>
            <input
              type='text'
              placeholder='John Doe'
               autoComplete='new-password'
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              className='border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition'
            />
          </div>
        )}

        {/* Email */}
        <div className='flex flex-col gap-1'>
          <label className='text-sm font-medium text-gray-700'>Email</label>
          <input
            type='email'
             autoComplete='new-password'
            placeholder='you@example.com'
            onChange={(e) => setEmail(e.target.value)}
            value={email}                            
            required
            className='border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition'
          />
        </div>

        {/* Password */}
        <div className='flex flex-col gap-1'>
          {/* ✅ Forgot Password link added next to label */}
          <div className='flex justify-between items-center'>
            <label className='text-sm font-medium text-gray-700'>Password</label>
            {state === 'Login' && (
              <span
                onClick={() => navigate('/forgot-password')}
                className='text-xs text-primary cursor-pointer hover:underline'
              >
                Forgot Password?
              </span>
            )}
          </div>
          <input
            type='password'
            autoComplete='new-password'
            placeholder='••••••••'
            onChange={(e) => setPassword(e.target.value)}
            value={password}                         
            required
            className='border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition'
          />
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className='w-full bg-primary text-white py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all duration-300 mt-2'
        >
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {/* ✅ Divider added */}
        <div className='flex items-center gap-3'>
          <hr className='flex-1 border-gray-200' />
          <span className='text-xs text-gray-400'>or</span>
          <hr className='flex-1 border-gray-200' />
        </div>

        {/* ✅ Google Login Button added */}
        <button
          type='button'
          onClick={loginWithGoogle}
          className='w-full border border-gray-300 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300'
        >
          <img
            src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
            className='w-5 h-5'
            alt='Google'
          />
          Continue with Google
        </button>

        {/* Toggle — unchanged */}
        {state === 'Sign Up' ? (
          <p className='text-center text-sm text-gray-500'>
            Already have an account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-primary font-medium cursor-pointer hover:underline'
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-center text-sm text-gray-500'>
            Don't have an account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-primary font-medium cursor-pointer hover:underline'
            >
              Sign up here
            </span>
          </p>
        )}

      </div>
    </form>
  )
}

export default Login