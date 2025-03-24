import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { WifiIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

export default function Home() {
  return (
    <div className="  flex items-center justify-center bg-gradient-to-b from-purple-300 to-purple-400">
      <Head>
        <title>MELA - Introducing Most Technology</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Main Card Container */}
      <div className="w-full h-full bg-white  shadow-2xl overflow-hidden relative">
        
        {/* Header/Navigation */}
        <header className="flex justify-between items-center p-6 md:p-8">
          {/* Logo */}
          <div className="flex items-center gap-2   border-b-2 border-t-2 border-gray-300 ">
            <div className=" w-12 h-12 flex items-center justify-center">
              <Image src="/Logo.png" alt="Logo" width={200} height={200} />
            </div>
            <span className="text-2xl font-extrabold text-[#1066A8]">MELA</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm">
            <Link href="#" className="text-blue-500 font-medium">HOME</Link>
            <Link href="#" className="text-gray-500 hover:text-blue-500 transition-colors">CONTACT</Link>
            <Link href="#" className="text-gray-500 hover:text-blue-500 transition-colors">About Us</Link>
          </nav>
        </header>
        
        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row">
          {/* Left Column - Text & Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10">
            {/* Headings */}
            <h1 className="text-5xl md:text-6xl font-black tracking-tight my-6">
              ULTIMATE<br />
             <span className="text-[#1066A8]">SOLUTION </span><br/>
              FOR YOUR<br/>
              <span className="text-[#1066A8]">BUSINESS</span>
            </h1>
            
      
            
            <p className="text-gray-600 mb-8 max-w-md font-semibold">
            Seamless digital experiences to <span className="text-[#1066A8] font-bold">boost</span> efficiency, engagement, and growth your <span className="text-[#1066A8] font-bold">Business</span>.
            </p>

            

            
            {/* Dots Pattern */}
            <div className="grid grid-cols-8 gap-2 mt-10">

              {[...Array(48)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-200"></div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Image */}
          <div className="w-full md:w-1/2 relative">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 md:left-0 z-10">
              <div className="flex space-x-4">
                <ChevronLeftIcon className="w-8 h-8 text-blue-300 transform rotate-180" />
                <ChevronLeftIcon className="w-12 h-12 text-blue-400 transform rotate-180" />
                <ChevronLeftIcon className="w-16 h-16 text-blue-500 transform rotate-180" />
              </div>
            </div>
            
            {/* Blue circle decoration */}
            <div className="absolute top-20 right-20 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center z-10">
              <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-white rounded-full"></div>
              </div>
            </div>
            
            {/* Main image */}
            <div className="h-full min-h-[400px] relative">
              <div className="absolute inset-0 bg-teal-400 rounded-full scale-110 transform translate-x-1/4 translate-y-1/12"></div>
              <Image
                src="/main-page/phone-fancy.jpg"
                alt="Business person using 5G technology"
                fill
                className="object-cover rounded-full scale-90 transform translate-x-1/4 mix-blend-multiply grayscale"
                style={{ filter: "hue-rotate(180deg) brightness(1.2)" }}
              />
            </div>

            
            
            {/* Wireless waves overlay */}
            <div className="absolute bottom-20 ">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-40 h-40 border-2 border-blue-300 rounded-full absolute"
                  style={{
                    left: `${i * 10}px`,
                    bottom: `${i * 10}px`,
                    opacity: 1 - (i * 0.15)
                  }}
                ></div>
              ))}
            </div>
            
            {/* Plus symbol decoration */}
            <div className="absolute bottom-20 left-20 text-blue-500 text-6xl font-bold">+</div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-white shadow-md rounded-lg py-6 px-8 mt-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Contact Us</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone */}
            <div className="flex items-center space-x-4 group">
              <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-6 h-6 text-blue-600"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" 
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Main Office</p>
                <a href="tel:+251920273746" className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  +251 920 273 746
                </a>
              </div>
            </div>
            
            {/* Mobile */}
            <div className="flex items-center space-x-4 group">
              <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-6 h-6 text-green-600"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" 
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Customer Support</p>
                <a href="tel:+251920273746" className="text-lg font-bold text-gray-800 hover:text-green-600 transition-colors">
                  +251 920 273 746
                </a>
              </div>
            </div>
            
            {/* Email */}
            <div className="flex items-center space-x-4 group">
              <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-6 h-6 text-purple-600"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" 
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email Us</p>
                <a href="mailto:contact@example.com" className="text-lg font-bold text-gray-800 hover:text-purple-600 transition-colors">
                  contact@example.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


