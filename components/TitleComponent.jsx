import React from 'react'

const TitleComponent = ({pathName, children}) => {
  return (
    <>
    <div className="flex justify-between items-start bg-gray-50">
        <h3 className="text-blue-600 font-extrabold text-lg pl-4">{children}</h3>
        <h3 className='font-bold text-white dark:text-black bg-blue-500 rounded-md px-1'>{pathName}</h3>        
      </div>
      <hr className="h-px bg-[#7249FF] border-0 dark:bg-gray-700"></hr>
    </>
  )
}

export default TitleComponent