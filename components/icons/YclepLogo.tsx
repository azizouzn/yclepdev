
import React from 'react';

const YclepLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Icon Symbol */}
    <g>
      {/* The Base 'Y' Shape - Left Branch */}
      <path 
        d="M12 8L20 20L20 32" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-gray-900"
      />
      {/* The Spark/Insight - Right Branch (Disconnected for style) */}
      <path 
        d="M28 8L20 20" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-indigo-600"
      />
      {/* The AI Dot */}
      <circle cx="34" cy="8" r="3" className="fill-indigo-500 animate-pulse" />
    </g>

    {/* Text Wordmark */}
    <text 
      x="50" 
      y="28" 
      fontFamily="'Geist', 'Inter', sans-serif" 
      fontWeight="700" 
      fontSize="24" 
      fill="currentColor"
      className="text-gray-900"
      style={{ letterSpacing: '-0.02em' }}
    >
      Yclep
    </text>
  </svg>
);

export default YclepLogo;
