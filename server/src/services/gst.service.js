const https = require('https');
const logger = require('../config/logger');

function callSurePass(path, idNumber, token) {
  return new Promise((resolve) => {
    if (!token) { resolve({ valid: true }); return; } // skip if not configured

    const data = JSON.stringify({ id_number: idNumber });
    const req = https.request({
      hostname: 'api.surepass.io', path, method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const p = JSON.parse(body);
          resolve({ success: p.success, data: p.data, message: p.message });
        } catch { resolve({ success: false, message: 'Parse error' }); }
      });
    });
    req.on('error', (err) => { logger.error('SurePass error:', err); resolve({ success: false, message: 'API unavailable' }); });
    req.setTimeout(10000, () => { req.destroy(); resolve({ success: false, message: 'API timeout' }); });
    req.write(data);
    req.end();
  });
}

async function validateGST(gstNumber) {
  const result = await callSurePass('/api/v1/gst/gstin', gstNumber, process.env.GST_API_TOKEN);
  if (!result.success || !result.data) return { valid: false, error: result.message || 'GST not found' };
  const d = result.data;
  return {
    valid: d.sts === 'Active',
    details: {
      gstin: d.gstin, tradeName: d.tradeNam, legalName: d.lgnm,
      registrationDate: d.rgdt, taxpayerType: d.dty, gstStatus: d.sts,
      address: `${d.pradr?.addr?.bno || ''} ${d.pradr?.addr?.st || ''}, ${d.pradr?.addr?.dst || ''}`.trim(),
    },
    error: d.sts !== 'Active' ? `GST status is ${d.sts}` : undefined,
  };
}

async function validatePAN(panNumber) {
  const result = await callSurePass('/api/v1/pan/pan', panNumber, process.env.PAN_API_TOKEN);
  if (!result.success || !result.data) return { valid: false, error: result.message || 'PAN not found' };
  const d = result.data;
  return {
    valid: d.pan_status === 'VALID',
    details: { pan: d.pan_number, fullName: d.full_name, category: d.category, aadhaarLinked: d.aadhaar_seeding_status === 'Y' },
    error: d.pan_status !== 'VALID' ? `PAN status: ${d.pan_status}` : undefined,
  };
}

module.exports = { validateGST, validatePAN };
