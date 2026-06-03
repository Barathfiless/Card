import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import {
  clearAdminAuth,
  verifyGoogleToken,
  IDLE_TIMEOUT_MS,
  MAX_SESSION_MS,
  TAB_HIDDEN_LOGOUT_MS,
} from '../utils/adminAuth';
import { registerAdminTokenGetter, registerAdminUnauthorizedHandler } from '../utils/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const navigate = useNavigate();
  const sessionRef = useRef(null);
  const [, setTick] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const bump = () => setTick((n) => n + 1);

  const logout = useCallback((options = {}) => {
    const { skipGoogle = false } = options;
    sessionRef.current = null;
    setSessionActive(false);
    clearAdminAuth();
    if (!skipGoogle) {
      try {
        googleLogout();
      } catch {
        /* ignore */
      }
    }
    bump();
  }, []);

  const establishSession = useCallback((payload) => {
    const now = Date.now();
    sessionRef.current = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      accessToken: payload.accessToken,
      loginAt: now,
      lastActivityAt: now,
    };
    clearAdminAuth();
    setSessionActive(true);
    bump();
  }, []);

  const touchActivity = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    session.lastActivityAt = Date.now();
  }, []);

  const isSessionLocallyValid = useCallback(() => {
    const session = sessionRef.current;
    if (!session?.accessToken) return false;
    const now = Date.now();
    if (now - session.loginAt > MAX_SESSION_MS) return false;
    if (now - session.lastActivityAt > IDLE_TIMEOUT_MS) return false;
    return true;
  }, []);

  const validateSession = useCallback(async () => {
    if (!isSessionLocallyValid()) {
      logout({ skipGoogle: true });
      return false;
    }

    const session = sessionRef.current;
    const user = await verifyGoogleToken(session.accessToken);
    if (!user) {
      logout();
      return false;
    }

    session.email = user.email;
    session.name = user.name;
    session.picture = user.picture;
    session.lastActivityAt = Date.now();
    return true;
  }, [isSessionLocallyValid, logout]);

  const getSession = useCallback(() => sessionRef.current, []);

  useEffect(() => {
    registerAdminTokenGetter(() => sessionRef.current?.accessToken ?? null);
    registerAdminUnauthorizedHandler(() => {
      logout();
      navigate('/login', { replace: true, state: { reason: 'session_expired' } });
    });
    return () => {
      registerAdminTokenGetter(() => null);
      registerAdminUnauthorizedHandler(null);
    };
  }, [logout, navigate]);

  useEffect(() => {
    clearAdminAuth();
  }, []);

  useEffect(() => {
    if (!sessionActive) return undefined;

    const intervalId = window.setInterval(() => {
      if (!isSessionLocallyValid()) {
        logout();
        navigate('/login', { replace: true, state: { reason: 'session_expired' } });
      }
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [sessionActive, isSessionLocallyValid, logout, navigate]);

  useEffect(() => {
    if (!sessionActive) return undefined;

    let hiddenAt = null;

    const onVisibilityChange = async () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }

      if (hiddenAt && Date.now() - hiddenAt >= TAB_HIDDEN_LOGOUT_MS) {
        logout();
        navigate('/login', { replace: true, state: { reason: 'tab_hidden' } });
        return;
      }

      hiddenAt = null;
      const ok = await validateSession();
      if (!ok) {
        navigate('/login', { replace: true, state: { reason: 'session_expired' } });
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [sessionActive, logout, navigate, validateSession]);

  useEffect(() => {
    const onPageShow = (event) => {
      if (event.persisted && sessionRef.current) {
        validateSession().then((ok) => {
          if (!ok) {
            navigate('/login', { replace: true, state: { reason: 'session_expired' } });
          }
        });
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [navigate, validateSession]);

  const value = {
    establishSession,
    logout,
    touchActivity,
    validateSession,
    isSessionLocallyValid,
    getSession,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
