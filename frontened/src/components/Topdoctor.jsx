import React, { useContext } from 'react'
//import { doctors } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
const Topdoctor = () => {
    const navigate = useNavigate();
    const {doctors} = useContext(AppContext);
  return (
   <div className=" flex flex-row mt-6 justify-center">
      <div className='w-[76%] flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
        <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
        <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
        <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
            {
                doctors.slice(0,10).map((item,index)=>(
                    <div onClick={()=>{navigate(`/appointment/${item._id}`);scrollTo(0,0)}} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
                     <img className='bg-blue-50' src={item.image} alt="" />
                       <div className='p-4 flex items-center gap-2 text-sm text-center text-green-500'>
                        <p className='w-2 h-2 bg-green-500 rounded-full'></p> <p>Available</p>
                        </div>  
                        <p className='px-4 text-gray-900 text-lg font-medium'>{item.name}</p>
                        <p className='px-4 pb-4 text-gray-600 text-sm'>{item.speciality}</p>
                        <p className='px-4 text-gray-600 text-sm'>{item.speciality}</p>

{/* ✅ Rating */}
<div className='flex items-center gap-1 px-4 pb-4 mt-1'>
  {[1,2,3,4,5].map(star => (
    <span key={star} className={`text-sm ${star <= Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
  ))}
  <span className='text-xs text-gray-400 ml-1'>{item.rating?.toFixed(1)} ({item.totalRatings || 0})</span>
</div>

                     </div>
                ))
            }
        </div>
        <button onClick={()=>{navigate('/doctor'); scrollTo(0,0)}} className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
      </div>
    </div>
  )
}

export default Topdoctor
