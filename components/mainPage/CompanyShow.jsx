import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const CompanyShow = () => {
  return (
    <section class="bg-white dark:bg-gray-900">
    <div class="py-8 lg:py-16 mx-auto max-w-screen-xl px-4">
        <h2 class="mb-8 lg:mb-16 text-3xl font-extrabold tracking-tight leading-tight text-center text-gray-900 dark:text-white md:text-4xl">You’ll be in good company</h2>
        <div class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 md:grid-cols-3 lg:grid-cols-6 dark:text-gray-400">
            <Link href="#" class="flex justify-center items-center ">                
                <Image src="/main-page/bzn.jpg" width={100} height={100} className='dark:hover:text-white' alt='some thing' />
            </Link>
            <Link href="#" class="flex justify-center items-center border-2 border-gray-300 rounded-lg p-2 ">
                      <h3 className='font-bold'>BEYENE LEDA LOUNGE & HOTEL</h3>                                     
            </Link>
            <Link href="#" class="flex justify-center items-center border-2 border-gray-300 rounded-lg p-2">
                      <h3 className='font-bold'>GIRMA GIFAWOSSEN TRADING</h3>                                     
            </Link>
            <Link href="#" class="flex justify-center items-center border-2 border-gray-300 rounded-lg p-2">
                      <h3 className='font-bold'>SAFARICOM ETHIOPIA</h3>                                     
            </Link>
            <Link href="#" class="flex justify-center items-center border-2 border-gray-300 rounded-lg p-2">
                      <h3 className='font-bold'>BEKA TRADING PLC</h3>                                     
            </Link>
            <Link href="#" class="flex justify-center items-center border-2 border-gray-300 rounded-lg p-2">
                      <h3 className='font-bold'>SOKE RESTAURANT</h3>                                     
            </Link>
            

      
        </div>
    </div>
</section>
  )
}

export default CompanyShow