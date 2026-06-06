import React from 'react'
import { AdminContext } from '../context/AdminContext'
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ListDoctor = () => {
  const { doctors,deleteDoctor, atoken, getAllDoctors , changeAvailability} = useContext(AdminContext)
   const navigate = useNavigate()

  useEffect(() => {
    if (atoken) getAllDoctors()
  }, [atoken,changeAvailability])

const handleDelete = (docId, docName) => {
  if (window.confirm(`Are you sure you want to delete Dr. ${docName}?`)) {
    deleteDoctor(docId)
  }
}


  return atoken && (
    <div className='m-6 w-full'>
      <p className='ml-24 sm:ml-0 text-xl font-semibold text-gray-700 mb-6'>
        All <span className='text-primary'>Doctors</span>
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {doctors.map((item, index) => (
          <div
            key={index}
            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 bg-white hover:shadow-md'
          >
            <img
              className='bg-blue-50 hover:bg-primary w-full object-cover'
              src={item.image}
              alt={item.name}
            />

            <div className='p-4'>
              {/* Toggle */}
              <div className='flex items-center justify-between mt-1 mb-3'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      checked={item.available}
                      onChange={() => changeAvailability(item._id)}
                      className='sr-only'
                    />
                    <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${item.available ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${item.available ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${item.available ? 'text-blue-500' : 'text-gray-400'}`}>
                    {item.available ? 'Available' : 'Not Available'}
                  </span>
                </label>
              </div>

              <p className='text-gray-900 font-medium text-base leading-tight'>{item.name}</p>
              <p className='text-gray-500 text-sm mt-0.5'>{item.speciality}</p>
              <div className='flex items-center gap-1  mt-1'>
  {[1,2,3,4,5].map(star => (
    <span key={star} className={`text-sm ${star <= Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
  ))}
  <span className='text-xs text-gray-400 ml-1'>{item.rating?.toFixed(1)} ({item.totalRatings || 0})</span>
</div>
               <div className='flex gap-2 mt-3'>
              <button
              onClick={() => navigate('/edit-doctor', { state: { doctor: item } })}
              className='flex-1 py-1.5 text-sm text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors'
                  >
                      Edit
               </button>
                     <button
                   onClick={() => handleDelete(item._id, item.name)}
                  className='flex-1 py-1.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors'
                 >
                Delete
              </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {doctors.length === 0 && (
        <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
          <p className='text-lg font-medium'>No doctors found</p>
          <p className='text-sm mt-1'>Add a doctor to see them listed here</p>
        </div>
      )}
    </div>
  )
}

export default ListDoctor