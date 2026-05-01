import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ toggleTheme, theme }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));
  const [activeTab, setActiveTab] = useState('About');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navLinksRef = useRef(null);

  const tabs = ['About', 'Education', 'Projects', 'Skills', 'Contact'];

  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sectionIds = tabs.map(tab => tab.toLowerCase());
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Focus on the middle of the viewport
      threshold: 0
    };

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveTab('About');
      }
    };

    window.addEventListener('scroll', handleScroll);

    const observerCallback = (entries) => {
      // Filter for entries that are actually intersecting the middle band
      const intersectingEntries = entries.filter(entry => entry.isIntersecting);
      
      if (intersectingEntries.length > 0) {
        // Sort by how much of the section is visible to find the dominant one
        // or just take the first one since we have a very narrow band (-40% to -40%)
        const dominantEntry = intersectingEntries[0];
        const id = dominantEntry.target.id;
        const tabName = tabs.find(tab => tab.toLowerCase() === id);
        if (tabName) {
          setActiveTab(tabName);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const currentHash = location.hash.replace('#', '');
    const currentTab = tabs.find(tab => tab.toLowerCase() === currentHash) || (location.pathname === '/' ? 'About' : '');
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    const activeElement = navLinksRef.current?.querySelector('.active');
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth
      });
    }
  }, [activeTab]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo-section">
          <svg className="header-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          <a href="/" className="logo">Barath.is-dev</a>
          <div className="logo-links">
            <a href="https://www.linkedin.com/in/barathh/" target="_blank" rel="noopener noreferrer" className="logo-link">
              LinkedIn <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </a>
            <a href="#" className="logo-link">
              Resume <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </a>
          </div>
        </div>
        
        <div className="nav-links" ref={navLinksRef}>
          <div className="nav-indicator" style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px` }}></div>
          {tabs.map(tab => (
            <Link 
              key={tab}
              to={tab === 'About' ? '/' : `/#${tab.toLowerCase()}`} 
              className={activeTab === tab ? 'active' : ''}
              onClick={() => { setActiveTab(tab); }}
            >
              {tab}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <div className="nav-clock">
            <span className="clock-dot"></span>
            <span className="clock-time">{time}</span>
          </div>
          
          <button className="nav-icon-btn music-btn" title="Music">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </button>
          
          <button className="nav-icon-btn theme-btn" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Light Mode'}>
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
          
          <a href="https://github.com/Barathfiless" target="_blank" rel="noopener noreferrer" className="nav-icon-btn github-btn" title="GitHub">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.841 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
        
        <div className="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
