const Entity = require('../models/Entity');
const Bill = require('../models/Bill');
const logger = require('../config/logger');

async function runAnomalyDetection(bill) {
  const flags = [];
  try {
    for (const split of bill.fundSplit) {
      const entity = await Entity.findById(split.entityId);
      if (!entity) {
        flags.push({ flagType: 'ENTITY_NOT_FOUND', severity: 'CRITICAL', message: `Entity ${split.entityNicId} not found in registry. Payments blocked.` });
        continue;
      }
      if (!entity.gstVerified && entity.type !== 'STATE_DEPT') {
        flags.push({ flagType: 'GST_NOT_VERIFIED', severity: 'CRITICAL', message: `Entity ${entity.name} has unverified GST. Payment blocked until verification.` });
      }
      if (!entity.panVerified) {
        flags.push({ flagType: 'PAN_NOT_VERIFIED', severity: 'HIGH', message: `Entity ${entity.name} has unverified PAN ${entity.panNumber}.` });
      }
      if (!entity.isActive) {
        flags.push({ flagType: 'ENTITY_INACTIVE', severity: 'CRITICAL', message: `Entity ${entity.name} is marked inactive.` });
      }
    }

    // Duplicate entity check
    const ids = bill.fundSplit.map(s => s.entityNicId);
    if (new Set(ids).size !== ids.length) {
      flags.push({ flagType: 'DUPLICATE_ENTITY', severity: 'HIGH', message: 'Same entity appears multiple times. Possible double payment attempt.' });
    }

    // Excessive contractor share
    for (const split of bill.fundSplit) {
      if (split.entityType === 'CONTRACTOR' && split.percentage > 85) {
        flags.push({ flagType: 'EXCESSIVE_CONTRACTOR_SHARE', severity: 'HIGH', message: `Contractor ${split.entityName} gets ${split.percentage.toFixed(1)}% — exceeds 85% threshold.` });
      }
    }

    // High mediator commission
    const mediatorPct = bill.fundSplit.filter(s => s.entityType === 'MEDIATOR').reduce((s, f) => s + f.percentage, 0);
    if (mediatorPct > 20) {
      flags.push({ flagType: 'HIGH_MEDIATOR_COMMISSION', severity: 'MEDIUM', message: `Mediator allocation ${mediatorPct.toFixed(1)}% exceeds 20% threshold. Normal range: 5-15%.` });
    }

    // Historical amount comparison
    const [hist] = await Bill.aggregate([
      { $match: { stateCode: bill.stateCode, department: bill.department, status: { $in: ['SANCTIONED','DISBURSING','DISBURSED'] } } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    if (hist && hist.count >= 3 && bill.totalAmount > hist.avg * 3) {
      flags.push({ flagType: 'UNUSUALLY_LARGE_AMOUNT', severity: 'MEDIUM', message: `Amount ₹${bill.totalAmount} Cr is ${(bill.totalAmount/hist.avg).toFixed(1)}x the historical avg ₹${hist.avg.toFixed(0)} Cr for ${bill.stateCode}/${bill.department}.` });
    }
  } catch (err) {
    logger.error('Anomaly detection error:', err);
    flags.push({ flagType: 'DETECTION_ERROR', severity: 'LOW', message: 'Automated scan error. Manual review recommended.' });
  }
  return flags;
}

module.exports = { runAnomalyDetection };
