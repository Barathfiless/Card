/** Strict admin session policy (client-side) */
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
export const MAX_SESSION_MS = 20 * 60 * 1000;
export const TAB_HIDDEN_LOGOUT_MS = 2 * 60 * 1000;

const AUTH_KEYS = [
  'isAuthenticated',
  'isAdmin',
  'userEmail',
  'userName',
  'userPicture',
  'accessToken',
];

const ALLOWED_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'barathfiless@gmail.com'
).toLowerCase();

export function clearAdminAuth() {
  AUTH_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

export async function verifyGoogleToken(accessToken) {
  if (!accessToken) return null;

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;

    const user = await res.json();
    if (user.email?.toLowerCase() !== ALLOWED_EMAIL) return null;
    return user;
  } catch {
    return null;
  }
}

/** Remove any persisted admin credentials from older builds */
export function purgePersistedAdminAuth() {
  clearAdminAuth();
}
