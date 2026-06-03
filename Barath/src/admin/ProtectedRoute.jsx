import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { validateSession, touchActivity, isSessionLocallyValid } = useAdminAuth();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      setStatus('checking');

      if (!isSessionLocallyValid()) {
        if (!cancelled) setStatus('denied');
        return;
      }

      const ok = await validateSession();
      if (!cancelled) setStatus(ok ? 'ok' : 'denied');
    };

    runCheck();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, validateSession, isSessionLocallyValid]);

  useEffect(() => {
    if (status !== 'ok') return undefined;

    const recordActivity = () => touchActivity();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    return () => {
      events.forEach((event) => window.removeEventListener(event, recordActivity));
    };
  }, [status, touchActivity]);

  if (status === 'checking') {
    return (
      <div className="admin-auth-gate" role="status" aria-live="polite">
        <div className="admin-auth-gate-card">
          <span className="admin-auth-gate-spinner" aria-hidden="true" />
          <p>Verifying secure session…</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: 'auth_required' }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
