const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');
const { redisHelpers } = require('../config/redis');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required', 401));
    }
    const token = authHeader.substring(7);

    // Development mode: accept dev temp tokens without verification
    if (process.env.NODE_ENV !== 'production' && token.endsWith('.dev-temp-token-sig')) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token');
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
        if (!payload.userId || !payload.nicId || !payload.role) throw new Error('Invalid payload');
        if (payload.exp && payload.exp < Date.now() / 1000) throw new Error('Token expired');
        // Create a mock user for dev
        const mockUser = {
          _id: payload.userId,
          nicId: payload.nicId,
          name: 'Dev Test User',
          role: payload.role,
          stateCode: payload.stateCode || 'CENTRAL',
          email: payload.email || 'dev@gov.in',
          department: payload.department || 'Development',
          isActive: true,
          isVerified: true,
          isLocked: () => false
        };
        req.user = mockUser;
        return next();
      } catch (err) {
        return next(new AppError('Invalid authentication token', 401));
      }
    }

    const blacklisted = await redisHelpers.exists(`blacklist:${token}`);
    if (blacklisted) return next(new AppError('Token revoked. Please log in again.', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) return next(new AppError('User not found or deactivated', 401));
    if (user.isLocked()) return next(new AppError('Account temporarily locked', 423));
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(new AppError('Session expired. Please log in again.', 401));
    return next(new AppError('Invalid authentication token', 401));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('Access denied. Insufficient permissions.', 403));
    next();
  };
}

function enforceStateAccess(req, res, next) {
  if (!req.user) return next(new AppError('Authentication required', 401));
  const centralRoles = ['CENTRAL_ADMIN', 'CENTRAL_REVIEWER', 'AUDITOR'];
  if (centralRoles.includes(req.user.role)) return next();
  const requestedState = req.params.stateCode || req.body?.stateCode || req.query?.stateCode;
  if (requestedState && req.user.stateCode !== requestedState) {
    return next(new AppError('You can only access data for your own state', 403));
  }
  next();
}

function generateTokens(user) {
  const payload = { userId: user._id.toString(), nicId: user.nicId, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
  const refreshToken = jwt.sign({ userId: payload.userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

module.exports = { authenticate, authorize, enforceStateAccess, generateTokens };
