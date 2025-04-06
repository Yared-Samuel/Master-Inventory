import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Gallery from "@/components/mainPage/Gallery";
import CompanyShow from "@/components/mainPage/CompanyShow";


export default function Home() {
  return (
    <div className="relative flex items-center justify-center bg-gradient-to-b from-purple-300 to-purple-400">
      {/* <div className=" absolute top-50 left-50 w-full h-full">
        <Image className=" " src="/main-page/wave.svg" alt="wave" width={20000} height={20000} />
        <Image className=" " src="/main-page/waveInv.svg" alt="wave" width={20000} height={20000} />
        </div> */}
      <Head>
        <title>MELA - Introducing Most Technology</title>
        <link rel="icon" href="/Logo.svg" />
      </Head>
      
      {/* Main Card Container */}
      <div className="w-full h-full bg-white  shadow-2xl overflow-hidden relative">
        
        {/* Header/Navigation */}
        <header className="flex justify-between items-center p-6 md:p-8">
        
          {/* Logo */}
          <div className="flex items-center gap-2   border-b-2 border-t-2 border-gray-300 ">
            <div className=" w-12 h-12 flex items-center justify-center">
              <Image src="/Logo.svg" alt="Logo" width={200} height={200} />
            </div>
            <span className="text-2xl font-extrabold text-[#1066A8]">MELA</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm">
            <Link href="#" className="text-blue-500 font-medium">HOME</Link>
            <Link href="/login" className="text-gray-500 hover:text-blue-500 transition-colors">Login here</Link>
        </nav>
        </header>
        
        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row z-50">
          {/* Left Column - Text & Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10">
            {/* Headings */}
            <h1 className="text-5xl md:text-6xl font-black tracking-tight my-6">
              ULTIMATE<br />
             <span className="text-[#1066A8] ">SOLUTION </span><br/>
              FOR YOUR<br/>
              <span className="text-[#1066A8]">BUSINESS</span>
            </h1>
            
      
            
            <p className="text-gray-600 mb-8 max-w-md font-semibold">
            Seamless digital experiences to <span className="text-[#1066A8] font-bold">boost</span> efficiency, engagement, and growth your <span className="text-[#1066A8] font-bold">Business</span>.
            </p>
            </div>




            <Gallery />          
        </div>

      <CompanyShow />
        
        {/* Footer */}
        <div className="bg-white shadow-md rounded-lg py-6  mt-8 max-w-full mx-auto relative">
        
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Contact Us</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
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


