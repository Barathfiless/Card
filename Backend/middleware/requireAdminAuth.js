const ALLOWED_EMAIL = (process.env.ADMIN_EMAIL || 'barathfiless@gmail.com').toLowerCase();

export async function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await userRes.json();
    if (user.email?.toLowerCase() !== ALLOWED_EMAIL) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.adminUser = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
