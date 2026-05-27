import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div className='px-4 sm:px-8 md:px-12 lg:px-20 py-10'>

      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row justify-center items-center gap-10 mb-28 text-sm'>
        <img 
          className='w-full md:max-w-[360px] rounded-lg object-cover' 
          src={assets.contact_image} 
          alt="Contact Us"
        />

        <div className='flex flex-col justify-center items-start gap-6 md:max-w-sm'>
          <p className='font-semibold text-lg text-gray-600'>OUR OFFICE</p>
          <p className='text-gray-500 leading-relaxed'>
            00000 Willms Station <br />
            Suite 000, Washington, USA
          </p>
          <p className='text-gray-500 leading-relaxed'>
            Tel: (000) 000-0000 <br />
            Email: greatstackdev@gmail.com
          </p>
          <p className='font-semibold text-lg text-gray-600'>CAREERS AT PRESCRIPTO</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 rounded-sm'>
            Explore Jobs
          </button>
        </div>
      </div>

    </div>
  )
}

export default Contact