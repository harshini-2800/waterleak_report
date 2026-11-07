const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  const authHeader = req.headers.authorization;

  if (isDev) {
    // In local development / demo mode, allow demo authorization or verify token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token === 'demo-admin-token' || token === 'hackathon-super-token') {
        req.user = { email: 'admin@waterleakwatch.org', role: 'admin', isDemo: true };
        return next();
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'waterleak_watch_super_secret_jwt_key_2026_luxury');
        req.user = decoded;
        return next();
      } catch (err) {
        // If demo mode, still allow through with fallback
        req.user = { email: 'admin@waterleakwatch.org', role: 'admin', isDemo: true };
        return next();
      }
    } else {
      // In local demo mode, treat as authorized admin
      req.user = { email: 'admin@waterleakwatch.org', role: 'admin', isDemo: true };
      return next();
    }
  }

  // Strict production mode
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'waterleak_watch_super_secret_jwt_key_2026_luxury');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;

