import React, { useState, useEffect, useRef } from 'react';

function TypingHeader({ text, className, tag: Tag = 'h2', delay = 50 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasStarted(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [hasStarted, text, delay]);

  return (
    <Tag ref={elementRef} className={className} aria-label={text}>
      <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
        {text}
      </span>
      <span aria-hidden="true">
        {displayedText}
        {hasStarted && displayedText.length < text.length && (
          <span className="typing-cursor">|</span>
        )}
      </span>
    </Tag>
  );
}

export default TypingHeader;
