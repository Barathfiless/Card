import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAdminAuth } from '../context/AdminAuthContext';
import { verifyGoogleToken } from '../utils/adminAuth';
import './Login.css';

const SESSION_MESSAGES = {
  session_expired: 'Your session expired. Sign in again to continue.',
  tab_hidden: 'You were signed out after the tab was inactive. Sign in again.',
  auth_required: 'Administrator sign-in is required.',
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { establishSession, logout } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    logout({ skipGoogle: true });
  }, [logout]);

  useEffect(() => {
    const reason = location.state?.reason;
    if (reason && SESSION_MESSAGES[reason]) {
      setError(SESSION_MESSAGES[reason]);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const glow = document.getElementById('login-glow');
      if (glow) {
        glow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const userInfo = await verifyGoogleToken(tokenResponse.access_token);
        if (!userInfo) {
          setIsLoading(false);
          setError('Access denied. This Google account is not authorized.');
          return;
        }

        establishSession({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: tokenResponse.access_token,
        });

        setIsLoading(false);
        setSuccess(`Welcome, ${userInfo.name}! Redirecting…`);

        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 800);
      } catch (err) {
        setIsLoading(false);
        setError('Authentication failed. Please try again.');
        console.error('Google login error:', err);
      }
    },
    onError: (errorResponse) => {
      setIsLoading(false);
      if (
        errorResponse?.error === 'popup_closed_by_user' ||
        errorResponse?.error === 'access_denied'
      ) {
        return;
      }
      setError('Google sign-in failed. Please try again.');
      console.error('Google OAuth error:', errorResponse);
    },
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
      <div id="login-glow" className="login-bg-glow" />
      <div className="login-grid-overlay" />

      <div className="login-container fade-in visible">
        <div className="login-form-panel">
          <div className="form-card admin-form-card">
            <div className="security-icon-wrapper">
              <svg className="shield-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div className="form-card-header">
              <h2>Administrator Sign In</h2>
              <p>
                Secure access only. Sessions are memory-only, re-validated with Google,
                and expire after inactivity.
              </p>
            </div>

            {error && (
              <div className="form-alert error-alert fade-in visible">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="form-alert success-alert fade-in visible">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="admin-cta-container">
              <button
                type="button"
                id="google-login-btn"
                onClick={handleGoogleLogin}
                className={`google-admin-login-btn ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loader-spinner" />
                ) : (
                  <>
                    <svg className="google-svg-logo" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.56a5.94 5.94 0 0 1 5.99-5.96 5.8 5.8 0 0 1 4.1 1.63l3.052-3.052A9.96 9.96 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.76 0 9.806-4.054 9.806-9.977 0-.677-.07-1.18-.22-1.736h-11.34Z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            <div className="form-links-row">
              <Link to="/" className="back-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
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
