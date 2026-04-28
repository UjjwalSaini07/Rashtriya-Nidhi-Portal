const crypto = require('crypto');
const ALGO = 'aes-256-gcm';
const IV_LEN = 16;
const TAG_LEN = 16;

function encrypt(text) {
  const key = Buffer.from(process.env.AES_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(data) {
  const key = Buffer.from(process.env.AES_ENCRYPTION_KEY, 'hex');
  const buf = Buffer.from(data, 'base64');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc) + decipher.final('utf8');
}

module.exports = { encrypt, decrypt };
