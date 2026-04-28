const mongoose = require('mongoose');

const BillSplitSchema = new mongoose.Schema({
  entityId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  entityNicId:  { type: String, required: true },
  entityName:   { type: String, required: true },
  entityType:   { type: String, required: true },
  amount:       { type: Number, required: true, min: 0 },   // in Crores
  amountPaise:  { type: Number, required: true, min: 0 },   // exact paise
  percentage:   { type: Number, required: true, min: 0, max: 100 },
  disbursed:    { type: Boolean, default: false },
  disbursedAt:  Date,
  transactionRef: String,
}, { _id: false });

const BillSchema = new mongoose.Schema({
  billNumber:     { type: String, required: true, unique: true, uppercase: true, index: true },
  stateCode:      { type: String, required: true, uppercase: true },
  stateName:      { type: String, required: true },
  department:     { type: String, required: true },
  projectTitle:   { type: String, required: true, trim: true, maxlength: 300 },
  projectDescription: { type: String, required: true, maxlength: 2000 },
  projectCategory: {
    type: String,
    enum: ['ROADS_TRANSPORT','WATER_RESOURCES','HEALTH','EDUCATION','URBAN_DEV','AGRICULTURE','ENERGY','DEFENSE','MISC'],
    required: true,
  },
  totalAmount:    { type: Number, required: true, min: 0 },
  totalAmountPaise: { type: Number, required: true, min: 0 },
  expectedCompletionDate: { type: Date, required: true },
  fundSplit:      { type: [BillSplitSchema], required: true },
  status: {
    type: String,
    enum: ['DRAFT','SUBMITTED','LEVEL1_REVIEW','LEVEL2_REVIEW','AWAITING_STATE_SIGN','AWAITING_CENTRAL_SIGN','SANCTIONED','DISBURSING','DISBURSED','REJECTED','FLAGGED'],
    default: 'DRAFT',
    index: true,
  },
  raisedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raisedByNicId:  { type: String, required: true },
  level1ReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level1ReviewedAt: Date,
  level1Comments: String,
  level2ReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level2ReviewedAt: Date,
  level2Comments: String,
  stateSignOtpHash: { type: String, select: false },
  stateSignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stateSignedAt:  Date,
  centralSignOtpHash: { type: String, select: false },
  centralSignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  centralSignedAt: Date,
  sanctionedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sanctionedAt:   Date,
  sanctionOrderNumber: String,
  rejectedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt:     Date,
  rejectionReason: String,
  aiFlags: [{
    flagType:   String,
    severity:   { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'] },
    message:    String,
    detectedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  documents: [{
    docType: String,
    filename: String,
    path: String,
    hash: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  blockchainHash: String,
  blockNumber:    Number,
}, { timestamps: true });

BillSchema.index({ stateCode: 1, status: 1 });
BillSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bill', BillSchema);
