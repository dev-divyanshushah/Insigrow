const jwt = require('jsonwebtoken');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'insigrow_enterprise_jwt_secret_2026_xyz';
const TOKEN_EXPIRY = '30d'; // Persist session for 30 days

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      companyName: user.companyName
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Requires a valid authenticated user session.
 * Checks Bearer header and auth cookie.
 */
function requireAuth(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.insigrow_token) {
    token = req.cookies.insigrow_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to continue.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }

  const user = db.findUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account no longer exists.'
    });
  }

  const { passwordHash, ...safeUser } = user;
  req.user = safeUser;
  next();
}

/**
 * Middleware: Optional authentication (attaches user if present)
 */
function optionalAuth(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.insigrow_token) {
    token = req.cookies.insigrow_token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = db.findUserById(decoded.id);
      if (user) {
        const { passwordHash, ...safeUser } = user;
        req.user = safeUser;
      }
    }
  }

  next();
}

module.exports = {
  generateToken,
  verifyToken,
  requireAuth,
  optionalAuth
};

