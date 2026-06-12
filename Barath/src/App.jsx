import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomeHero from './components/HomeHero';
import ProjectDetail from './components/ProjectDetail';
import Footer from './components/Footer';
import Intro from './components/Intro';
import CustomCursor from './components/CustomCursor';
import VoiceAssistant from './components/VoiceAssistant';
import Login from './components/Login';
import ProtectedRoute from './admin/ProtectedRoute';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import UploadProject from './admin/UploadProject';
import Trash from './admin/Trash';
import { useAdminAuth } from './context/AdminAuthContext';
import { purgePersistedAdminAuth } from './utils/adminAuth';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });
  const location = useLocation();
  const { logout } = useAdminAuth();

  useEffect(() => {
    purgePersistedAdminAuth();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (!path.startsWith('/admin') && path !== '/login') {
      logout({ skipGoogle: true });
    }
  }, [location.pathname, logout]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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

  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isProjectPage = location.pathname.startsWith('/project/');
  const isPortalPage = isLoginPage || isAdminPage;
  const hideHeaderFooter = isPortalPage || isProjectPage;

  useEffect(() => {
    if (isPortalPage) {
      document.body.style.overflow = 'auto';
    } else if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showIntro, isPortalPage]);

  return (
    <>
      {!isPortalPage && showIntro && <Intro onFinish={() => setShowIntro(false)} />}
      {!hideHeaderFooter && <Navbar toggleTheme={toggleTheme} theme={theme} />}
      
      {isAdminPage ? (
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadProject />} />
            <Route path="trash" element={<Trash />} />
          </Route>
        </Routes>
      ) : (
        <main className="main-wrapper">
          <Routes>
            <Route path="/" element={<HomeHero />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      )}
      
      {!hideHeaderFooter && <Footer />}
      {!isAdminPage && <CustomCursor />}
      {!isAdminPage && <VoiceAssistant />}
    </>
  );
}

export default App;

