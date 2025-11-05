// Admin Authentication Utility
const crypto = require('crypto');

// Simple authentication for admin panel
function authenticate(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  return username === adminUsername && password === adminPassword;
}

// Generate session token
function generateToken(username) {
  const timestamp = Date.now();
  const data = `${username}:${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  return Buffer.from(JSON.stringify({
    username,
    timestamp,
    hash
  })).toString('base64');
}

// Verify session token
function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { username, timestamp, hash } = decoded;

    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenAge = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      return { valid: false, reason: 'Token expired' };
    }

    // Verify hash
    const data = `${username}:${timestamp}`;
    const expectedHash = crypto.createHash('sha256').update(data).digest('hex');

    if (hash !== expectedHash) {
      return { valid: false, reason: 'Invalid token' };
    }

    return {
      valid: true,
      username
    };

  } catch (error) {
    return { valid: false, reason: 'Invalid token format' };
  }
}

// Middleware to protect admin routes
function requireAuth(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'No authorization token' };
  }

  const token = authHeader.substring(7);
  const verification = verifyToken(token);

  if (!verification.valid) {
    return { authenticated: false, error: verification.reason };
  }

  return {
    authenticated: true,
    username: verification.username
  };
}

module.exports = {
  authenticate,
  generateToken,
  verifyToken,
  requireAuth
};
