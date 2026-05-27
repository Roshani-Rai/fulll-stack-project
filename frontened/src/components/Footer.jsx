import React from 'react'
import { assets } from '../assets/assets'
const Footer = () => {
  return (
    <div className=" flex flex-col  items-center justify-center">
      <div className='w-[76%] md:mx-10 flex  flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-28 text-sm'>
        <div className=''>
            <img className='mb-5 w-40' src={assets.logo} alt="" />
            <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'> GET IN TOUCH </p>
            <ul className='flex flex-col gap-2 text-gray-600'>
                <li>+0-000-000-000</li>
                <li>roshaniroydev@gmail.com</li>
            </ul>
        </div>
        
      </div>
      <div className='w-[76%] '>
        <hr className='text-gray-600' />
        <p className='text-sm text-center m-4'>Copyright 2024 @ RoshaniStack.dev - All Right Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
