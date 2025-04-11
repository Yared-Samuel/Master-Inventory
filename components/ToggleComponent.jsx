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
          <div className="fixed inset-0 z-50 flex items-start justify-center p-2 bg-black/50 animate-fadeIn">
            <div 
              ref={modalRef}
              className={`relative w-full max-w-6xl max-h-[90vh] bg-[#F3F4F6] rounded-lg shadow-2xl overflow-auto animate-popIn ${contentClassName}`}
            >
              <div className="sticky top-0 z-10 bg-[#447DB5] text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h3 className="text-xl font-bold">{title}</h3>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-white hover:text-red-100 focus:outline-none"
                  aria-label="Close"
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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