import React, { useState, useEffect, useRef } from 'react';
import './VoiceAssistant.css';

function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'success' | 'error'
  const [transcript, setTranscript] = useState('');
  const [tooltipText, setTooltipText] = useState('Press Ctrl + V to talk');
  const [showTooltip, setShowTooltip] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const timeoutRef = useRef(null);

  // Keep ref in sync for event handlers
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Show tooltip on hover or when listening
  useEffect(() => {
    if (isListening || status === 'success' || status === 'error') {
      setShowTooltip(true);
    } else {
      // Small delay to hide tooltip when returning to idle
      const t = setTimeout(() => {
        if (!isListeningRef.current) {
          setShowTooltip(false);
        }
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isListening, status]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setTooltipText('Speech recognition not supported in this browser');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false; // We use restart onend for more reliable phrase processing
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setStatus('listening');
      setTooltipText('Listening... Say a command');
      setTranscript('');
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const currentText = final || interim;
      if (currentText) {
        setTranscript(currentText);
        setTooltipText(`"${currentText}"`);
      }

      if (final) {
        processCommand(final.toLowerCase());
      }
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setStatus('error');
        setTooltipText('Microphone permission denied');
        setIsListening(false);
      } else if (event.error !== 'no-speech') {
        setStatus('error');
        setTooltipText(`Error: ${event.error}`);
      }
    };

    rec.onend = () => {
      // If the user hasn't manually turned it off, restart listening for the next phrase
      if (isListeningRef.current) {
        try {
          rec.start();
        } catch (e) {
          console.error('Failed to restart speech recognition:', e);
        }
      } else {
        setStatus('idle');
        setTooltipText('Press Ctrl + V to talk');
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Process Speech Commands
  const processCommand = (commandText) => {
    const text = commandText.trim();
    
    // Command definitions mapping words to element IDs and human labels
    const commands = [
      {
        keywords: ['about', 'move to about', 'go to about', 'scroll to about', 'about me'],
        id: 'about',
        label: 'About Me'
      },
      {
        keywords: ['milestone', 'education', 'move to milestones', 'go to milestones', 'education section'],
        id: 'education',
        label: 'Milestones'
      },
      {
        keywords: ['project', 'move to projects', 'go to projects', 'portfolio', 'projects section'],
        id: 'projects',
        label: 'Projects'
      },
      {
        keywords: ['skills', 'skill', 'move to skills', 'go to skills', 'my skills'],
        id: 'skills',
        label: 'Skills'
      },
      {
        keywords: ['contact', 'message', 'get in touch', 'move to contact', 'go to contact'],
        id: 'contact',
        label: 'Contact'
      }
    ];

    // Find a matching command
    let matchedCommand = null;
    for (const cmd of commands) {
      if (cmd.keywords.some(keyword => text.includes(keyword))) {
        matchedCommand = cmd;
        break;
      }
    }

    if (matchedCommand) {
      const element = document.getElementById(matchedCommand.id);
      if (element) {
        // Perform smooth scroll
        element.scrollIntoView({ behavior: 'smooth' });
        
        // Show success state
        setStatus('success');
        setTooltipText(`Navigated to ${matchedCommand.label}!`);
        
        // Clear success state and return to listening/idle
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            setStatus('listening');
            setTooltipText('Listening... Say a command');
            setTranscript('');
          } else {
            setStatus('idle');
            setTooltipText('Press Ctrl + V to talk');
          }
        }, 2000);
      }
    }
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Speech recognition not supported
      setStatus('error');
      setTooltipText('Speech recognition not supported in this browser');
      setShowTooltip(true);
      return;
    }

    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  // Keyboard shortcut listener (Ctrl + V)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if Ctrl/Cmd is pressed and key is V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        // Check if focused element is a text input, textarea, or contentEditable
        const active = document.activeElement;
        const isInput = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable
        );

        if (!isInput) {
          e.preventDefault(); // Prevent default browser paste behavior
          toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening]);

  return (
    <div 
      className={`voice-assistant-container ${isListening ? 'listening' : ''} ${status === 'success' ? 'success' : ''} ${status === 'error' ? 'error-state' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => {
        if (!isListening && status !== 'success' && status !== 'error') {
          setShowTooltip(false);
        }
      }}
    >
      {/* Dynamic Tooltip */}
      {showTooltip && (
        <div className={`voice-assistant-tooltip ${isListening ? 'listening' : ''} ${status === 'success' ? 'success' : ''}`}>
          <span className="tooltip-main-text">{tooltipText}</span>
          {isListening && transcript && (
            <span className="transcript-preview">Heard: {transcript}</span>
          )}
          {!isListening && (
            <span className="keyboard-hint">Shortcut: Ctrl + V</span>
          )}
        </div>
      )}

      {/* Glowing Swirling Glass Orb Button */}
      <button 
        className="voice-assistant-orb"
        onClick={toggleListening}
        aria-label={isListening ? "Turn off Voice Assistant" : "Turn on Voice Assistant"}
        title="Toggle Voice Assistant (Ctrl + V)"
      >
        {/* Outer Pulsing Ripples */}
        {isListening && (
          <div className="voice-assistant-ripple-container">
            <div className="voice-assistant-ripple"></div>
            <div className="voice-assistant-ripple"></div>
            <div className="voice-assistant-ripple"></div>
          </div>
        )}

        {/* Core Glowing & Swirling layers */}
        <div className="orb-glow-layer-1"></div>
        <div className="orb-glow-layer-2"></div>
        <div className="orb-glow-layer-3"></div>
        <div className="orb-core-pink"></div>
        
        {/* Glass reflection details */}
        <div className="orb-glass-highlight"></div>
        <div className="orb-glass-highlight-rim"></div>

      </button>
    </div>
  );
}

export default VoiceAssistant;
