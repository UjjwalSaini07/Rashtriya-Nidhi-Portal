const router = require('express').Router();
const { login, verifyLoginOTP, logout, sendOTPHandler, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, login);
router.post('/verify-otp', otpLimiter, verifyLoginOTP);
router.post('/logout', authenticate, logout);
router.post('/send-otp', authenticate, otpLimiter, sendOTPHandler);
router.get('/me', authenticate, getMe);
module.exports = router;
