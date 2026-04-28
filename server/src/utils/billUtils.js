const Bill = require('../models/Bill');

async function generateBillNumber(stateCode) {
  const year = new Date().getFullYear();
  const prefix = `RNP-${year}-${stateCode}`;
  const last = await Bill.findOne({ billNumber: { $regex: `^${prefix}-` } }, { billNumber: 1 }, { sort: { billNumber: -1 } });
  let seq = 1;
  if (last) {
    const parts = last.billNumber.split('-');
    seq = parseInt(parts[parts.length - 1]) + 1;
  }
  return `${prefix}-${seq.toString().padStart(4, '0')}`;
}

module.exports = { generateBillNumber };
