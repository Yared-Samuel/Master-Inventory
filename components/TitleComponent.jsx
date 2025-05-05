import React from 'react'


const TitleComponent = ({ children}) => {
  
  return (
    <div className="mb-0.5">
        <div className="relative z-10 flex flex-row md:items-center justify-between ">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 md:h-6 bg-teal-500 rounded"></div>
            <h1 className="text-lg md:text-2xl font-bold text-teal-800 tracking-wide">
              {children}
            </h1>
          </div>
          
          <div className="flex items-center md:space-x-3">
            
            
          </div>
        </div>
    </div>
  )
}

export default TitleComponent