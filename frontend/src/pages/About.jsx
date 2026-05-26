import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="About Zewar House" />

        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>
            Welcome to Zewar House — Pakistan's premier destination for fine women's jewellery. From delicate necklaces to statement anklets, every piece in our collection is crafted with precision, passion, and the finest materials.
          </p>
          <p>
            At Zewar House, we believe jewellery is more than adornment — it is a story, an heirloom, a celebration. Our team of master artisans and gemologists curate collections that honour traditional Pakistani craftsmanship while embracing contemporary design.
          </p>
          <b className='text-gray-800'>Our Mission</b>
          <p>
            Our mission is to make authentic, hallmark-certified jewellery accessible to every woman in Pakistan. We are committed to ethical sourcing, transparent pricing, and a shopping experience that feels as precious as the jewellery itself.
          </p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col sm:flex-row justify-between gap-8'>

        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 w-full sm:w-1/3'>
          <b>Certified Authenticity:</b>
          <p className='text-gray-600'>
            Every piece at Zewar House is hallmark-certified, guaranteeing genuine gold, silver, diamond, pearl, and gemstone quality. You shop with complete confidence, backed by our authenticity guarantee.
          </p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 w-full sm:w-1/3'>
          <b>Pakistan-Wide Delivery:</b>
          <p className='text-gray-600'>
            We offer fast, insured, and discreet delivery to every corner of Pakistan. Your jewellery arrives safely packaged, protecting both its beauty and its value from our store to your door.
          </p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5 w-full sm:w-1/3'>
          <b>Expert Jewellery Support:</b>
          <p className='text-gray-600'>
            Our dedicated team of gemologists and jewellery consultants is available seven days a week. Whether you need styling advice, sizing help, or custom-order assistance, we are always here for you.
          </p>
        </div>

      </div>

      <div className="mt-16">
        <NewsletterBox />
      </div>
    </div>
  );
};

export default About;
