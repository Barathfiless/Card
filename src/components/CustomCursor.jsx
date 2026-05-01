import React, { useEffect, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };

    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <div 
      className={`custom-cursor ${isPointer ? 'cursor-pointer' : ''}`}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)` 
      }}
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M8 4L26 16L8 28V4Z" 
          fill="#000000" 
          stroke="#ffffff" 
          strokeWidth="1.5" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default CustomCursor;
