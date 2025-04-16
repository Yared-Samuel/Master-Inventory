import React, { useState, useEffect, useRef } from 'react';

/**
 * ToggleComponent - A reusable component that can show/hide its children when clicked
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be toggled
 * @param {string} props.buttonText - Custom text for the toggle button (default: "Toggle")
 * @param {string} props.showText - Text to show when content is hidden (default: "Show")
 * @param {string} props.hideText - Text to show when content is visible (default: "Hide")
 * @param {boolean} props.iconSrc - Whether to show the icon
 * @param {boolean} props.initialState - Initial visibility state (default: false)
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.buttonClassName - Additional CSS classes for the button
 * @param {string} props.contentClassName - Additional CSS classes for the content container
 * @param {boolean} props.fullScreen - Whether the content should appear as a full-screen overlay (default: false)
 * @param {string} props.title - Title to display in the modal header
 */
const ToggleComponent = ({ 
  children, 
  buttonText,
  showText = "Show", 
  hideText = "Hide",
  iconSrc,
  initialState = false,
  className = "",
  buttonClassName = "",
  contentClassName = "",
  fullScreen = true,
  title = "Form"
}) => {
  const [isVisible, setIsVisible] = useState(initialState);
  const modalRef = useRef(null);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fullScreen && modalRef.current && !modalRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    if (isVisible && fullScreen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isVisible, fullScreen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={`toggle-container ${className}`}>
      <button
        onClick={toggleVisibility}
        className={`relative overflow-hidden group flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs
          text-white shadow-md transition-all duration-300 font-['Open Sans'] md:text-sm
          ${isVisible 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600' 
            : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'} 
          transform hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg
          ${buttonClassName}`}
      >
        {/* Animated background glow effect */}
        <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full transition-transform duration-700 ease-in-out group-hover:translate-x-[120%]"></span>
        
        {iconSrc && (
          <div 
            className={`transform transition-all duration-300 ease-in-out ${isVisible ? 'rotate-45' : ''}`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="size-5 text-white"
            >
              <path 
                fillRule="evenodd" 
                d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        <span className="relative z-10">{buttonText || (isVisible ? hideText : showText)}</span>
      </button>
      
      {fullScreen ? (
        // Full screen overlay
        isVisible && (
          <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-screen bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div 
              ref={modalRef}
              className={`relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-auto animate-popIn ${contentClassName}`}
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b">
              <h3 className="text-blue-700 font-bold text-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                {title}</h3>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-gray-600 bg-transparent hover:bg-red-100 hover:text-red-600 rounded-lg text-sm p-2 ml-auto inline-flex items-center transition-colors duration-200"
                  aria-label="Close"
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="red">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        )
      ) : (
        // Standard toggle content
        <div 
          className={`toggle-content overflow-hidden transition-all duration-300 ease-in-out ${contentClassName}`}
          style={{
            maxHeight: isVisible ? '2000px' : '0',
            opacity: isVisible ? 1 : 0,
            marginTop: isVisible ? '0.5rem' : '0'
          }}
        >
          <div className={isVisible ? 'animate-fadeIn' : ''}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToggleComponent;