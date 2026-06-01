import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ toggleTheme, theme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      <nav className={`navbar ${scrolled ? 'navbar-hidden' : ''}`}>
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

            <a href="#contact" className="msci-get-in-touch-btn">
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
      <div className={`msci-bottom-dock ${scrolled ? 'dock-visible' : ''}`}>
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
        </div>
      </div>
    </>
  );
}

export default Navbar;
