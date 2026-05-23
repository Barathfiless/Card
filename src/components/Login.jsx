import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mouse move effect for background glowing light
  useEffect(() => {
    const handleMouseMove = (e) => {
      const glow = document.getElementById('login-glow');
      if (glow) {
        const x = e.clientX;
        const y = e.clientY;
        glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Real Google OAuth login
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch user profile from Google
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoRes.ok) {
          throw new Error('Failed to fetch user info from Google.');
        }

        const userInfo = await userInfoRes.json();

        // ── Whitelist check ──
        const ALLOWED_EMAIL = 'barathfiless@gmail.com';
        if (userInfo.email?.toLowerCase() !== ALLOWED_EMAIL) {
          setIsLoading(false);
          setError('Access denied');
          return;
        }

        // Save auth state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userEmail', userInfo.email || '');
        localStorage.setItem('userName', userInfo.name || 'Admin');
        localStorage.setItem('userPicture', userInfo.picture || '');
        localStorage.setItem('accessToken', tokenResponse.access_token);

        setIsLoading(false);
        setSuccess(`Welcome, ${userInfo.name}! Redirecting…`);

        setTimeout(() => {
          navigate('/admin');
          window.location.reload();
        }, 1500);

      } catch (err) {
        setIsLoading(false);
        setError('Authentication failed. Please try again.');
        console.error('Google login error:', err);
      }
    },
    onError: (errorResponse) => {
      setIsLoading(false);
      // User closed the popup — don't show an error
      if (errorResponse?.error === 'popup_closed_by_user' || errorResponse?.error === 'access_denied') {
        return;
      }
      setError('Google sign-in failed. Please try again.');
      console.error('Google OAuth error:', errorResponse);
    },
    // Opens a popup window (no page redirect needed)
    flow: 'implicit',
  });

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setError('');
    setSuccess('');
    setIsLoading(true);
    login();
  };

  return (
    <div className="login-page">
      {/* Background Interactive Elements */}
      <div id="login-glow" className="login-bg-glow"></div>
      <div className="login-grid-overlay"></div>

      {/* Center Card Container */}
      <div className="login-container fade-in visible">
        <div className="login-form-panel">
          <div className="form-card admin-form-card">
            
            {/* Top Security Lock Badge */}
            <div className="security-icon-wrapper">
              <svg className="shield-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            <div className="form-card-header">
              <h2>Administrator Sign In</h2>
              <p>
                Access to the administration dashboard is restricted to authorized accounts. Sign in using your Google Workspace credential.
              </p>
            </div>

            {/* Error or Success Alerts */}
            {error && (
              <div className="form-alert error-alert fade-in visible">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="form-alert success-alert fade-in visible">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Single Large Google Login CTA */}
            <div className="admin-cta-container">
              <button 
                type="button" 
                id="google-login-btn"
                onClick={handleGoogleLogin} 
                className={`google-admin-login-btn ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loader-spinner"></span>
                ) : (
                  <>
                    <svg className="google-svg-logo" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.56a5.94 5.94 0 0 1 5.99-5.96 5.8 5.8 0 0 1 4.1 1.63l3.052-3.052A9.96 9.96 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.76 0 9.806-4.054 9.806-9.977 0-.677-.07-1.18-.22-1.736h-11.34Z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Terms / Back to home footer link */}
            <div className="form-links-row">
              <Link to="/" className="back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to main site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
