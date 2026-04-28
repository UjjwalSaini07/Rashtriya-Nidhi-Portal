const crypto = require('crypto');
const Bill = require('../models/Bill');
const Entity = require('../models/Entity');
const { AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../services/audit.service');
const { runAnomalyDetection } = require('../services/anomaly.service');
const { verifyOTP } = require('../services/otp.service');
const { INDIAN_STATES } = require('../utils/constants');
const { generateBillNumber } = require('../utils/billUtils');

async function createBill(req, res) {
  const user = req.user;
  const { stateCode, department, projectTitle, projectDescription, projectCategory, totalAmountCrore, expectedCompletionDate, fundSplit } = req.body;

  if (['STATE_OFFICER', 'STATE_ADMIN'].includes(user.role) && user.stateCode !== stateCode) {
    throw new AppError('You can only raise bills for your assigned state', 403);
  }

  const stateName = INDIAN_STATES[stateCode];
  if (!stateName) throw new AppError(`Invalid state code: ${stateCode}`, 400);
  if (!fundSplit || !Array.isArray(fundSplit) || fundSplit.length === 0) {
    throw new AppError('Fund split with at least one beneficiary is required', 400);
  }

  const totalAmountPaise = Math.round(parseFloat(totalAmountCrore) * 1e7);
  const splitTotalPaise = fundSplit.reduce((sum, s) => sum + Math.round(parseFloat(s.amountCrore) * 1e7), 0);
  if (Math.abs(splitTotalPaise - totalAmountPaise) > fundSplit.length) {
    throw new AppError(`Fund split total does not match requested amount`, 400);
  }

  const splitEntries = [];
  for (const split of fundSplit) {
    const entity = await Entity.findOne({ nicEntityId: split.entityNicId.toUpperCase() });
    if (!entity) throw new AppError(`Entity ${split.entityNicId} not found in registry`, 404);
    if (!entity.isActive) throw new AppError(`Entity ${entity.name} is inactive`, 400);
    splitEntries.push({
      entityId: entity._id,
      entityNicId: entity.nicEntityId,
      entityName: entity.name,
      entityType: entity.type,
      amount: parseFloat(split.amountCrore),
      amountPaise: Math.round(parseFloat(split.amountCrore) * 1e7),
      percentage: (parseFloat(split.amountCrore) / parseFloat(totalAmountCrore)) * 100,
      disbursed: false,
    });
  }

  const billNumber = await generateBillNumber(stateCode);
  const bill = await Bill.create({
    billNumber, stateCode, stateName, department, projectTitle, projectDescription,
    projectCategory, totalAmount: parseFloat(totalAmountCrore), totalAmountPaise,
    expectedCompletionDate: new Date(expectedCompletionDate),
    fundSplit: splitEntries, status: 'SUBMITTED',
    raisedBy: user._id, raisedByNicId: user.nicId,
  });

  // Run AI anomaly detection async (don't block response)
  runAnomalyDetection(bill).then(async (flags) => {
    if (flags.length > 0) {
      const hasCritical = flags.some(f => ['CRITICAL','HIGH'].includes(f.severity));
      await Bill.findByIdAndUpdate(bill._id, {
        $push: { aiFlags: { $each: flags.map(f => ({ ...f, detectedAt: new Date() })) } },
        ...(hasCritical ? { $set: { status: 'FLAGGED' } } : {}),
      });
    }
  }).catch(() => {});

  await createAuditLog({ action: 'BILL_CREATED', entityType: 'BILL', entityId: bill._id.toString(), user, req, newState: { billNumber, totalAmount: totalAmountCrore, status: 'SUBMITTED' } });

  res.status(201).json({ success: true, bill, message: 'Bill submitted successfully. Under AI review and Level 1 review.' });
}

async function getBills(req, res) {
  const user = req.user;
  const { status, stateCode, page = '1', limit = '20', search } = req.query;
  const filter = {};

  if (['STATE_OFFICER','STATE_ADMIN'].includes(user.role)) filter.stateCode = user.stateCode;
  else if (stateCode) filter.stateCode = stateCode;

  if (['CONTRACTOR','SUPPLIER','MEDIATOR'].includes(user.role)) {
    const entity = await Entity.findOne({ contactEmail: user.email });
    if (entity) filter['fundSplit.entityNicId'] = entity.nicEntityId;
  }

  if (status) filter.status = status;
  if (search) filter.$or = [
    { billNumber: { $regex: search, $options: 'i' } },
    { projectTitle: { $regex: search, $options: 'i' } },
    { stateName: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bills, total] = await Promise.all([
    Bill.find(filter).populate('raisedBy', 'name nicId').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Bill.countDocuments(filter),
  ]);

  res.json({ success: true, bills, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
}

async function getBillById(req, res) {
  const bill = await Bill.findById(req.params.id)
    .populate('raisedBy', 'name nicId designation')
    .populate('level1ReviewedBy', 'name nicId')
    .populate('level2ReviewedBy', 'name nicId')
    .populate('sanctionedBy', 'name nicId')
    .populate('stateSignedBy', 'name nicId')
    .populate('centralSignedBy', 'name nicId');
  if (!bill) throw new AppError('Bill not found', 404);

  const user = req.user;
  if (['STATE_OFFICER','STATE_ADMIN'].includes(user.role) && bill.stateCode !== user.stateCode) {
    throw new AppError('Access denied', 403);
  }
  res.json({ success: true, bill });
}

async function reviewBill(req, res) {
  const user = req.user;
  const { action, comments } = req.body;
  if (!['APPROVE','REJECT'].includes(action)) throw new AppError('Action must be APPROVE or REJECT', 400);

  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new AppError('Bill not found', 404);
  if (!['SUBMITTED','LEVEL1_REVIEW','LEVEL2_REVIEW','FLAGGED'].includes(bill.status)) {
    throw new AppError(`Bill is in ${bill.status} status and cannot be reviewed now`, 400);
  }

  const prevStatus = bill.status;
  if (action === 'REJECT') {
    if (!comments) throw new AppError('Rejection reason is required', 400);
    bill.status = 'REJECTED';
    bill.rejectedBy = user._id;
    bill.rejectedAt = new Date();
    bill.rejectionReason = comments;
  } else {
    if (['SUBMITTED','FLAGGED'].includes(bill.status)) {
      bill.status = 'LEVEL1_REVIEW';
      bill.level1ReviewedBy = user._id;
      bill.level1ReviewedAt = new Date();
      bill.level1Comments = comments;
    } else if (bill.status === 'LEVEL1_REVIEW') {
      bill.status = 'LEVEL2_REVIEW';
      bill.level2ReviewedBy = user._id;
      bill.level2ReviewedAt = new Date();
      bill.level2Comments = comments;
    } else {
      bill.status = 'AWAITING_STATE_SIGN';
      bill.level2ReviewedBy = user._id;
      bill.level2ReviewedAt = new Date();
      bill.level2Comments = comments;
    }
  }

  await bill.save();
  await createAuditLog({ action: `BILL_${action}`, entityType: 'BILL', entityId: bill._id.toString(), user, req, previousState: { status: prevStatus }, newState: { status: bill.status, comments } });
  res.json({ success: true, bill, message: `Bill ${action.toLowerCase()}d` });
}

async function signBill(req, res) {
  const user = req.user;
  const { otp, signatureType } = req.body;
  if (!otp || !signatureType) throw new AppError('OTP and signatureType required', 400);

  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new AppError('Bill not found', 404);

  const isValid = await verifyOTP(user.phone, otp, `bill_sign_${bill._id}`);
  if (!isValid) throw new AppError('Invalid or expired OTP', 400);

  if (signatureType === 'STATE') {
    if (user.role !== 'STATE_ADMIN') throw new AppError('Only State Admin can provide state signature', 403);
    if (bill.status !== 'AWAITING_STATE_SIGN') throw new AppError('Bill not awaiting state signature', 400);
    if (bill.stateCode !== user.stateCode) throw new AppError('State mismatch', 403);
    bill.stateSignedBy = user._id;
    bill.stateSignedAt = new Date();
    bill.status = 'AWAITING_CENTRAL_SIGN';
  } else if (signatureType === 'CENTRAL') {
    if (user.role !== 'CENTRAL_ADMIN') throw new AppError('Only Central Admin can provide central signature', 403);
    if (bill.status !== 'AWAITING_CENTRAL_SIGN') throw new AppError('Bill not awaiting central signature', 400);
    bill.centralSignedBy = user._id;
    bill.centralSignedAt = new Date();
    bill.status = 'SANCTIONED';
    bill.sanctionedBy = user._id;
    bill.sanctionedAt = new Date();
    bill.sanctionOrderNumber = `SO-${bill.billNumber}-${Date.now()}`;
    const hashData = JSON.stringify({ billNumber: bill.billNumber, totalAmount: bill.totalAmount, fundSplit: bill.fundSplit, sanctionedAt: bill.sanctionedAt, sanctionedBy: user.nicId });
    bill.blockchainHash = crypto.createHash('sha256').update(hashData).digest('hex');
  } else {
    throw new AppError('signatureType must be STATE or CENTRAL', 400);
  }

  await bill.save();
  await createAuditLog({ action: `BILL_SIGNED_${signatureType}`, entityType: 'BILL', entityId: bill._id.toString(), user, req, newState: { status: bill.status } });
  res.json({ success: true, bill, message: `${signatureType} signature applied successfully` });
}

async function disburseBill(req, res) {
  const user = req.user;
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new AppError('Bill not found', 404);
  if (bill.status !== 'SANCTIONED') throw new AppError('Only sanctioned bills can be disbursed', 400);

  bill.status = 'DISBURSING';
  for (const split of bill.fundSplit) {
    // In production: trigger NEFT/RTGS via MoF payment gateway per entity's bank account
    split.disbursed = true;
    split.disbursedAt = new Date();
    split.transactionRef = `TXN-${bill.billNumber}-${split.entityNicId}-${Date.now()}`;
  }
  bill.status = 'DISBURSED';
  await bill.save();

  await createAuditLog({ action: 'BILL_DISBURSED', entityType: 'BILL', entityId: bill._id.toString(), user, req, newState: { status: 'DISBURSED' } });
  res.json({ success: true, bill, message: 'Funds disbursed to all beneficiaries' });
}

module.exports = { createBill, getBills, getBillById, reviewBill, signBill, disburseBill };
