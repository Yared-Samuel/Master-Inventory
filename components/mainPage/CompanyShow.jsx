import Image from "next/image";
import Link from "next/link";
import React from "react";

const CompanyShow = () => {
  return (
    <div className="px-4 py-20 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Tech pattern overlay */}
      <div className="absolute inset-0 w-full h-full opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50h100M50 0v100M25 25h50v50h-50z" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.5" />
              <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.3" />
              <circle cx="75" cy="25" r="2" fill="currentColor" opacity="0.3" />
              <circle cx="25" cy="75" r="2" fill="currentColor" opacity="0.3" />
              <circle cx="75" cy="75" r="2" fill="currentColor" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute -top-20 right-10 w-60 h-60 bg-blue-500 rounded-full opacity-5 blur-[100px]"></div>
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-indigo-500 rounded-full opacity-5 blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded-full mb-4">Technology Solutions</span>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            Our Latest Products
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            Discover our innovative solutions designed to transform your business operations and maximize efficiency.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Card - Spans 2 rows on left side */}
          <div className="lg:col-span-6 lg:row-span-2">
            <Link href="#" className="group h-full">
              <div className="relative h-full overflow-hidden rounded-2xl shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/20 flex flex-col">
                <div className="relative h-96 overflow-hidden">
                  <Image
                    src="main-page/inv-image.svg"
                    alt="Advanced Inventory Management"
                    fill
                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-100 via-blue-50/80 to-transparent opacity-90"></div>
                  
                  {/* Futuristic elements */}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-70"></div>
                  <div className="absolute top-0 right-0 w-20 h-20">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 opacity-20">
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
                      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" fill="none" />
                      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <span className="px-3 py-1 bg-blue-600/80 text-blue-50 text-xs font-semibold rounded-full uppercase tracking-wider">Featured</span>
                    <h3 className="text-3xl font-bold text-gray-800 mt-3 group-hover:text-blue-600 transition-colors">
                      Advanced Inventory Management
                    </h3>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-gray-600 mb-6 flex-1 leading-relaxed">
                    Our comprehensive inventory system combines AI-powered analytics with intuitive interfaces to revolutionize how you track, manage, and optimize your stock levels.
                  </p>
                  <div className="flex items-center">
                    <span className="text-blue-600 font-semibold mr-3">Learn more</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors border border-blue-200 group-hover:border-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Right Side Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 2 */}
            <Link href="#" className="group">
              <div className="h-full bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200 hover:border-blue-200">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="main-page/flit-image.svg"
                    alt="Flight Management System"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-100 via-blue-50/70 to-transparent"></div>
                  
                  {/* Tech element */}
                  <div className="absolute top-4 right-4 h-8 w-8 opacity-50">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">Flight Management System</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    Streamline operations with our comprehensive aviation management solution.
                  </p>
                  <div className="inline-flex items-center text-blue-600 text-sm font-medium">
                    <span>View details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
        </div>
      </Link>
            
            {/* Card 3 */}
            <Link href="#" className="group">
              <div className="h-full bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200 hover:border-blue-200">
                <div className="relative h-48 overflow-hidden">
        <Image
                    src="main-page/flit-image.svg"
                    alt="Engaging Website"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-100 via-blue-50/70 to-transparent"></div>
                  
                  {/* Tech element */}
                  <div className="absolute top-4 right-4 h-8 w-8 opacity-50">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600">
                      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1" />
                      <path d="M2 8H22" stroke="currentColor" strokeWidth="1" />
                      <circle cx="5" cy="5" r="1" fill="currentColor" />
                      <circle cx="9" cy="5" r="1" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">Business Websites</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    Captivate your audience with responsive, high-performance web solutions.
                  </p>
                  <div className="inline-flex items-center text-blue-600 text-sm font-medium">
                    <span>View details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
        </div>
      </Link>
            
            {/* Card 4 */}
            <Link href="#" className="group">
              <div className="h-full bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200 hover:border-blue-200">
                <div className="relative h-48 overflow-hidden">
        <Image
                    src="main-page/inv-image.svg"
                    alt="Cloud Solutions"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-100 via-blue-50/70 to-transparent"></div>
                  
                  {/* Tech element */}
                  <div className="absolute top-4 right-4 h-8 w-8 opacity-50">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-600">
                      <path d="M6 10C6 7.79086 7.79086 6 10 6H14C16.2091 6 18 7.79086 18 10V18C18 20.2091 16.2091 22 14 22H10C7.79086 22 6 20.2091 6 18V10Z" stroke="currentColor" strokeWidth="1" />
                      <path d="M8 2H16" stroke="currentColor" strokeWidth="1" />
                      <path d="M10 6V2" stroke="currentColor" strokeWidth="1" />
                      <path d="M14 6V2" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">Cloud Solutions</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    Secure, scalable infrastructure that grows with your business needs.
                  </p>
                  <div className="inline-flex items-center text-blue-600 text-sm font-medium">
                    <span>View details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
        </div>
      </Link>
            
            {/* Card 5 (New) */}
            <Link href="#" className="group">
              <div className="h-full bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200 hover:border-blue-200">
                <div className="relative h-48 overflow-hidden">
        <Image
                    src="main-page/inv-image.svg"
                    alt="Data Analytics"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-100 via-blue-50/70 to-transparent"></div>
                  
                  {/* Tech element */}
                  <div className="absolute top-4 right-4 h-8 w-8 opacity-50">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                      <path d="M3 12H7.5M16.5 12H21M7.5 12V6.5C7.5 5.11929 8.61929 4 10 4H14C15.3807 4 16.5 5.11929 16.5 6.5V12M7.5 12C7.5 13.3807 8.61929 14.5 10 14.5H14C15.3807 14.5 16.5 13.3807 16.5 12" stroke="currentColor" strokeWidth="1" />
                      <path d="M5 17H19M7 20H17" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">Data Analytics</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    Transform raw data into actionable insights for better decision making.
                  </p>
                  <div className="inline-flex items-center text-blue-600 text-sm font-medium">
                    <span>View details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Call to Action Button */}
          <div className="lg:col-span-12 mt-8 text-center">
            <Link href="#" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-indigo-700 border border-blue-500/20 group">
              View All Solutions
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyShow;
