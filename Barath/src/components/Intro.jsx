import React, { useState, useEffect } from 'react';
import './Intro.css';

const Intro = ({ onFinish }) => {
  const [exit, setExit] = useState(false);
  const letters = "BARATH".split("");

  useEffect(() => {
    // Start exit transition after letters fully appear and hold
    const exitTimer = setTimeout(() => {
      setExit(true);
    }, 3600);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 4400);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`intro-overlay ${exit ? 'intro-exit' : ''}`}>
      {/* Split black panels sliding from sides to center */}
      <div className="intro-panel intro-panel-left"></div>
      <div className="intro-panel intro-panel-right"></div>

      <div className="intro-content">
        <h1 className="intro-text">
          {letters.map((char, index) => (
            <span
              key={index}
              className="intro-letter"
              style={{ animationDelay: `${index * 0.08 + 1.6}s` }}
            >
              {char}
            </span>
          ))}
        </h1>
        <p className="intro-subtitle">
          use Laptop or Desktop site for better view
        </p>
      </div>
    </div>
  );
};

export default Intro;
