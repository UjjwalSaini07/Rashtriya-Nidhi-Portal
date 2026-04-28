const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

async function createAuditLog({ action, entityType, entityId, user, req, metadata = {}, previousState, newState }) {
  try {
    const lastLog = await AuditLog.findOne({}, {}, { sort: { blockNumber: -1 } }).lean();
    const previousHash = lastLog ? lastLog.dataHash : '0'.repeat(64);
    const blockNumber = lastLog ? lastLog.blockNumber + 1 : 1;

    const logData = {
      action, entityType, entityId,
      performedByNicId: user.nicId,
      performedByName: user.name,
      performedByRole: user.role,
      metadata,
      previousHash,
      blockNumber,
      timestamp: new Date().toISOString(),
    };

    const dataHash = crypto.createHash('sha256').update(JSON.stringify(logData)).digest('hex');

    await AuditLog.create({
      ...logData,
      performedBy: user._id,
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      previousState,
      newState,
      dataHash,
    });
  } catch (err) {
    logger.error('CRITICAL: Audit log creation failed:', err);
  }
}

async function verifyAuditChain() {
  const logs = await AuditLog.find({}, {}, { sort: { blockNumber: 1 } }).lean();
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (i > 0 && log.previousHash !== logs[i - 1].dataHash) {
      return { valid: false, totalBlocks: logs.length, brokenAt: log.blockNumber };
    }
    const logData = {
      action: log.action, entityType: log.entityType, entityId: log.entityId,
      performedByNicId: log.performedByNicId, performedByName: log.performedByName,
      performedByRole: log.performedByRole, metadata: log.metadata,
      previousHash: log.previousHash, blockNumber: log.blockNumber,
      timestamp: new Date(log.createdAt).toISOString(),
    };
    const expected = crypto.createHash('sha256').update(JSON.stringify(logData)).digest('hex');
    if (expected !== log.dataHash) {
      return { valid: false, totalBlocks: logs.length, brokenAt: log.blockNumber };
    }
  }
  return { valid: true, totalBlocks: logs.length };
}

module.exports = { createAuditLog, verifyAuditChain };
