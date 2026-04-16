const crypto = require('crypto');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'flowtech-dashboard-secret-key-change-in-production';

// Simple JWT implementation using Node crypto
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function signJWT(payload, secret, expiresIn) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof expiresIn === 'string'
    ? now + (expiresIn.includes('d') ? parseInt(expiresIn) * 86400 : parseInt(expiresIn) * 3600)
    : now + expiresIn;

  const fullPayload = { ...payload, iat: now, exp };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');

  if (signature !== expectedSig) throw new Error('Invalid token');

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    const err = new Error('Token expired');
    err.name = 'TokenExpiredError';
    throw err;
  }

  return payload;
}

// Authenticate: verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    req.user = user.toJSON();
    req.user._id = user._id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// Authorize: check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = signJWT({ userId }, JWT_SECRET, '24h');
  const refreshToken = signJWT({ userId, type: 'refresh' }, JWT_SECRET, '7d');
  return { accessToken, refreshToken };
};

module.exports = { authenticate, authorize, generateTokens, JWT_SECRET, verifyJWT };
