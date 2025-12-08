const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';

function getTokenFromReq(req) {
  // support Authorization header or cookie named 'token'
  const auth = req.headers && req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}

function requireAuth(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireSuperAdmin(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    
    // Check if user is super admin
    if (!payload.isSuperAdmin || payload.id !== 'super-admin') {
      return res.status(403).json({ error: 'Access denied. Super admin only.' });
    }
    
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    
    // Check if user is admin or super admin
    const isAdmin = payload.role === 'admin' || payload.role === 'super_admin' || payload.isSuperAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth, requireSuperAdmin, requireAdmin, getTokenFromReq };
