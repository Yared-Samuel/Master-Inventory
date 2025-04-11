import React from 'react'

const TitleComponent = ({pathName, children}) => {
  return (
    <div className="mb-6">
      <div className="relative bg-gradient-to-r from-[#447db5] to-[#155ca2] rounded-lg shadow-md overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-row md:items-center justify-between p-4 md:p-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-white rounded"></div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              {children}
            </h1>
          </div>
          
          <div className="flex items-center mt-2 md:mt-0">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm md:text-base font-medium text-white">
                {pathName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TitleComponent