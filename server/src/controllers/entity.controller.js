const Entity = require('../models/Entity');
const { AppError } = require('../middleware/errorHandler');
const { validateGST, validatePAN } = require('../services/gst.service');
const { createAuditLog } = require('../services/audit.service');
const { encrypt } = require('../utils/encryption');

async function getEntities(req, res) {
  const { type, stateCode, search } = req.query;
  const filter = { isActive: true };
  if (type) filter.type = type;
  if (stateCode) filter.stateCode = stateCode;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { nicEntityId: { $regex: search, $options: 'i' } },
    { gstNumber: { $regex: search, $options: 'i' } },
    { panNumber: { $regex: search, $options: 'i' } },
  ];
  const entities = await Entity.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, entities });
}

async function getEntityById(req, res) {
  const entity = await Entity.findById(req.params.id).populate('registeredBy', 'name nicId');
  if (!entity) throw new AppError('Entity not found', 404);
  res.json({ success: true, entity });
}

async function createEntity(req, res) {
  const { type, name, gstNumber, panNumber, bankAccountNumber, bankIfsc, bankName, bankBranch, stateCode, address, contactEmail, contactPhone } = req.body;

  if (!panNumber) throw new AppError('PAN number is required', 400);

  // Live PAN validation
  const panResult = await validatePAN(panNumber);
  if (!panResult.valid) throw new AppError(`PAN validation failed: ${panResult.error || 'Invalid PAN'}`, 400);

  // Live GST validation for contractors/suppliers
  let gstResult = { valid: true, details: null };
  if (gstNumber && ['CONTRACTOR','SUPPLIER'].includes(type)) {
    gstResult = await validateGST(gstNumber);
    if (!gstResult.valid) throw new AppError(`GST validation failed: ${gstResult.error || 'Invalid GST'}`, 400);
  }

  // Generate unique NIC Entity ID
  const count = await Entity.countDocuments({ type });
  const prefix = type.substring(0,4).toUpperCase();
  const nicEntityId = gstNumber
    ? `${prefix}-GST-${gstNumber}`
    : `${prefix}-PAN-${panNumber}-${(count + 1).toString().padStart(4,'0')}`;

  const existing = await Entity.findOne({ nicEntityId });
  if (existing) throw new AppError('Entity with this GST/PAN already registered', 409);

  // Encrypt bank account number before storing
  const encryptedAccount = process.env.AES_ENCRYPTION_KEY ? encrypt(bankAccountNumber) : bankAccountNumber;

  const entity = await Entity.create({
    nicEntityId, type, name, gstNumber, panNumber,
    bankAccountNumber: encryptedAccount,
    bankIfsc, bankName, bankBranch, stateCode, address, contactEmail, contactPhone,
    gstVerified: !!gstNumber && gstResult.valid,
    panVerified: panResult.valid,
    gstDetails: gstResult.details,
    panDetails: panResult.details,
    gstVerifiedAt: gstResult.valid ? new Date() : undefined,
    panVerifiedAt: panResult.valid ? new Date() : undefined,
    registeredBy: req.user._id,
  });

  await createAuditLog({ action: 'ENTITY_REGISTERED', entityType: 'ENTITY', entityId: entity._id.toString(), user: req.user, req, newState: { nicEntityId, type, name } });
  res.status(201).json({ success: true, entity });
}

async function updateEntityStatus(req, res) {
  const { isActive } = req.body;
  const entity = await Entity.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!entity) throw new AppError('Entity not found', 404);
  await createAuditLog({ action: isActive ? 'ENTITY_ACTIVATED' : 'ENTITY_DEACTIVATED', entityType: 'ENTITY', entityId: entity._id.toString(), user: req.user, req });
  res.json({ success: true, entity });
}

module.exports = { getEntities, getEntityById, createEntity, updateEntityStatus };
