const crypto = require('crypto');
const https = require('https');
const { redisHelpers } = require('../config/redis');
const logger = require('../config/logger');

const OTP_TTL = (parseInt(process.env.OTP_EXPIRES_MINUTES) || 5) * 60;

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp, phone) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${otp}:${phone}`).digest('hex');
}

async function sendOTP(phone, purpose) {
  const otp = generateOTP();
  const hash = hashOTP(otp, phone);
  const key = `otp:${purpose}:${phone}`;
  const rateKey = `otp_rl:${phone}`;

  const count = await redisHelpers.incr(rateKey, 600);
  if (count > 3) return { success: false, message: 'Too many OTP requests. Wait 10 minutes.' };

  await redisHelpers.set(key, hash, OTP_TTL);

  if (process.env.NODE_ENV === 'production') {
    await sendViaMSG91(phone, otp);
  } else {
    logger.info(`[DEV OTP] Phone: ${phone}, OTP: ${otp}, Purpose: ${purpose}`);
    console.log(`\n========= DEV OTP =========\nPhone: ${phone}\nOTP: ${otp}\nPurpose: ${purpose}\n===========================\n`);
  }

  return { success: true, message: `OTP sent to +91${phone.substring(0,2)}XXXXXX${phone.slice(-2)}` };
}

async function verifyOTP(phone, otp, purpose) {
  const key = `otp:${purpose}:${phone}`;
  const stored = await redisHelpers.get(key);
  if (!stored) return false;

  const input = hashOTP(otp, phone);
  const storedBuf = Buffer.from(stored.padEnd(64, '0'), 'hex');
  const inputBuf = Buffer.from(input.padEnd(64, '0'), 'hex');
  const isValid = crypto.timingSafeEqual(storedBuf, inputBuf) && stored === input;

  if (isValid) await redisHelpers.del(key);
  return isValid;
}

function sendViaMSG91(phone, otp) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ template_id: process.env.MSG91_TEMPLATE_ID, mobile: `91${phone}`, OTP: otp });
    const req = https.request({
      hostname: 'api.msg91.com', path: '/api/v5/otp', method: 'POST',
      headers: { authkey: process.env.MSG91_API_KEY, 'Content-Type': 'application/json' },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const p = JSON.parse(body);
        p.type === 'success' ? resolve() : reject(new Error(`MSG91: ${body}`));
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('MSG91 timeout')); });
    req.write(data);
    req.end();
  });
}

module.exports = { sendOTP, verifyOTP };
