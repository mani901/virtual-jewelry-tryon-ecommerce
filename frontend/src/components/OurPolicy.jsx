import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
        <div>
            <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold'>Authenticity Guarantee</p>
            <p className='text-gray-400'>All pieces are hallmark-certified and genuine</p>
        </div>
        <div>
            <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold'>30-Day Return Policy</p>
            <p className='text-gray-400'>Hassle-free returns on all unworn jewellery</p>
        </div>
        <div>
            <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
            <p className='font-semibold'>Expert Jewellery Support</p>
            <p className='text-gray-400'>Our gemologists are available 7 days a week</p>
        </div>
    </div>
  )
}

export default OurPolicy
