import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const { getSession, logout } = useAdminAuth();
  const session = getSession();
  const userName = session?.name || 'Admin';
  const userPicture = session?.picture || '';

  const [adminTheme, setAdminTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', adminTheme);
    try {
      localStorage.setItem('theme', adminTheme);
    } catch (e) {
      // ignore
    }
  }, [adminTheme]);

  const toggleAdminTheme = () => {
    setAdminTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      to: '/admin',
      end: true,
      label: 'Dashboard',
    },
    {
      to: '/admin/upload',
      label: 'Upload Project',
    },
    {
      to: '/admin/trash',
      label: 'Trash',
    },
  ];

  return (
    <div className="admin-shell admin-vercel">
      {/* ── Vercel Top Navigation Header ── */}
      <header className="vercel-header">
        <div className="vercel-header-main">
          <div className="vercel-header-left">
            <div className="vercel-user-selector">
              <span className="vercel-username">{userName}'s Studio</span>
              <span className="vercel-badge">Inventory</span>
            </div>
          </div>
          <div className="vercel-header-right">
            <a href="/" className="vercel-nav-btn outline-btn">View Portfolio</a>
            <button 
              onClick={() => window.location.reload()} 
              className="vercel-nav-btn refresh-btn"
              title="Refresh Portal Data"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                <polyline points="21 3 21 8 16 8"/>
              </svg>
            </button>
            <button 
              onClick={toggleAdminTheme} 
              className="vercel-nav-btn theme-toggle-btn"
              title={`Switch to ${adminTheme === 'light' ? 'dark' : 'light'} theme`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
            >
              {adminTheme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              )}
            </button>
            <button onClick={handleLogout} className="vercel-nav-btn text-btn">Sign out</button>
            {userPicture ? (
              <img src={userPicture} alt={userName} className="vercel-avatar" />
            ) : (
              <div className="vercel-avatar-placeholder">{userName[0]}</div>
            )}
          </div>
        </div>
        <div className="vercel-header-tabs">
          <div className="vercel-tabs-container">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `vercel-tab-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
