import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CLICKABLE_SELECTOR = 'a, button, input, select, textarea, [role="button"], label[for], .dock-item, .msci-ticker-pause-btn';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return undefined;

    // Enable custom cursor style configuration on page html tag
    document.documentElement.classList.add('has-custom-cursor');

    let isPointer = false;
    let lastTarget = null;

    const onMouseMove = (e) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      const target = e.target;
      if (target === lastTarget) return;
      lastTarget = target;

      if (!target) return;

      const clickable = target.closest(CLICKABLE_SELECTOR);
      const nextPointer = !!clickable;
      if (nextPointer !== isPointer) {
        isPointer = nextPointer;
        cursor.classList.toggle('cursor-pointer', isPointer);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{ transform: 'translate3d(-100px, -100px, 0)' }}
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 4L26 16L8 28V4Z"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default CustomCursor;
