const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  nicEntityId:  { type: String, required: true, unique: true, uppercase: true, index: true },
  type:         { type: String, enum: ['CONTRACTOR','SUPPLIER','MEDIATOR','STATE_DEPT'], required: true },
  name:         { type: String, required: true, trim: true, maxlength: 200 },
  gstNumber:    { type: String, uppercase: true, trim: true, match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST'] },
  panNumber:    { type: String, required: true, uppercase: true, trim: true, match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN'] },
  aadhaarLinked: { type: Boolean, default: false },
  bankAccountNumber: { type: String, required: true }, // stored AES-256 encrypted
  bankIfsc:     { type: String, required: true, uppercase: true, match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC'] },
  bankName:     { type: String, required: true },
  bankBranch:   { type: String, required: true },
  stateCode:    { type: String, required: true, uppercase: true },
  address:      { type: String, required: true, maxlength: 500 },
  contactEmail: { type: String, required: true, lowercase: true },
  contactPhone: { type: String, required: true, match: [/^[6-9]\d{9}$/, 'Invalid phone'] },
  gstVerified:  { type: Boolean, default: false },
  panVerified:  { type: Boolean, default: false },
  gstVerifiedAt: Date,
  panVerifiedAt: Date,
  gstDetails:   mongoose.Schema.Types.Mixed,
  panDetails:   mongoose.Schema.Types.Mixed,
  isActive:     { type: Boolean, default: true },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documents: [{
    docType: String,
    filename: String,
    path: String,
    hash: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Entity', EntitySchema);
