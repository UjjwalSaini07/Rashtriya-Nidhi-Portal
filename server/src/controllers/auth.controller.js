const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { generateTokens } = require('../middleware/auth');
const { sendOTP, verifyOTP } = require('../services/otp.service');
const { createAuditLog } = require('../services/audit.service');
const { redisHelpers } = require('../config/redis');

async function login(req, res) {
  const { nicId, password } = req.body;
  if (!nicId || !password) throw new AppError('NIC ID and password are required', 400);

  const user = await User.findOne({ nicId: nicId.toUpperCase() }).select('+password');
  if (!user) throw new AppError('Invalid NIC ID or password', 401);
  if (user.isLocked()) throw new AppError('Account locked. Contact administrator.', 423);
  if (!user.isActive) throw new AppError('Account deactivated. Contact administrator.', 403);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      throw new AppError('Account locked for 30 minutes due to too many failed attempts', 423);
    }
    await user.save();
    throw new AppError('Invalid NIC ID or password', 401);
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();

  // Sensitive roles require OTP second factor
  const sensitiveRoles = ['CENTRAL_ADMIN', 'STATE_ADMIN', 'CENTRAL_REVIEWER'];
  if (sensitiveRoles.includes(user.role)) {
    const otpResult = await sendOTP(user.phone, 'login');
    if (!otpResult.success) throw new AppError(otpResult.message, 429);
    const tempToken = crypto.randomBytes(32).toString('hex');
    await redisHelpers.set(`login_otp:${tempToken}`, user._id.toString(), 300);
    return res.json({ success: true, requireOTP: true, tempToken, message: otpResult.message });
  }

  const { accessToken, refreshToken } = generateTokens(user);
  await createAuditLog({ action: 'USER_LOGIN', entityType: 'USER', entityId: user._id.toString(), user, req });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, accessToken, user: { nicId: user.nicId, name: user.name, role: user.role, stateCode: user.stateCode, email: user.email } });
}

async function verifyLoginOTP(req, res) {
  const { tempToken, otp } = req.body;
  if (!tempToken || !otp) throw new AppError('Temp token and OTP are required', 400);

  const userId = await redisHelpers.get(`login_otp:${tempToken}`);
  if (!userId) throw new AppError('OTP session expired. Please login again.', 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const isValid = await verifyOTP(user.phone, otp, 'login');
  if (!isValid) throw new AppError('Invalid or expired OTP', 400);

  await redisHelpers.del(`login_otp:${tempToken}`);
  const { accessToken, refreshToken } = generateTokens(user);
  await createAuditLog({ action: 'USER_LOGIN_OTP', entityType: 'USER', entityId: user._id.toString(), user, req });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, accessToken, user: { nicId: user.nicId, name: user.name, role: user.role, stateCode: user.stateCode } });
}

async function logout(req, res) {
  const token = req.headers.authorization?.substring(7);
  if (token) await redisHelpers.set(`blacklist:${token}`, '1', 8 * 3600);
  res.clearCookie('refreshToken');
  if (req.user) await createAuditLog({ action: 'USER_LOGOUT', entityType: 'USER', entityId: req.user._id.toString(), user: req.user, req });
  res.json({ success: true, message: 'Logged out successfully' });
}

async function sendOTPHandler(req, res) {
  const { purpose } = req.body;
  if (!req.user) throw new AppError('Authentication required', 401);
  const result = await sendOTP(req.user.phone, purpose || 'action');
  if (!result.success) throw new AppError(result.message, 429);
  res.json({ success: true, message: result.message });
}

async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { login, verifyLoginOTP, logout, sendOTPHandler, getMe };
