import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomeHero from './components/HomeHero';
import ProjectDetail from './components/ProjectDetail';
import Footer from './components/Footer';
import Intro from './components/Intro';
import CustomCursor from './components/CustomCursor';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const location = useLocation();

  useEffect(() => {
    // Redirect to root if refreshed with a hash
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Short delay to ensure elements are rendered
    const timeoutId = setTimeout(() => {
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [location.pathname, showIntro]);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showIntro]);

  return (
    <>
      <CustomCursor />
      {showIntro && <Intro onFinish={() => setShowIntro(false)} />}
      <Navbar toggleTheme={toggleTheme} theme={theme} />
      <main className="main-wrapper">
        <Routes>
          <Route path="/" element={<HomeHero />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
