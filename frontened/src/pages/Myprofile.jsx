import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const MyProfile = () => {
  const { user, setUser } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null)
  const inputClass = 'border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition w-full'

  return user && (
    <div className='min-h-screen bg-gray-50 flex justify-center px-4 py-10'>
      <div className='bg-white w-full max-w-lg rounded-2xl shadow-md p-8 flex flex-col gap-6 h-fit'>

        {/* Profile Image + Name */}
        <div className='flex flex-col items-center gap-3'>
          <label htmlFor='profile-upload' className={`relative ${isEdit ? 'cursor-pointer' : 'cursor-default'}`}>
            <img
              src={image ? URL.createObjectURL(image) : (user.image || assets.upload_icon)}
              alt="Profile"
              className='w-24 h-24 rounded-full object-cover border-4 border-primary shadow'
            />
            {isEdit && (
              <div className='absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow'>
                <img src={assets.upload_icon} alt="upload" className='w-3.5 h-3.5' />
              </div>
            )}
          </label>

          {isEdit && (
            <input
              id='profile-upload'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={e => setImage(e.target.files[0])}
            />
          )}
          
          {isEdit
            ? <input
                type='text'
                value={user.name}
                onChange={e => setUser(prev => ({ ...prev, name: e.target.value }))}
                className={`${inputClass} text-center text-xl font-semibold`}
              />
            : <p className='text-2xl font-bold text-gray-800'>{user.name}</p>
          }
        </div>

        <hr className='border-gray-200' />

        {/* Contact Information */}
        <div className='flex flex-col gap-4'>
          <p className='text-xs font-semibold uppercase tracking-widest text-gray-400'>Contact Information</p>
          <div className='flex flex-col gap-3'>

            {/* Email */}
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-500'>Email</p>
              <p className='text-sm text-primary font-medium'>{user.email}</p>  {/* ✅ */}
            </div>

            {/* Phone */}
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-500'>Phone</p>
              {isEdit
                ? <input
                    type='text'
                    value={user.phone}
                    onChange={e => setUser(prev => ({ ...prev, phone: e.target.value }))}  // ✅
                    className={inputClass}
                  />
                : <p className='text-sm text-gray-700'>{user.phone}</p>  // ✅
              }
            </div>

            {/* Address */}
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-500'>Address</p>
              {isEdit
                ? <div className='flex flex-col gap-2'>
                    <input
                      type='text'
                      value={user.address.line1}
                      onChange={e => setUser(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}  // ✅
                      className={inputClass}
                    />
                    <input
                      type='text'
                      value={user.address.line2}
                      onChange={e => setUser(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}  // ✅
                      className={inputClass}
                    />
                  </div>
                : <p className='text-sm text-gray-700 leading-relaxed'>
                    {user.address.line1}<br />{user.address.line2}
                  </p>
              }
            </div>
          </div>
        </div>

        <hr className='border-gray-200' />

        {/* Basic Information */}
        <div className='flex flex-col gap-4'>
          <p className='text-xs font-semibold uppercase tracking-widest text-gray-400'>Basic Information</p>
          <div className='flex flex-col gap-3'>

            {/* Gender */}
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-500'>Gender</p>
              {isEdit
                ? <select
                    value={user.gender}
                    onChange={e => setUser(prev => ({ ...prev, gender: e.target.value }))}  // ✅
                    className={inputClass}
                  >
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                : <p className='text-sm text-gray-700'>{user.gender}</p>  // ✅
              }
            </div>

            {/* Date of Birth */}
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-500'>Date of Birth</p>
              {isEdit
                ? <input
                    type='date'
                    value={user.dob}
                    onChange={e => setUser(prev => ({ ...prev, dob: e.target.value }))}  // ✅
                    className={inputClass}
                  />
                : <p className='text-sm text-gray-700'>{user.dob}</p>  // ✅
              }
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className='flex justify-center mt-2'>
          {isEdit
            ? <button
                onClick={() => setIsEdit(false)}
                className='bg-primary text-white px-10 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300'
              >
                Save Changes
              </button>
            : <button
                onClick={() => setIsEdit(true)}
                className='border border-primary text-primary px-10 py-2.5 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-300'
              >
                Edit Profile
              </button>
          }
        </div>
      </div>
    </div>
  )
}

export default MyProfile