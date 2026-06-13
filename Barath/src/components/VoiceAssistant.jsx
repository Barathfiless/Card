import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../data/projects';
import './VoiceAssistant.css';

const getTooltipDefault = () => {
  return typeof window !== 'undefined' && window.innerWidth <= 768 
    ? 'Tap to ON/OFF' 
    : 'Press Ctrl + V to talk';
};

function VoiceAssistant() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'success' | 'error'
  const [transcript, setTranscript] = useState('');
  const [tooltipText, setTooltipText] = useState(getTooltipDefault);
  const [showTooltip, setShowTooltip] = useState(false);
  const [projects, setProjects] = useState([]);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);   // true while TTS is playing — prevents mic echo
  const conversationStateRef = useRef('idle'); // 'idle' | 'awaiting_email' | 'awaiting_message' | 'awaiting_send_confirmation' | 'dictating_email' | 'dictating_message'
  const activeUtteranceRef = useRef(null);
  const safetyTimeoutRef = useRef(null);
  const shouldRestartOnSpeechEndRef = useRef(false);
  const isProgrammaticInputRef = useRef(false);
  const dictationBaseValueRef = useRef('');
  const silenceTimerRef = useRef(null);
  const timeoutRef = useRef(null);
  const projectsRef = useRef([]);
  const networkRetryCountRef = useRef(0);
  const networkRetryTimerRef = useRef(null);
  const cachedVoicesRef = useRef([]);
  const dictationStateRef = useRef({
    hasStartedUtterance: false,
    textBefore: '',
    textAfter: '',
    cursorPos: 0
  });
  const hasExecutedCommandThisSessionRef = useRef(false);
  const micStreamRef = useRef(null);

  const startMicStream = () => {
    if (micStreamRef.current) return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true
        }
      })
      .then((stream) => {
        micStreamRef.current = stream;
        console.log('Microphone configured for high sensitivity (AEC/NS disabled, AGC enabled).');
      })
      .catch((err) => {
        console.warn('Failed to configure microphone stream constraints:', err);
      });
    }
  };

  const stopMicStream = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        try { track.stop(); } catch (_) {}
      });
      micStreamRef.current = null;
      console.log('Microphone stream closed.');
    }
  };

  // Sync projectsRef with state
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Fetch projects on mount for dynamic voice routing
  useEffect(() => {
    getProjects()
      .then((data) => setProjects(data || []))
      .catch((err) => console.error('Failed to load projects for voice assistant:', err));
  }, []);

  // Keep ref in sync for event handlers and manage sensitivity mic stream
  useEffect(() => {
    isListeningRef.current = isListening;
    if (isListening) {
      startMicStream();
    } else {
      stopMicStream();
    }
    return () => {
      stopMicStream();
    };
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

  // Jaccard similarity function for fuzzy command matching
  const getSimilarity = (s1, s2) => {
    if (!s1 || !s2) return 0;
    const words1 = s1.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const words2 = s2.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    if (words1.length === 0 || words2.length === 0) return 0;
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  };

  // Text-To-Speech (TTS) Siri Voice feedback with Echo Prevention
  const speak = (msg) => {
    if ('speechSynthesis' in window) {
      isSpeakingRef.current = true;
      
      // Stop the microphone immediately before synthesis begins to prevent echo/feedback loops
      if (recognitionRef.current && isListeningRef.current) {
        try { 
          recognitionRef.current.abort(); 
        } catch (_) {}
      }
      shouldRestartOnSpeechEndRef.current = isListeningRef.current;

      // Clear previous utterance handlers and timeouts to prevent duplicate starts
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.onend = null;
        activeUtteranceRef.current.onerror = null;
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      activeUtteranceRef.current = utterance;
      
      // Prevent Chrome from garbage-collecting the utterance object mid-speech
      window.activeSpeechUtterances = window.activeSpeechUtterances || [];
      window.activeSpeechUtterances.push(utterance);
      
      // Dynamic safety timeout proportional to length of spoken text (approx 200 words per minute)
      const wordsCount = msg.split(/\s+/).length;
      const dynamicTimeout = Math.max(1500, (wordsCount * 450) + 1000);
      
      safetyTimeoutRef.current = setTimeout(() => {
        if (isSpeakingRef.current) {
          isSpeakingRef.current = false;
          window.activeSpeechUtterances = window.activeSpeechUtterances.filter(u => u !== utterance);
          if (shouldRestartOnSpeechEndRef.current) {
            restartListening();
          }
        }
      }, dynamicTimeout);

      const voices = cachedVoicesRef.current.length
        ? cachedVoicesRef.current
        : window.speechSynthesis.getVoices();
      const femaleKeywords = ['siri', 'samantha', 'zira', 'hazel', 'google us english', 'karen', 'tessa', 'female', 'en-us'];
      const maleKeywords = ['david', 'mark', 'george', 'ravi', 'male', 'guy', 'man', 'boy', 'sean', 'daniel', 'peter', 'hector', 'pavel'];
      const isMaleVoice = (v) => maleKeywords.some(m => v.name.toLowerCase().includes(m));
      let selectedVoice = null;
      for (const kw of femaleKeywords) {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes(kw) && !isMaleVoice(v));
        if (selectedVoice) break;
      }
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith('en') && !isMaleVoice(v));
      if (!selectedVoice) selectedVoice = voices.find(v => !isMaleVoice(v));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        const vn = selectedVoice.name.toLowerCase();
        // Slightly faster TTS rate to reduce perceived latency
        utterance.rate = (vn.includes('siri') || vn.includes('samantha')) ? 1.15 : 1.25;
        utterance.pitch = (vn.includes('siri') || vn.includes('samantha')) ? 1.0 : 1.15;
      } else {
        utterance.rate = 1.25;
        utterance.pitch = 1.15;
      }

      utterance.onend = () => {
        isSpeakingRef.current = false;
        window.activeSpeechUtterances = window.activeSpeechUtterances.filter(u => u !== utterance);
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        if (shouldRestartOnSpeechEndRef.current) {
          restartListening();
        }
        resetSilenceTimer();
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        window.activeSpeechUtterances = window.activeSpeechUtterances.filter(u => u !== utterance);
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        if (shouldRestartOnSpeechEndRef.current) {
          restartListening();
        }
        resetSilenceTimer();
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper to format spoken email text into a real email string
  const cleanSpokenEmail = (rawText) => {
    let text = rawText.trim().toLowerCase();
    const emailPrefixes = [/^(my email is|email is|it is|it\'s|email)\s+/gi];
    for (const rx of emailPrefixes) {
      text = text.replace(rx, '').trim();
    }
    // Phonetic replacements for characters
    text = text.replace(/at the rate of/gi, '@');
    text = text.replace(/at the rate/gi, '@');
    text = text.replace(/at\s+the\s+rate/gi, '@');
    text = text.replace(/underscore/gi, '_');
    text = text.replace(/dash/gi, '-');
    text = text.replace(/hyphen/gi, '-');
    return text
      .replace(/\s+/g, '') // remove spaces
      .replace(/at/gi, '@') // replace remaining "at" with "@"
      .replace(/dot/gi, '.') // replace "dot" with "."
      .toLowerCase();
  };

  // Helper to clean conversational prefixes for message and email dictation
  const cleanSpokenPrefixes = (rawText, isEmail) => {
    let text = rawText.trim();
    if (isEmail) {
      const emailPrefixes = [/^(my email is|email is|it is|it\'s|email)\s+/gi];
      for (const rx of emailPrefixes) {
        text = text.replace(rx, '').trim();
      }
      return text;
    } else {
      const msgPrefixes = [/^(my message is|message is|it is|it\'s|write|type|message)\s+/gi];
      for (const rx of msgPrefixes) {
        text = text.replace(rx, '').trim();
      }
      return text;
    }
  };

  // Helper to fill React inputs programmatically and dispatch input events
  const fillFormInput = (selector, value) => {
    const input = document.querySelector(selector);
    if (input) {
      isProgrammaticInputRef.current = true;
      input.value = value;
      // Dispatch input + change events so React state captures the changes
      const inputEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvent);
      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);
      isProgrammaticInputRef.current = false;
      return true;
    }
    return false;
  };

  // Reset assistant status back to listening or idle
  const resetStatusTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isListeningRef.current) {
        setStatus('listening');
        setTooltipText('Listening... Say a command');
        setTranscript('');
      } else {
        setStatus('idle');
        setTooltipText(getTooltipDefault());
      }
    }, 1500); // reduced from 3500ms → 1500ms for snappier UI reset
  };

  // Helper to restart speech recognition with a completely fresh instance
  // to avoid Chrome throttling/silencing bugs on reused objects
  const restartListening = () => {
    if (!isListeningRef.current) return;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.abort(); } catch (_) {}
    }
    // Delay of 100ms allows the browser's audio hardware threads to release cleanly before the next acquisition
    setTimeout(() => {
      if (!isListeningRef.current) return;
      const freshRec = createRecognition();
      recognitionRef.current = freshRec;
      if (freshRec) {
        try {
          freshRec.start();
        } catch (e) {
          console.warn('Failed to start speech recognition, retrying in 300ms:', e);
          setTimeout(() => {
            if (isListeningRef.current) {
              try { freshRec.start(); } catch (err) {
                console.error('Second attempt to start speech recognition failed:', err);
              }
            }
          }, 300);
        }
      }
    }, 100);
  };

  // 10 seconds inactivity timeout handler to auto turn off the voice assistant
  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (isListeningRef.current) {
      silenceTimerRef.current = setTimeout(() => {
        setIsListening(false);
        isListeningRef.current = false;
        conversationStateRef.current = 'idle';
        setStatus('idle');
        setTooltipText(getTooltipDefault());
        
        if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          try { recognitionRef.current.abort(); } catch (_) {}
        }
        
        const active = document.activeElement;
        if (active && (active.id === 'email' || active.id === 'message')) {
          active.blur();
        }

        speak("Voice assistant turned off due to inactivity.");
      }, 10000); // 10 seconds
    }
  };

  const matchAndExecuteInterimCommand = (candidates) => {
    if (isSpeakingRef.current) return false;

    const isDictatingEmail = conversationStateRef.current === 'dictating_email';
    const isDictatingMessage = conversationStateRef.current === 'dictating_message';
    const isAwaitingEmail = conversationStateRef.current === 'awaiting_email';
    const isAwaitingMessage = conversationStateRef.current === 'awaiting_message';
    const isAwaitingConfirmation = conversationStateRef.current === 'awaiting_send_confirmation';

    for (const rawCandidate of candidates) {
      const cleanCandidate = rawCandidate.trim().toLowerCase();
      if (!cleanCandidate) continue;

      // 1. Control Commands (Always matched, even during dictation)
      const isCancel = /^(cancel|stop|abort|turn\s*off|deactivate|shut\s*down|goodbye|exit)$/i.test(cleanCandidate);
      if (isCancel) {
        conversationStateRef.current = 'idle';
        setIsListening(false);
        isListeningRef.current = false;
        setStatus('idle');
        setTooltipText(getTooltipDefault());
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (_) {}
        }
        const active = document.activeElement;
        if (active && (active.id === 'email' || active.id === 'message')) {
          active.blur();
        }
        speak("Voice assistant turned off.");
        return true;
      }

      // Clear commands
      if (cleanCandidate === 'clear email' || cleanCandidate === 'clear email field') {
        fillFormInput('#email', '');
        dictationStateRef.current = { hasStartedUtterance: false, textBefore: '', textAfter: '', cursorPos: 0 };
        speak("Email field cleared.");
        setStatus('success');
        setTooltipText('Email cleared');
        resetStatusTimer();
        return true;
      }

      if (cleanCandidate === 'clear message' || cleanCandidate === 'clear query' || cleanCandidate === 'clear queries' || cleanCandidate === 'clear message field') {
        fillFormInput('#message', '');
        dictationStateRef.current = { hasStartedUtterance: false, textBefore: '', textAfter: '', cursorPos: 0 };
        speak("Message field cleared.");
        setStatus('success');
        setTooltipText('Message cleared');
        resetStatusTimer();
        return true;
      }

      if (cleanCandidate === 'clear form' || cleanCandidate === 'reset form') {
        fillFormInput('#email', '');
        fillFormInput('#message', '');
        dictationStateRef.current = { hasStartedUtterance: false, textBefore: '', textAfter: '', cursorPos: 0 };
        speak("Form cleared.");
        setStatus('success');
        setTooltipText('Form cleared');
        resetStatusTimer();
        return true;
      }

      // 2. Awaiting Confirmation Conversational Step
      if (isAwaitingConfirmation) {
        const isYes = /^(yes|send|submit|sure|yeah|ok|go\s*ahead)$/i.test(cleanCandidate) || cleanCandidate.includes('yes') || cleanCandidate.includes('send');
        const isNo = /^(no|cancel|don't|stop|edit)$/i.test(cleanCandidate) || cleanCandidate.includes('no') || cleanCandidate.includes('cancel');

        if (isYes) {
          const form = document.querySelector('form.msci-subscribe-form');
          if (form) {
            if (form.checkValidity()) {
              const submitBtn = form.querySelector('button[type="submit"], .msci-subscribe-btn');
              if (submitBtn) {
                submitBtn.click();
                conversationStateRef.current = 'idle';
                speak("Perfect, your message has been sent successfully!");
                setStatus('success');
                setTooltipText('Form submitted!');
                resetStatusTimer();
              }
            } else {
              form.reportValidity();
              speak("Please correct the validation errors in the form before sending.");
              setStatus('error');
              setTooltipText('Validation errors found');
              resetStatusTimer();
            }
          }
          return true;
        } else if (isNo) {
          conversationStateRef.current = 'idle';
          speak("Alright, I won't send it. You can edit the form manually.");
          setStatus('success');
          setTooltipText('Submission cancelled');
          resetStatusTimer();
          return true;
        }
      }

      // If user is dictating email or message, do not run navigation/greetings/etc. commands
      if (isDictatingEmail || isDictatingMessage || isAwaitingEmail || isAwaitingMessage) {
        continue;
      }

      // 3. Greetings, Identity, Creator Questions
      const isGreeting = /(^|\s)(hi|hello|hey|greetings|good\s+morning|good\s+afternoon|good\s+evening)(\s|$)/i.test(cleanCandidate);
      if (isGreeting) {
        speak("Greetings");
        setStatus('success');
        setTooltipText('Greetings');
        resetStatusTimer();
        return true;
      }

      const isIdentity = /(who\s+are\s+you|what\s+is\s+your\s+name|what\'s\s+your\s+name|your\s+name)/i.test(cleanCandidate);
      if (isIdentity) {
        speak("I'm voice assistant");
        setStatus('success');
        setTooltipText("I'm voice assistant");
        resetStatusTimer();
        return true;
      }

      const isCreator = /(who\s+created\s+you|who\s+made\s+you|who\s+built\s+you|who\s+is\s+your\s+creator|who\s+developed\s+you)/i.test(cleanCandidate);
      if (isCreator) {
        speak("Barath created Me");
        setStatus('success');
        setTooltipText("Barath created Me");
        resetStatusTimer();
        return true;
      }

      // 4. Form filling commands (e.g. "fill email test@gmail.com")
      const emailFillMatch = cleanCandidate.match(/^(fill\s+email|type\s+email|my\s+email\s+is|email\s+is)\s*(.*)$/i);
      if (emailFillMatch) {
        const val = emailFillMatch[2].trim();
        if (!val) {
          conversationStateRef.current = 'awaiting_email';
          const input = document.querySelector('#email');
          dictationBaseValueRef.current = input ? input.value : '';
          speak("Sure, what is your email address?");
          setStatus('listening');
          setTooltipText('Say your email address...');
        } else {
          const cleanedEmail = cleanSpokenEmail(val);
          fillFormInput('#email', cleanedEmail);
          conversationStateRef.current = 'awaiting_message';
          const input = document.querySelector('#message');
          dictationBaseValueRef.current = input ? input.value : '';
          speak(`Filled email. What is the message you'd like to send?`);
          setStatus('listening');
          setTooltipText('Say your message...');
        }
        return true;
      }

      const msgFillMatch = cleanCandidate.match(/^(fill\s+message|type\s+message|write\s+message|my\s+message\s+is|message\s+is|fill\s+queries|fill\s+query|type\s+query)\s*(.*)$/i);
      if (msgFillMatch) {
        const val = msgFillMatch[2].trim();
        if (!val) {
          conversationStateRef.current = 'awaiting_message';
          const input = document.querySelector('#message');
          dictationBaseValueRef.current = input ? input.value : '';
          speak("Sure, what is your message?");
          setStatus('listening');
          setTooltipText('Say your message...');
        } else {
          fillFormInput('#message', val);
          conversationStateRef.current = 'awaiting_send_confirmation';
          speak('Message entered. Would you like me to send it now?');
          setStatus('listening');
          setTooltipText('Say "yes" to send or "no" to edit');
        }
        return true;
      }

      // 5. Submit command (outside dictation/confirmation)
      if (cleanCandidate === 'submit' || cleanCandidate === 'send' || cleanCandidate === 'submit form' || cleanCandidate === 'send message') {
        const form = document.querySelector('form.msci-subscribe-form');
        if (form) {
          if (form.checkValidity()) {
            const submitBtn = form.querySelector('button[type="submit"], .msci-subscribe-btn');
            if (submitBtn) {
              submitBtn.click();
              speak('Perfect, your message has been sent successfully!');
              setStatus('success');
              setTooltipText('Form Submitted!');
              resetStatusTimer();
              return true;
            }
          } else {
            form.reportValidity();
            speak("Please correct the validation errors in the form before sending.");
            setStatus('error');
            setTooltipText('Validation errors found');
            resetStatusTimer();
            return true;
          }
        }
      }

      // 6. Project Opening Command (e.g. "open project ecommerce")
      const projectMatch = cleanCandidate.match(/^(open|go\s+to|show|view)?\s*project\s+(.+)$/i);
      if (projectMatch) {
        const projectQuery = projectMatch[2].trim();
        if (projectQuery && projectQuery.length > 1) {
          let bestProject = null;
          let bestProjectScore = 0;
          for (const p of projectsRef.current) {
            const cleanTitle = p.title.replace(/<[^>]*>/g, '').toLowerCase();
            const cleanId = p.id.toLowerCase();
            if (cleanTitle.includes(projectQuery) || projectQuery.includes(cleanTitle) || cleanId.includes(projectQuery)) {
              bestProject = p;
              bestProjectScore = 1.0;
              break;
            }
            const simTitle = getSimilarity(cleanTitle, projectQuery);
            const simId = getSimilarity(cleanId, projectQuery);
            const maxSim = Math.max(simTitle, simId);
            if (maxSim > bestProjectScore) {
              bestProjectScore = maxSim;
              bestProject = p;
            }
          }
          if (bestProject && bestProjectScore > 0.35) {
            navigate(`/project/${bestProject.id}`);
            const cleanTitleText = bestProject.title.replace(/<[^>]*>/g, '');
            speak(`Opening project ${cleanTitleText}`);
            setStatus('success');
            setTooltipText(`Navigated to ${cleanTitleText}!`);
            resetStatusTimer();
            return true;
          }
        }
      }

      // 7. General Navigation & Control Intents (Phonetic and Phrasal matching)
      const INTERIM_COMMANDS = [
        {
          cmd: 'scroll to top',
          pattern: /^(go\s+to\s+)?(top|home|up)$/i,
          phrasePattern: /(scroll\s+(to\s+)?top|go\s+home|back\s+to\s+top|scroll\s+up|move\s+(to\s+)?top|go\s+(to\s+)?start)/i,
          action: () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.location.pathname !== '/') navigate('/');
            speak('Scrolling to top.');
            setStatus('success');
            setTooltipText('Scrolled to top!');
            resetStatusTimer();
          }
        },
        {
          cmd: 'scroll to bottom',
          pattern: /^(go\s+to\s+)?(bottom|down)$/i,
          phrasePattern: /(scroll\s+(to\s+)?bottom|scroll\s+down|move\s+(to\s+)?bottom|go\s+(to\s+)?end)/i,
          action: () => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            speak('Scrolling to bottom.');
            setStatus('success');
            setTooltipText('Scrolled to bottom!');
            resetStatusTimer();
          }
        },
        {
          cmd: 'dark mode',
          pattern: /^(dark|dock|duck|dart|dirt|back|arc|night)(\s*mode)?$/i,
          phrasePattern: /((dark|dock|duck|dart|dirt|back|arc)\s*(mode)?|night\s*mode|go\s*dark)/i,
          action: () => {
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme !== 'dark') {
              const themeBtn = document.querySelector('.theme-btn');
              if (themeBtn) themeBtn.click();
            }
            speak('Switching theme to dark mode.');
            setStatus('success');
            setTooltipText('Switched to Dark Mode!');
            resetStatusTimer();
          }
        },
        {
          cmd: 'light mode',
          pattern: /^(light|like|lite|right|white|line|day)(\s*mode)?$/i,
          phrasePattern: /((light|like|lite|right|white|line)\s*(mode)?|day\s*mode|go\s*light)/i,
          action: () => {
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme !== 'light') {
              const themeBtn = document.querySelector('.theme-btn');
              if (themeBtn) themeBtn.click();
            }
            speak('Switching theme to light mode.');
            setStatus('success');
            setTooltipText('Switched to Light Mode!');
            resetStatusTimer();
          }
        },
        {
          cmd: 'contact',
          pattern: /^(contact|connect|content|conduct|contract|context|hire|mail|reach)$/i,
          phrasePattern: /(go\s+to\s+contact|scroll\s+to\s+contact|show\s+contact|get\s+in\s+touch|hire\s+me|message\s+form|reach\s+out|mail)/i,
          action: () => navigateAndScroll('contact', 'Contact')
        },
        {
          cmd: 'skills',
          pattern: /^(skills|skill|kill|scale|school|skulls|spills|tech|stack|programming)$/i,
          phrasePattern: /(go\s+to\s+skills|scroll\s+to\s+skills|show\s+skills|competence|technology|stack|programming)/i,
          action: () => navigateAndScroll('skills', 'Skills')
        },
        {
          cmd: 'projects',
          pattern: /^(projects|project|product|protect|objects|rejects|portfolio|work|showcase)$/i,
          phrasePattern: /(go\s+to\s+projects|scroll\s+to\s+projects|show\s+projects|portfolio|showcase|recent\s+work)/i,
          action: () => navigateAndScroll('projects', 'Projects')
        },
        {
          cmd: 'milestone',
          pattern: /^(milestones|milestone|miles|stone|education|academic|career|timeline|experience)$/i,
          phrasePattern: /(go\s+to\s+milestone|show\s+milestone|go\s+to\s+education|academic|career|timeline|experience|history)/i,
          action: () => navigateAndScroll('education', 'Milestones')
        },
        {
          cmd: 'about',
          pattern: /^(about|out|bout|above|amount|profile|bio|biography|yourself)$/i,
          phrasePattern: /(go\s+to\s+about|scroll\s+to\s+about|show\s+about|about\s+me)/i,
          action: () => navigateAndScroll('about', 'About Me')
        }
      ];

      for (const item of INTERIM_COMMANDS) {
        if (item.pattern.test(cleanCandidate) || item.phrasePattern.test(cleanCandidate)) {
          item.action();
          return true;
        }
      }
    }

    return false;
  };

  const createRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    // Set to local browser language for high accuracy regional accents
    rec.lang = navigator.language || 'en-US';
    rec.maxAlternatives = 5; // Collect up to 5 transcription candidates for better accuracy

    rec.onstart = () => {
      networkRetryCountRef.current = 0; // Reset on any successful start
      if (networkRetryTimerRef.current) {
        clearTimeout(networkRetryTimerRef.current);
        networkRetryTimerRef.current = null;
      }
      setStatus('listening');
      setTooltipText('Listening... Say a command');
      setTranscript('');
      dictationStateRef.current.hasStartedUtterance = false;
      hasExecutedCommandThisSessionRef.current = false;
      resetSilenceTimer();
    };

    rec.onresult = (event) => {
      resetSilenceTimer();
      let interim = '';
      let finalAlternatives = [];
      let rawFinalAlternatives = [];
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          for (let j = 0; j < event.results[i].length; j++) {
            finalAlternatives.push(event.results[i][j].transcript.toLowerCase().trim());
            rawFinalAlternatives.push(event.results[i][j].transcript);
          }
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const currentText = rawFinalAlternatives[0] || interim;
      if (currentText) {
        setTranscript(currentText);
        setTooltipText(`"${currentText}"`);
      }

      // Collect all possible transcript candidates for instant matching (helps with low voice/phonetic errors)
      let candidates = [];
      if (rawFinalAlternatives.length > 0) {
        candidates = rawFinalAlternatives.map(c => c.toLowerCase().trim());
      }
      const primarySpoken = (rawFinalAlternatives[0] || interim).toLowerCase().trim();
      if (primarySpoken && !candidates.includes(primarySpoken)) {
        candidates.push(primarySpoken);
      }

      if (candidates.length > 0 && !hasExecutedCommandThisSessionRef.current && !isSpeakingRef.current) {
        const wasExecuted = matchAndExecuteInterimCommand(candidates);
        if (wasExecuted) {
          hasExecutedCommandThisSessionRef.current = true;
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch (_) {}
          }
          return;
        }
      }

      // Check for direct input dictation or conversational state-based input dictation
      const isDictatingEmail = conversationStateRef.current === 'dictating_email';
      const isDictatingMessage = conversationStateRef.current === 'dictating_message';
      const isAwaitingEmail = conversationStateRef.current === 'awaiting_email';
      const isAwaitingMessage = conversationStateRef.current === 'awaiting_message';

      if (isDictatingEmail || isDictatingMessage || isAwaitingEmail || isAwaitingMessage) {
        const selector = (isDictatingEmail || isAwaitingEmail) ? '#email' : '#message';
        const isEmail = isDictatingEmail || isAwaitingEmail;
        const input = document.querySelector(selector);

        if (input) {
          if (!dictationStateRef.current.hasStartedUtterance) {
            let start = input.selectionStart || 0;
            let end = input.selectionEnd || 0;
            if (document.activeElement !== input) {
              start = input.value.length;
              end = input.value.length;
            }
            dictationStateRef.current = {
              hasStartedUtterance: true,
              textBefore: input.value.substring(0, start),
              textAfter: input.value.substring(end),
              cursorPos: start
            };
          }

          if (rawFinalAlternatives.length > 0) {
            let rawFinal = rawFinalAlternatives[0];
            if (isAwaitingEmail || isAwaitingMessage) {
              rawFinal = cleanSpokenPrefixes(rawFinal, isEmail);
            }

            let cleanedFinal = rawFinal;
            if (isEmail) {
              cleanedFinal = cleanSpokenEmail(rawFinal);
            } else {
              const beforeTrimmed = dictationStateRef.current.textBefore.trim();
              if (beforeTrimmed === '' || beforeTrimmed.endsWith('.') || beforeTrimmed.endsWith('!') || beforeTrimmed.endsWith('?')) {
                cleanedFinal = rawFinal.trim().charAt(0).toUpperCase() + rawFinal.trim().slice(1);
              }
            }

            const spaceBefore = (dictationStateRef.current.textBefore && !dictationStateRef.current.textBefore.endsWith(' ') && !dictationStateRef.current.textBefore.endsWith('\n') && !cleanedFinal.startsWith(' ') && !isEmail) ? ' ' : '';
            const newVal = dictationStateRef.current.textBefore + spaceBefore + cleanedFinal + dictationStateRef.current.textAfter;

            fillFormInput(selector, newVal);
            setTranscript(newVal);
            setTooltipText(`Dictated: "${cleanedFinal}"`);

            const newPos = dictationStateRef.current.textBefore.length + spaceBefore.length + cleanedFinal.length;
            input.setSelectionRange(newPos, newPos);

            dictationStateRef.current.hasStartedUtterance = false;

            if (isDictatingEmail || isDictatingMessage) {
              return; // return early so commands are not processed
            }
          } else if (interim) {
            let rawInterim = interim;
            if (isAwaitingEmail || isAwaitingMessage) {
              rawInterim = cleanSpokenPrefixes(rawInterim, isEmail);
            }

            let cleanedInterim = rawInterim;
            if (isEmail) {
              cleanedInterim = cleanSpokenEmail(rawInterim);
            }

            const spaceBefore = (dictationStateRef.current.textBefore && !dictationStateRef.current.textBefore.endsWith(' ') && !dictationStateRef.current.textBefore.endsWith('\n') && !cleanedInterim.startsWith(' ') && !isEmail) ? ' ' : '';
            const newVal = dictationStateRef.current.textBefore + spaceBefore + cleanedInterim + dictationStateRef.current.textAfter;

            fillFormInput(selector, newVal);
            setTranscript(newVal);
            setTooltipText(`Hearing: "${cleanedInterim}"`);

            const newPos = dictationStateRef.current.textBefore.length + spaceBefore.length + cleanedInterim.length;
            input.setSelectionRange(newPos, newPos);

            return; // Interim results always return early
          }
        }
      }

      if (rawFinalAlternatives.length > 0 && !hasExecutedCommandThisSessionRef.current) {
        const bestMatch = pickBestAlternative(finalAlternatives);
        processCommand(bestMatch);
      }
    };

    rec.onerror = (event) => {
      if (event.error === 'not-allowed') {
        // Permanent failure — user denied microphone access
        setStatus('error');
        setTooltipText('Microphone permission denied');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'network') {
        // Transient failure — Chrome's network connection to Google Speech dropped
        // We silently create a new fresh instance and retry. No error is shown to user.
        networkRetryCountRef.current += 1;
        if (networkRetryCountRef.current <= 5) {
          // Exponential backoff: wait 800ms * retry count before next attempt
          const backoff = Math.min(800 * networkRetryCountRef.current, 4000);
          networkRetryTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              const newRec = createRecognition();
              if (newRec) {
                // Clear old instance handlers to prevent stale callbacks
                if (recognitionRef.current) {
                  recognitionRef.current.onend = null;
                  recognitionRef.current.onerror = null;
                }
                recognitionRef.current = newRec;
                try {
                  newRec.start();
                } catch (e) {
                  // ignore start race
                }
              }
            }
          }, backoff);
        } else {
          // Exceeded max silent retries — stop and inform user
          setStatus('error');
          setTooltipText('Network error. Please check your connection.');
          setIsListening(false);
          isListeningRef.current = false;
          networkRetryCountRef.current = 0;
        }
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        // Unknown error
        setStatus('error');
        setTooltipText(`Error: ${event.error}`);
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    rec.onend = () => {
      if (isListeningRef.current) {
        if (!isSpeakingRef.current && networkRetryTimerRef.current === null) {
          // Restart immediately with a fresh instance
          restartListening();
        }
      } else {
        setStatus('idle');
        setTooltipText(getTooltipDefault());
      }
    };

    return rec;
  };

  // Pre-cache voices at mount time
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        cachedVoicesRef.current = voices;
      }
    };
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setTooltipText('Speech recognition not supported in this browser');
      return;
    }

    const rec = createRecognition();
    recognitionRef.current = rec;

    return () => {
      if (networkRetryTimerRef.current) {
        clearTimeout(networkRetryTimerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      }
    };
  }, []);



  // All known command signal words — used to score speech alternatives
  const COMMAND_SIGNALS = [
    'top', 'home', 'bottom', 'up', 'down',
    'dark', 'night', 'light', 'day',
    'about', 'biography', 'bio', 'profile', 'yourself',
    'milestone', 'education', 'academic', 'career', 'timeline', 'experience', 'background',
    'project', 'portfolio', 'work', 'showcase', 'open', 'show', 'view',
    'skill', 'technology', 'stack', 'programming', 'language',
    'contact', 'hire', 'reach', 'mail', 'send', 'message', 'submit',
    'email', 'fill', 'type', 'write',
    'help', 'command', 'what',
    'scroll', 'navigate', 'go',
    'yes', 'no', 'yeah', 'ok', 'sure', 'cancel', 'stop', 'reset', 'abort',
  ];

  // Pick the speech alternative that contains the most command signal words.
  // Falls back to the first (highest-confidence) result if no signals match.
  const pickBestAlternative = (alternatives) => {
    if (alternatives.length === 1) return alternatives[0];
    let bestScore = -1;
    let bestText = alternatives[0];
    for (const alt of alternatives) {
      const words = alt.toLowerCase().split(/\s+/);
      const score = words.filter(w => COMMAND_SIGNALS.includes(w)).length;
      if (score > bestScore) {
        bestScore = score;
        bestText = alt;
      }
    }
    return bestText;
  };

  // Process Speech Commands
  const processCommand = (commandText) => {
    let text = commandText.trim().toLowerCase();

    // -------------------------------------------------------------
    // MULTI-TURN CONVERSATIONAL FLOW HANDLER
    // -------------------------------------------------------------
    // Handle cancel/abort command at any time
    if (text === 'cancel' || text === 'stop' || text === 'reset' || text === 'go back' || text === 'abort') {
      conversationStateRef.current = 'idle';
      speak("Command cancelled.");
      setStatus('idle');
      setTooltipText(getTooltipDefault());
      resetStatusTimer();
      return;
    }

    if (conversationStateRef.current === 'awaiting_email') {
      // Input has already been filled in onresult! We just transition to the next state.
      conversationStateRef.current = 'awaiting_message';
      const input = document.querySelector('#message');
      dictationBaseValueRef.current = input ? input.value : '';
      speak("Got it! I have filled your email. What is the message you would like to send?");
      setStatus('listening');
      setTooltipText('Say your message...');
      return;
    }

    if (conversationStateRef.current === 'awaiting_message') {
      // Input has already been filled in onresult! We just transition to confirmation.
      conversationStateRef.current = 'awaiting_send_confirmation';
      speak("Great, I've written your message down. Would you like me to send it now?");
      setStatus('listening');
      setTooltipText('Say "yes" to send or "no" to cancel');
      return;
    }

    if (conversationStateRef.current === 'awaiting_send_confirmation') {
      if (text.includes('yes') || text.includes('send') || text.includes('submit') || text.includes('sure') || text.includes('yeah') || text.includes('ok') || text.includes('go ahead')) {
        const form = document.querySelector('form.msci-subscribe-form');
        if (form) {
          if (form.checkValidity()) {
            const submitBtn = form.querySelector('button[type="submit"], .msci-subscribe-btn');
            if (submitBtn) {
              submitBtn.click();
              conversationStateRef.current = 'idle';
              speak("Perfect, your message has been sent successfully!");
              setStatus('success');
              setTooltipText('Form submitted!');
              resetStatusTimer();
            } else {
              conversationStateRef.current = 'idle';
              speak("Sorry, I couldn't find the submit button to send the form.");
              setStatus('error');
              resetStatusTimer();
            }
          } else {
            form.reportValidity();
            speak("Please correct the validation errors in the form before sending.");
            setStatus('error');
            setTooltipText('Validation errors found');
            resetStatusTimer();
          }
        } else {
          conversationStateRef.current = 'idle';
          speak("Sorry, I couldn't find the contact form to submit.");
          setStatus('error');
          resetStatusTimer();
        }
        return;
      } else if (text.includes('no') || text.includes('cancel') || text.includes('don\'t') || text.includes('stop') || text.includes('edit')) {
        conversationStateRef.current = 'idle';
        speak("Alright, I won't send it. You can edit the form manually.");
        setStatus('success');
        setTooltipText('Submission cancelled');
        resetStatusTimer();
        return;
      }
    }

    // Helper function for navigating and scrolling
    const navigateAndScroll = (id, label) => {
      const element = document.getElementById(id);
      if (element) {
        if (window.location.pathname !== '/') {
          navigate('/');
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        speak(`Navigated to ${label}`);
        setStatus('success');
        setTooltipText(`Navigated to ${label}!`);
        resetStatusTimer();
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        speak(`Navigated to ${label}`);
        setStatus('success');
        setTooltipText(`Navigated to ${label}!`);
        resetStatusTimer();
      }
    };

    // Standard command normalization
    const fillerWords = [/^(please|can you|could you|would you|hey|assistant|voice assistant|buddy|tell me|go|move|scroll)\s+/gi, /\s+(please|now|thanks|thank you)$/gi];
    for (const rx of fillerWords) {
      text = text.replace(rx, '').trim();
    }

    // 1. HELP COMMAND MATCH
    if (
      text.includes('help') || 
      text.includes('what can i say') || 
      text.includes('commands') || 
      text.includes('what do you do')
    ) {
      speak('You can navigate by saying scroll to top, scroll to bottom, go to about, or switch to dark mode. You can also say fill email or open project followed by the project name.');
      setStatus('success');
      setTooltipText('Guide read aloud!');
      resetStatusTimer();
      return;
    }

    // 2. THEME SWITCHING MATCH
    const isDarkModeCmd = text.includes('dark') || text.includes('night') || text.includes('black mode') || text.includes('go dark');
    const isLightModeCmd = text.includes('light') || text.includes('day') || text.includes('white mode') || text.includes('go light');

    if (isDarkModeCmd && !isLightModeCmd) {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme !== 'dark') {
        const themeBtn = document.querySelector('.theme-btn');
        if (themeBtn) {
          themeBtn.click();
          speak('Switching theme to dark mode.');
          setStatus('success');
          setTooltipText('Switched to Dark Mode!');
          resetStatusTimer();
          return;
        }
      } else {
        speak('System is already in dark mode.');
        setStatus('success');
        setTooltipText('Already in Dark Mode!');
        resetStatusTimer();
        return;
      }
    }

    if (isLightModeCmd && !isDarkModeCmd) {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme !== 'light') {
        const themeBtn = document.querySelector('.theme-btn');
        if (themeBtn) {
          themeBtn.click();
          speak('Switching theme to light mode.');
          setStatus('success');
          setTooltipText('Switched to Light Mode!');
          resetStatusTimer();
          return;
        }
      } else {
        speak('System is already in light mode.');
        setStatus('success');
        setTooltipText('Already in Light Mode!');
        resetStatusTimer();
        return;
      }
    }

    // 3. SCROLL TOP/BOTTOM MATCH
    const isScrollTop = text.includes('top') || text.includes('home') || text === 'up';
    const isScrollBottom = text.includes('bottom') || text === 'down';

    if (isScrollTop && !isScrollBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/') {
        navigate('/');
      }
      speak('Scrolling to top.');
      setStatus('success');
      setTooltipText('Scrolled to top!');
      resetStatusTimer();
      return;
    }

    if (isScrollBottom && !isScrollTop) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      speak('Scrolling to bottom.');
      setStatus('success');
      setTooltipText('Scrolled to bottom!');
      resetStatusTimer();
      return;
    }

    // 4. SECTION NAVIGATION MATCH (direct checks)
    const sections = [
      { 
        keywords: ['about', 'who are you', 'yourself', 'biography', 'bio', 'profile', 'about me'], 
        id: 'about', 
        label: 'About Me' 
      },
      { 
        keywords: ['milestone', 'education', 'academic', 'career', 'timeline', 'experience', 'history', 'background'], 
        id: 'education', 
        label: 'Milestones' 
      },
      { 
        keywords: ['project', 'recent', 'portfolio', 'work', 'my work', 'showcase'], 
        id: 'projects', 
        label: 'Projects' 
      },
      { 
        keywords: ['skill', 'competenc', 'technolog', 'stack', 'what do you know', 'programming', 'language'], 
        id: 'skills', 
        label: 'Skills' 
      },
      { 
        keywords: ['contact', 'get in touch', 'hire', 'message', 'send message', 'reach out', 'mail'], 
        id: 'contact', 
        label: 'Contact' 
      }
    ];

    let matchedSection = null;
    for (const sec of sections) {
      if (sec.keywords.some((keyword) => text.includes(keyword))) {
        matchedSection = sec;
        break;
      }
    }

    if (matchedSection) {
      navigateAndScroll(matchedSection.id, matchedSection.label);
      return;
    }

    // 5. CONTACT FORM FILLING COMMAND MATCH
    if (text.startsWith('fill email') || text.startsWith('type email') || text.startsWith('email is') || text.includes('my email is')) {
      let rawEmail = text;
      const emailPrefixes = ['fill email', 'type email', 'my email is', 'email is'];
      for (const p of emailPrefixes) {
        if (rawEmail.includes(p)) {
          rawEmail = rawEmail.substring(rawEmail.indexOf(p) + p.length).trim();
          break;
        }
      }
      
      if (!rawEmail) {
        conversationStateRef.current = 'awaiting_email';
        const input = document.querySelector('#email');
        dictationBaseValueRef.current = input ? input.value : '';
        speak("Sure, what is your email address?");
        setStatus('listening');
        setTooltipText('Say your email address...');
        return;
      }

      const cleanedEmail = cleanSpokenEmail(rawEmail);
      const success = fillFormInput('#email', cleanedEmail);
      if (success) {
        conversationStateRef.current = 'awaiting_message';
        const input = document.querySelector('#message');
        dictationBaseValueRef.current = input ? input.value : '';
        speak(`Filled email. What is the message you'd like to send?`);
        setStatus('listening');
        setTooltipText('Say your message...');
        return;
      }
    }

    if (text.startsWith('type message') || text.startsWith('fill message') || text.startsWith('write message') || text.startsWith('message is') || text.includes('my message is')) {
      let rawMsg = text;
      const msgPrefixes = ['type message', 'fill message', 'write message', 'my message is', 'message is'];
      for (const p of msgPrefixes) {
        if (rawMsg.includes(p)) {
          rawMsg = rawMsg.substring(rawMsg.indexOf(p) + p.length).trim();
          break;
        }
      }

      if (!rawMsg) {
        conversationStateRef.current = 'awaiting_message';
        const input = document.querySelector('#message');
        dictationBaseValueRef.current = input ? input.value : '';
        speak("Sure, what is your message?");
        setStatus('listening');
        setTooltipText('Say your message...');
        return;
      }

      const success = fillFormInput('#message', rawMsg);
      if (success) {
        conversationStateRef.current = 'awaiting_send_confirmation';
        speak('Message entered. Would you like me to send it now?');
        setStatus('listening');
        setTooltipText('Say "yes" to send or "no" to edit');
        return;
      }
    }

    if (text.includes('submit') || text.includes('send')) {
      const form = document.querySelector('form.msci-subscribe-form');
      if (form) {
        if (form.checkValidity()) {
          const submitBtn = form.querySelector('button[type="submit"], .msci-subscribe-btn');
          if (submitBtn) {
            submitBtn.click();
            speak('Perfect, your message has been sent successfully!');
            setStatus('success');
            setTooltipText('Form Submitted!');
            resetStatusTimer();
            return;
          }
        } else {
          form.reportValidity();
          speak("Please correct the validation errors in the form before sending.");
          setStatus('error');
          setTooltipText('Validation errors found');
          resetStatusTimer();
          return;
        }
      }
    }

    // 6. DYNAMIC PROJECT MATCHING & ROUTING
    let projectQuery = text;
    const openProjectPrefixes = ['open project', 'go to project', 'show project', 'view project', 'open', 'show', 'view', 'project'];
    for (const prefix of openProjectPrefixes) {
      if (projectQuery.startsWith(prefix + ' ')) {
        projectQuery = projectQuery.substring(prefix.length + 1).trim();
        break;
      }
    }

    if (projectQuery && projectQuery.length > 1) {
      let bestProject = null;
      let bestProjectScore = 0;

      for (const p of projectsRef.current) {
        const cleanTitle = p.title.replace(/<[^>]*>/g, '').toLowerCase();
        const cleanId = p.id.toLowerCase();
        
        // Exact / substring match logic
        if (cleanTitle.includes(projectQuery) || projectQuery.includes(cleanTitle) || cleanId.includes(projectQuery)) {
          bestProject = p;
          bestProjectScore = 1.0;
          break;
        }

        // Fuzzy matching logic
        const simTitle = getSimilarity(cleanTitle, projectQuery);
        const simId = getSimilarity(cleanId, projectQuery);
        const maxSim = Math.max(simTitle, simId);
        if (maxSim > bestProjectScore) {
          bestProjectScore = maxSim;
          bestProject = p;
        }
      }

      if (bestProject && bestProjectScore > 0.35) {
        navigate(`/project/${bestProject.id}`);
        const cleanTitleText = bestProject.title.replace(/<[^>]*>/g, '');
        speak(`Opening project ${cleanTitleText}`);
        setStatus('success');
        setTooltipText(`Navigated to ${cleanTitleText}!`);
        resetStatusTimer();
        return;
      }
    }

    // 7. FUZZY COMMAND FALLBACK OVER ALL GENERAL INTENTS
    const INTENT_PHRASES = [
      { id: 'scroll_top', phrases: ['scroll to top', 'go to top', 'go home', 'back to top', 'scroll up', 'go to start', 'scroll top', 'move to top'], action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.location.pathname !== '/') navigate('/');
        speak('Scrolling to top.');
        setStatus('success');
        setTooltipText('Scrolled to top!');
        resetStatusTimer();
      }},
      { id: 'scroll_bottom', phrases: ['scroll to bottom', 'go to bottom', 'scroll down', 'go to end', 'scroll bottom', 'move to bottom'], action: () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        speak('Scrolling to bottom.');
        setStatus('success');
        setTooltipText('Scrolled to bottom!');
        resetStatusTimer();
      }},
      { id: 'dark_mode', phrases: ['dark mode', 'switch to dark', 'turn dark', 'go dark', 'black mode', 'night mode', 'enable dark mode'], action: () => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme !== 'dark') {
          const themeBtn = document.querySelector('.theme-btn');
          if (themeBtn) themeBtn.click();
        }
        speak('Switching theme to dark mode.');
        setStatus('success');
        setTooltipText('Switched to Dark Mode!');
        resetStatusTimer();
      }},
      { id: 'light_mode', phrases: ['light mode', 'switch to light', 'turn light', 'go light', 'white mode', 'day mode', 'enable light mode'], action: () => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme !== 'light') {
          const themeBtn = document.querySelector('.theme-btn');
          if (themeBtn) themeBtn.click();
        }
        speak('Switching theme to light mode.');
        setStatus('success');
        setTooltipText('Switched to Light Mode!');
        resetStatusTimer();
      }},
      { id: 'about', phrases: ['go to about', 'scroll to about', 'show about', 'about me', 'who are you', 'yourself', 'biography', 'bio', 'profile'], action: () => navigateAndScroll('about', 'About Me') },
      { id: 'education', phrases: ['go to milestones', 'show milestones', 'go to education', 'milestones', 'education', 'academic', 'career', 'timeline', 'experience', 'history', 'background'], action: () => navigateAndScroll('education', 'Milestones') },
      { id: 'projects', phrases: ['go to projects', 'scroll to projects', 'show projects', 'projects', 'recent work', 'portfolio', 'showcase'], action: () => navigateAndScroll('projects', 'Projects') },
      { id: 'skills', phrases: ['go to skills', 'scroll to skills', 'show skills', 'skills', 'competence', 'technology', 'stack', 'programming languages'], action: () => navigateAndScroll('skills', 'Skills') },
      { id: 'contact', phrases: ['go to contact', 'scroll to contact', 'show contact', 'contact', 'get in touch', 'hire me', 'message form', 'reach out', 'mail'], action: () => navigateAndScroll('contact', 'Contact') }
    ];

    let bestIntent = null;
    let bestIntentScore = 0;

    // 1. Direct contains check (highly sensitive for low volume / soft voice shorthand)
    for (const intent of INTENT_PHRASES) {
      for (const phrase of intent.phrases) {
        if (text === phrase || text.includes(phrase) || phrase.includes(text)) {
          bestIntent = intent;
          bestIntentScore = 1.0;
          break;
        }
      }
      if (bestIntentScore === 1.0) break;
    }

    // 2. Fuzzy fallback
    if (!bestIntent) {
      for (const intent of INTENT_PHRASES) {
        for (const phrase of intent.phrases) {
          const sim = getSimilarity(phrase, text);
          if (sim > bestIntentScore) {
            bestIntentScore = sim;
            bestIntent = intent;
          }
        }
      }
    }

    if (bestIntent && (bestIntentScore > 0.35)) {
      bestIntent.action();
      return;
    }

    // Command unrecognized
    speak("Talk Regarding Portfolio");
    setStatus('error');
    setTooltipText(`Unrecognized: "${transcript || commandText}"`);
    resetStatusTimer();
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setStatus('error');
      setTooltipText('Speech recognition not supported in this browser');
      setShowTooltip(true);
      return;
    }

    if (isListening) {
      // Turn OFF — stop the current session
      setIsListening(false);
      isListeningRef.current = false;
      conversationStateRef.current = 'idle';
      hasExecutedCommandThisSessionRef.current = false;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      try { recognitionRef.current.stop(); } catch (_) {}
    } else {
      // Turn ON — always create a fresh instance so Chrome never throttles
      setIsListening(true);
      isListeningRef.current = true;
      hasExecutedCommandThisSessionRef.current = false;

      // If active cursor is already inside the contact form inputs, enter dictation mode immediately
      const active = document.activeElement;
      if (active && (active.id === 'email' || active.id === 'message')) {
        conversationStateRef.current = `dictating_${active.id}`;
        dictationBaseValueRef.current = active.value || '';
        dictationStateRef.current.hasStartedUtterance = false;
        
        setStatus('listening');
        setTooltipText(`Dictating to ${active.id === 'email' ? 'email' : 'queries'}...`);
        restartListening();
      } else {
        conversationStateRef.current = 'idle';
        if ('speechSynthesis' in window) {
          speak("Hello, this is Voice Assistant, what's up??");
        } else {
          restartListening();
        }
      }
    }
  };

  // Keyboard shortcut listener (Ctrl + V)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        const active = document.activeElement;
        const isInput = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable
        );

        if (!isInput) {
          e.preventDefault();
          toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening]);

  // Focus-to-Dictate listener for Form Inputs
  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      if (target && (target.id === 'email' || target.id === 'message')) {
        // Do not auto-start voice assistant blindly on focus.
        // Only switch to dictation state if the assistant has already been turned on.
        if (isListeningRef.current) {
          conversationStateRef.current = `dictating_${target.id}`;
          dictationBaseValueRef.current = target.value || '';
          dictationStateRef.current.hasStartedUtterance = false;
          hasExecutedCommandThisSessionRef.current = false;
          
          setStatus('listening');
          setTooltipText(`Dictating to ${target.id === 'email' ? 'email' : 'queries'}...`);
        }
      }
    };

    const handleFocusOut = (e) => {
      const target = e.target;
      if (target && (target.id === 'email' || target.id === 'message')) {
        if (conversationStateRef.current === `dictating_${target.id}`) {
          conversationStateRef.current = 'idle';
          setIsListening(false);
          isListeningRef.current = false;
          setStatus('idle');
          setTooltipText(getTooltipDefault());
          dictationStateRef.current.hasStartedUtterance = false;
          hasExecutedCommandThisSessionRef.current = false;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (_) {}
          }
        }
      }
    };

    const handleInput = (e) => {
      if (isProgrammaticInputRef.current) return;
      const target = e.target;
      if (target && (target.id === 'email' || target.id === 'message')) {
        if (conversationStateRef.current === `dictating_${target.id}`) {
          dictationBaseValueRef.current = target.value || '';
          dictationStateRef.current.hasStartedUtterance = false;
          hasExecutedCommandThisSessionRef.current = false;
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('input', handleInput);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('input', handleInput);
    };
  }, []);

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
            <span className="transcript-preview" style={{ fontStyle: 'normal' }}>Heard: {transcript}</span>
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
      </button>
    </div>
  );
}

export default VoiceAssistant;
