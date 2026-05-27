import React, { useState } from 'react'

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
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
            placeholder='you@example.com'
            onChange={(e) => setEmail(e.target.value)}
            value={email}                            
            required
            className='border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition'
          />
        </div>

        {/* Password */}
        <div className='flex flex-col gap-1'>
          <label className='text-sm font-medium text-gray-700'>Password</label>
          <input
            type='password'
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

        {/* Toggle */}
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