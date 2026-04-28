const AuditLog = require('../models/AuditLog');
const { verifyAuditChain } = require('../services/audit.service');

async function getLogs(req, res) {
  const { entityType, entityId, action, page = '1', limit = '50' } = req.query;
  const filter = {};
  if (entityType) filter.entityType = entityType;
  if (entityId) filter.entityId = entityId;
  if (action) filter.action = { $regex: action, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('performedBy', 'name nicId').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ success: true, logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
}

async function verifyChain(req, res) {
  const result = await verifyAuditChain();
  res.json({ success: true, ...result });
}

module.exports = { getLogs, verifyChain };
