const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['monthly', 'quarterly'], default: 'monthly' },
    targetAmount: { type: Number, required: true, min: 0 },
    month: { type: Number, min: 1, max: 12 },      // 1-12
    quarter: { type: Number, min: 1, max: 4 },      // 1-4
    year: { type: Number, required: true },
    teamTarget: { type: Boolean, default: false },
    team: { type: String, default: '' },
  },
  { timestamps: true }
);

goalSchema.index({ employeeId: 1, year: 1, month: 1 });
goalSchema.index({ team: 1, year: 1 });

module.exports = mongoose.model('Goal', goalSchema);
