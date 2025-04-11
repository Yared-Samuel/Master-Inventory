import React, { useState } from 'react'
import Menu from './Menu'
import Image from 'next/image'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

const Layout = ({children}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen relative">
      {/* Toggle Button for medium and small screens */}
      <button 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-2 left-2 z-50 lg:hidden bg-white rounded-full p-1 shadow-lg opacity-60"
      >
        {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay for medium and small screens */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static
        z-40 lg:z-auto
        h-full
        bg-white
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'left-0' : '-left-full lg:left-0'}
        ${isSidebarOpen ? 'w-40 md:w-36' : 'w-16'}
        p-2
        border-r border-gray-200
      `}>
        <div className="flex items-center justify-between mb-6">
          <div
            
            className="flex border-b-2 border-t-2 border-gray-300"
          >
            <Image src={"/logo.svg"} alt="logo" width={30} height={30} className='rounded-full' />
            <span className={`text-xl font-bold text-[#1066A8] transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            <span className={`${isSidebarOpen ? '' : 'hidden'}`}>MELA</span>
            </span>
          </div>
          
          {/* Toggle Button for large screens */}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="hidden lg:block"
          >
            {isSidebarOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>
        </div>
        
        <Menu isExpanded={isSidebarOpen} />
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
        bg-gray-50
      `}>
        {/* <Navbar /> */}
        {children}
      </main>
    </div>
  )
}

export default Layout