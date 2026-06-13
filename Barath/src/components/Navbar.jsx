import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ toggleTheme, theme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reachedFooter, setReachedFooter] = useState(false);
  const searchRef = useRef(null);
  const navRef = useRef(null);
  const dockRef = useRef(null);
  const scrollRafRef = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const updateScrollState = () => {
      scrollRafRef.current = 0;
      const hasScrolled = window.scrollY > 50;
      const threshold = 60;
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - threshold;

      navRef.current?.classList.toggle('navbar-hidden', hasScrolled);
      dockRef.current?.classList.toggle('dock-visible', hasScrolled);
      dockRef.current?.classList.toggle('footer-reached', isAtBottom);

      if (isAtBottom) {
        document.body.classList.add('footer-reached');
      } else {
        document.body.classList.remove('footer-reached');
      }

      if (hasScrolled) {
        setSearchOpen(false);
        setSearchQuery('');
      }

      if (window.scrollY > 20) {
        setMobileOpen(false);
      }

      setScrolled((prev) => (prev !== hasScrolled ? hasScrolled : prev));
      setReachedFooter((prev) => (prev !== isAtBottom ? isAtBottom : prev));
    };

    const handleScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('footer-reached');
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  const menuItems = [
    { label: 'About', path: '/#about' },
    { label: 'Milestones', path: '/#education' },
    { label: 'Projects', path: '/#projects' },
    { label: 'Skills', path: '/#skills' },
    { label: 'Contact', path: '/#contact' }
  ];

  const handleNavClick = (path) => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    if (path.startsWith('/#')) {
      const id = path.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredSearchItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  useEffect(() => {
    if (!searchOpen) return undefined;

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname, location.hash]);

  return (
    <>
      <nav ref={navRef} className={`navbar ${scrolled ? 'navbar-hidden' : ''}`}>
        <div className="nav-container">
          {/* Brand Logo - MSCI Style */}
          <div className="logo-section">
            <Link to="/" className="logo">
              <span className="logo-bold">BARATH</span>
              <svg className="msci-globe-icon" width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="16" cy="16" r="13" />
                <path d="M16 3a22 22 0 0 0 0 26M16 3a22 22 0 0 1 0 26" />
                <path d="M3 16h26M6 9h20M6 23h20" />
              </svg>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Search and Action CTA */}
          <div className="nav-actions">
            {/* MSCI-style Search — opens section list on click */}
            <div className="msci-search-wrap" ref={searchRef}>
              <div
                className={`msci-search-bar ${searchOpen ? 'is-open' : ''}`}
                onClick={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSearchOpen(true);
                  }
                }}
                role="combobox"
                aria-expanded={searchOpen}
                aria-controls="nav-search-list"
                aria-haspopup="listbox"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search sections"
                  aria-label="Search site sections"
                  aria-autocomplete="list"
                  aria-controls="nav-search-list"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
              {searchOpen && (
                <ul id="nav-search-list" className="msci-search-dropdown" role="listbox">
                  {filteredSearchItems.length > 0 ? (
                    filteredSearchItems.map((item) => (
                      <li key={item.label} role="option">
                        <Link
                          to={item.path}
                          className="msci-search-dropdown-item"
                          onClick={() => handleNavClick(item.path)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="msci-search-dropdown-empty" role="option">
                      No matching sections
                    </li>
                  )}
                </ul>
              )}
            </div>

            <a href="#contact" className="msci-get-in-touch-link">
              Get in touch
            </a>

            {/* Theme switcher */}
            <button
              className="nav-icon-btn theme-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{ border: 'none', background: 'transparent', marginLeft: '8px' }}
            >
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="mobile-nav-dropdown">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="mobile-nav-link"
                onClick={() => handleNavClick(item.path)}
              >
                {item.label}
              </Link>
            ))}
            <a href="#contact" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Get in touch</a>
          </div>
        )}
      </nav>

      {/* Bottom Floating Glass Dock */}
      <div
        ref={dockRef}
        className={`msci-bottom-dock ${scrolled ? 'dock-visible' : ''} ${reachedFooter ? 'footer-reached' : ''}`}
      >
        <div className="dock-container">
          {menuItems.map((item, index) => {
            let icon;
            if (item.label === 'About') {
              icon = (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              );
            } else if (item.label === 'Milestones') {
              icon = (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              );
            } else if (item.label === 'Projects') {
              icon = (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              );
            } else if (item.label === 'Skills') {
              icon = (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                  <line x1="14" y1="4" x2="10" y2="20" />
                </svg>
              );
            } else if (item.label === 'Contact') {
              icon = (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              );
            }

            return (
              <Link
                key={index}
                to={item.path}
                className="dock-item"
                onClick={() => handleNavClick(item.path)}
              >
                <div className="dock-icon">{icon}</div>
                <span className="dock-label">{item.label}</span>
              </Link>
            );
          })}

          {/* Social Icons Wrapper */}
          <div className={`social-dock-wrapper ${reachedFooter ? 'social-visible' : ''}`}>
            {/* Social Divider */}
            <div className="dock-divider" />

            {/* LinkedIn Social Icon */}
            <a
              href="https://www.linkedin.com/in/barathh/"
              target="_blank"
              rel="noopener noreferrer"
              className="dock-item social-dock-item"
              aria-label="LinkedIn"
            >
              <div className="dock-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <span className="dock-label">LinkedIn</span>
            </a>

            {/* GitHub Social Icon */}
            <a
              href="https://github.com/Barathfiless"
              target="_blank"
              rel="noopener noreferrer"
              className="dock-item social-dock-item"
              aria-label="GitHub"
            >
              <div className="dock-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </div>
              <span className="dock-label">GitHub</span>
            </a>

            {/* Instagram Social Icon */}
            <a
              href="https://www.instagram.com/me.barathh"
              target="_blank"
              rel="noopener noreferrer"
              className="dock-item social-dock-item"
              aria-label="Instagram"
            >
              <div className="dock-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <span className="dock-label">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
