import React from 'react'
import Image from 'next/image'
import styles from './Gallery.module.css'

const Gallery = () => {
  return (
    <div>
      <Image 
        className='absolute top-0 right-0 z-0 opacity-20 md:opacity-10'
        src="/main-page/hero-image.svg" 
        alt="hero-image" 
        width={600} 
        height={600} 
      />
      <Image 
        // className='absolute top-0 left-0 z-20'
        src="/main-page/hero-image1.svg" 
        alt="hero-image" 
        width={600} 
        height={600} 
        className='relative -top-40 -left-20'
      
      />
    </div>

  )
}

export default Gallery