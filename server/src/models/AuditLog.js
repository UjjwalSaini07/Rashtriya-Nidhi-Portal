const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action:           { type: String, required: true, index: true },
  entityType:       { type: String, required: true },
  entityId:         { type: String, required: true, index: true },
  performedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedByNicId: { type: String, required: true },
  performedByName:  { type: String, required: true },
  performedByRole:  { type: String, required: true },
  ipAddress:        { type: String, required: true },
  userAgent:        String,
  metadata:         { type: mongoose.Schema.Types.Mixed, default: {} },
  previousState:    mongoose.Schema.Types.Mixed,
  newState:         mongoose.Schema.Types.Mixed,
  dataHash:         { type: String, required: true, unique: true },
  previousHash:     { type: String, required: true },
  blockNumber:      { type: Number, required: true, unique: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Audit logs are immutable
AuditLogSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function() {
  throw new Error('Audit logs are immutable');
});

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
