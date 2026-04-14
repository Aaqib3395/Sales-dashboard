const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: {
      type: String,
      enum: ['Sales Rep', 'Senior Sales Rep', 'Team Lead', 'Account Executive', 'Sales Manager'],
      default: 'Sales Rep',
    },
    team: {
      type: String,
      enum: ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'],
      default: 'Team Alpha',
    },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    hireDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    target: { type: Number, default: 50000 }, // monthly revenue target
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
