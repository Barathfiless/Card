let tokenGetter = () => null;
let unauthorizedHandler = null;

export function registerAdminTokenGetter(fn) {
  tokenGetter = typeof fn === 'function' ? fn : () => null;
}

export function registerAdminUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : null;
}

export async function adminFetch(url, options = {}) {
  const token = tokenGetter();
  if (!token) {
    throw new Error('Admin authentication required');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    unauthorizedHandler?.();
  }

  return res;
}
