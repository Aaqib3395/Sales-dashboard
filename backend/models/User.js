const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    salt: { type: String },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Sales Rep'],
      default: 'Sales Rep',
    },
    team: {
      type: String,
      enum: ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', ''],
      default: '',
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    isActive: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    emailDigestEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save using pbkdf2
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto.pbkdf2Sync(this.password, this.salt, 10000, 64, 'sha512').toString('hex');
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  const hash = crypto.pbkdf2Sync(candidatePassword, this.salt, 10000, 64, 'sha512').toString('hex');
  return this.password === hash;
};

// Remove password and salt from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.salt;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
