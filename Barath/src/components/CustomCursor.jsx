import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return undefined;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const target = e.target;
      if (target && cursor) {
        // Direct DOM class toggle to avoid React state re-renders
        const isClickable = window.getComputedStyle(target).cursor === 'pointer';
        if (isClickable) {
          cursor.classList.add('cursor-pointer');
        } else {
          cursor.classList.remove('cursor-pointer');
        }
      }
    };

    let animationFrameId;
    let lastTime = performance.now();

    const updateCursor = (now) => {
      // Delta time normalized to 60fps (16.67ms per frame)
      const deltaTime = Math.min((now - lastTime) / 16.67, 4);
      lastTime = now;

      // Framerate-independent lerp
      const lerpFactor = 1 - Math.pow(1 - 0.15, deltaTime);
      currentX += (mouseX - currentX) * lerpFactor;
      currentY += (mouseY - currentY) * lerpFactor;

      if (cursor) {
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={cursorRef}
      className="custom-cursor"
      style={{ 
        transform: 'translate3d(-100px, -100px, 0)' 
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
