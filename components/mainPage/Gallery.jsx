import React from 'react'
import Image from 'next/image'
import styles from './Gallery.module.css'

const Gallery = () => {
  return (
    <div className={styles.body}>
      <div className={styles.gallery}>
        <Image 
          className={styles.galleryImage1}
          src="/main-page/phone-fancy.jpg" 
          alt="a house on a mountain" 
          width={200} 
          height={200} 
        />
        <Image 
          className={styles.galleryImage2}
          src="/main-page/phone-fancy.jpg" 
          alt="some pink flowers" 
          width={200} 
          height={200}           
        />
        <Image 
          className={styles.galleryImage3}
          src="/main-page/phone-fancy.jpg" 
          alt="big rocks with some trees" 
          width={200} 
          height={200} 
        />
        <Image 
          className={styles.galleryImage4}
          src="/main-page/phone-fancy.jpg" 
          alt="a waterfall, a lot of trees and great view from the sky" 
          width={200} 
          height={200} 
        />
        <Image 
          className={styles.galleryImage5}
          src="/main-page/phone-fancy.jpg" 
          alt="a cool landscape" 
          width={200} 
          height={200} 
        />
        <Image 
          className={styles.galleryImage6}
          src="/main-page/phone-fancy.jpg" 
          alt="inside a town between two buildings" 
          width={200} 
          height={200} 
        />
        <Image 
          className={styles.galleryImage7}
          src="/main-page/phone-fancy.jpg" 
          alt="a great view of the sea above mountain" 
          width={200} 
          height={200} 
        />
      </div>
    </div>
  )
}

export default Gallery