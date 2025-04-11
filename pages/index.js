import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Gallery from "@/components/mainPage/Gallery";
import CompanyShow from "@/components/mainPage/CompanyShow";


export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white text-gray-800">
      <Head>
        <title>MELA - Introducing Most Technology</title>
        <link rel="icon" href="/logo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Background tech pattern elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.png')] bg-repeat opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-10"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px] opacity-5"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-indigo-500 rounded-full filter blur-[100px] opacity-10"></div>
      </div>
      
      {/* Main Card Container */}
      <div className="relative w-full max-w-7xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden border border-gray-200/50 rounded-none md:rounded-lg my-0 md:my-8">
        
        {/* Header/Navigation */}
        <header className="flex justify-between items-center p-6 md:p-8 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-50 p-2 rounded-xl border border-blue-100">
              <Image src="logo.svg" alt="Logo" width={200} height={200} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MALEDA TECH</span>
              <span className="text-xs text-gray-500">Innovative Solutions</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 text-base">
            <Link href="#top" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
            <Link href="#solutions" className="text-gray-600 hover:text-blue-600 transition-colors">Solutions</Link>
            <Link href="#partners" className="text-gray-600 hover:text-blue-600 transition-colors">Partners</Link>
            <Link href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
          </nav>
        </header>
        
        {/* Hero Section - Main Content Area */}
        <div id="top" className="flex flex-col md:flex-row py-16 px-6 md:px-12 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Tech circuit pattern background */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 800 800">
              <defs>
                <pattern id="tech-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 0,10 10,0 20,10 10,20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tech-pattern)" />
            </svg>
          </div>
          
          {/* Left Column - Text & Form */}
          <div className="w-full md:w-1/2 md:pr-16 z-10">
            {/* Headings */}
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-gray-800">
              ULTIMATE<br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SOLUTION</span><br/>
              FOR YOUR<br/>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">BUSINESS</span>
            </h1>
            
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              Seamless digital experiences to <span className="text-blue-600 font-bold">boost</span> efficiency, engagement, and growth for your <span className="text-blue-600 font-bold">business</span>.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="#solutions" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
                Get Started
              </a>
              <a href="#partners" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300">
                Learn More
              </a>
            </div>
          </div>

          <div className="w-full md:w-1/2 mt-12 md:mt-0">
            <Gallery />
          </div>          
        </div>

        {/* CompanyShow component with solutions section */}
        <div id="solutions">
          <CompanyShow />
        </div>
        
        {/* Partners Showcase */}
        <div id="partners" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-200/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 relative">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Companies We Work With</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full -mb-4"></span>
            </h2>
            
            <div className="relative overflow-hidden">
              {/* Gradient overlays for infinite scroll effect */}
              <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
              
              {/* Auto-scrolling partners marquee */}
              <div className="flex animate-scroll gap-12 py-4">
                {/* Company 1 */}
                <div className="flex flex-col items-center min-w-[200px] bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mx-4 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Image 
                      src="https://picsum.photos/200" 
                      alt="Company 1" 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Tech Corp</h3>
                </div>
                
                {/* Company 2 */}
                <div className="flex flex-col items-center min-w-[200px] bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mx-4 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Image 
                      src="https://picsum.photos/201" 
                      alt="Company 2" 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Innovate Inc</h3>
                </div>
                
                {/* Company 3 */}
                <div className="flex flex-col items-center min-w-[200px] bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mx-4 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Image 
                      src="https://picsum.photos/202" 
                      alt="Company 3" 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Global Systems</h3>
                </div>
                
                {/* Company 4 */}
                <div className="flex flex-col items-center min-w-[200px] bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mx-4 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Image 
                      src="https://picsum.photos/203" 
                      alt="Company 4" 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Future Solutions</h3>
                </div>
                
                {/* Company 5 */}
                <div className="flex flex-col items-center min-w-[200px] bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mx-4 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Image 
                      src="https://picsum.photos/204" 
                      alt="Company 5" 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Digital Experts</h3>
                </div>
                
                {/* Duplicate companies for continuous scroll effect */}
                <div className="flex flex-col items-center min-w-[200px] bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mx-4 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Image 
                      src="https://picsum.photos/200" 
                      alt="Company 1" 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Tech Corp</h3>
                </div>
                
                <div className="flex flex-col items-center min-w-[200px] bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mx-4 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-200">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <Image 
                      src="https://picsum.photos/201" 
                      alt="Company 2" 
                      width={80} 
                      height={80} 
                      className="rounded-lg object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Innovate Inc</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Us */}
        <div id="contact" className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm shadow-lg rounded-xl py-10 px-6 mt-8 mb-16 max-w-5xl mx-auto relative overflow-hidden border border-blue-100">
          {/* Background decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full opacity-5 blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500 rounded-full opacity-5 blur-3xl"></div>
          
          <div className="relative">
            <h3 className="text-3xl font-bold text-center mb-10 pb-4 relative">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Get In Touch</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Phone Card */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-1 border border-gray-200 group">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600 mb-1">Main Office</p>
                    <a href="tel:+251920273746" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors block mb-2">
                      +251 920 273 746
                    </a>
                    <p className="text-sm text-gray-600">Available 9am - 5pm, Mon-Fri</p>
                  </div>
                </div>
              </div>
              
              {/* Mobile Card */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-1 border border-gray-200 group">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-600 mb-1">Customer Support</p>
                    <a href="tel:+251920273746" className="text-xl font-bold text-gray-800 hover:text-emerald-600 transition-colors block mb-2">
                      +251 920 273 746
                    </a>
                    <p className="text-sm text-gray-600">24/7 Support Available</p>
                  </div>
                </div>
              </div>
              
              {/* Email Card */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 hover:-translate-y-1 border border-gray-200 group">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="2" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Email Us</p>
                    <a href="mailto:maledatech@gmail.com" className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors block mb-2">
                      maledatech@gmail.com
                    </a>
                    <p className="text-sm text-gray-600">We will respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message button */}
            <div className="mt-10 text-center">
              <a href="#contact-form" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:from-blue-700 hover:to-indigo-700 group">
                Send Us a Message
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
            
            {/* Contact Form */}
            <div id="contact-form" className="mt-16 pt-4">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200">
                <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">Get in Touch</h4>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Subject"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows="4" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  <div className="text-center">
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1"
                    >
                      Submit Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-8 text-center text-gray-600">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-6">
              <Image src="logo.svg" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <p className="mb-6">© 2023 MALEDA TECH. All rights reserved.</p>
            <div className="flex justify-center gap-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


