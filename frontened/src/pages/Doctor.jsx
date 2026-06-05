import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Doctor = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors);
    }
  }

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality])

  const specialities = [
    'General Physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ];

  return (
    <div className="flex justify-center px-4 sm:px-8 md:px-12 lg:px-20 mt-6">
      <div className='w-full max-w-6xl'>

        <p className='text-gray-600 mb-4'>Browse through the doctors specialist.</p>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilter(prev => !prev)}
          className={`sm:hidden mb-4 px-5 py-2 text-sm border rounded transition-all
            ${showFilter ? 'bg-primary text-white border-primary' : 'text-gray-600 border-gray-300'}`}
        >
          {showFilter ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className='flex flex-col sm:flex-row items-start gap-6'>

          {/* Sidebar Filter */}
          <div className={`w-full sm:w-auto flex-shrink-0 flex flex-col gap-3 text-sm text-gray-600
            ${showFilter ? 'flex' : 'hidden'} sm:flex`}>
            {specialities.map((spec) => (
              <p
                key={spec}
                onClick={() => spec === speciality ? navigate('/doctor') : navigate(`/doctor/${spec}`)}
                className={`pl-4 py-2 pr-12 border border-gray-300 rounded-lg cursor-pointer transition-all duration-200
                  hover:bg-indigo-50 hover:text-black
                  ${speciality === spec ? 'bg-indigo-100 text-black font-medium border-indigo-300' : ''}`}
              >
                {spec}
              </p>
            ))}
          </div>

          {/* Doctors Grid */}
          <div className='w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {filterDoc.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(`/appointment/${item._id}`)}
                className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 bg-white hover:shadow-md'
              >
                <img className='bg-blue-50 w-full object-cover' src={item.image} alt={item.name} />
                <div className='p-4'>
                  <div className='flex items-center gap-2 text-sm text-green-500 mb-1'>
                    <p className='w-2 h-2 bg-green-500 rounded-full'></p>
                    <p>Available</p>
                  </div>
                  <p className='text-gray-900 font-medium text-base leading-tight'>{item.name}</p>
                  <p className='text-gray-500 text-sm mt-0.5'>{item.speciality}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Doctor