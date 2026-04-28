const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nicId:        { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, required: true, match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number'] },
  password:     { type: String, required: true, minlength: 8, select: false },
  role: {
    type: String,
    enum: ['CENTRAL_ADMIN','CENTRAL_REVIEWER','STATE_ADMIN','STATE_OFFICER','CONTRACTOR','SUPPLIER','MEDIATOR','AUDITOR','PUBLIC'],
    required: true,
  },
  stateCode:    { type: String, uppercase: true, trim: true },
  department:   { type: String, trim: true },
  designation:  { type: String, trim: true },
  isActive:     { type: Boolean, default: true },
  isVerified:   { type: Boolean, default: false },
  aadhaarVerified: { type: Boolean, default: false },
  lastLogin:    Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil:    Date,
  refreshTokens: { type: [String], select: false },
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.__v;
      return ret;
    }
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  next();
});

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

module.exports = mongoose.model('User', UserSchema);
