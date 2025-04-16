import React from 'react'
import { useContext } from 'react';
import AuthContext from '@/pages/context/AuthProvider';

const TitleComponent = ({pathName, children}) => {
  const { auth } = useContext(AuthContext);
  return (
    <div className="mb-2">
      <div className="relative bg-gradient-to-r from-[#447db5] to-[#155ca2] rounded-lg shadow-md overflow-hidden">        
        <div className="relative z-10 flex flex-row md:items-center justify-between p-4 md:p-3">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-white rounded"></div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              {children}
            </h1>
          </div>
          
          <div className="flex items-center mt-2 md:mt-0 space-x-3">
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-lg border border-white/10 hover:from-blue-600/30 hover:to-indigo-600/30 transition-all duration-300">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm md:text-base font-medium text-white tracking-wide">
                  {auth.companyName}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-lg border border-white/10 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white tracking-wide">
                    {auth.name}
                  </span>
                  <span className="text-xs text-white/70 tracking-wide">
                    {auth.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TitleComponent