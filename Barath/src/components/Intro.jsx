import React, { useState, useEffect } from 'react';
import './Intro.css';

const Intro = ({ onFinish }) => {
  const [exit, setExit] = useState(false);
  const letters = "BARATH".split("");

  useEffect(() => {
    // Start exit animation faster after letters appear
    const exitTimer = setTimeout(() => {
      setExit(true);
    }, 2200);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`intro-overlay ${exit ? 'intro-exit' : ''}`}>
      <div className="intro-content">
        <h1 className="intro-text">
          {letters.map((char, index) => (
            <span
              key={index}
              className="intro-letter"
              style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
            >
              {char}
            </span>
          ))}
        </h1>
        <p className="intro-device-hint">
          Use Laptop or Desktop view for better view
        </p>
      </div>
    </div>
  );
};

export default Intro;
