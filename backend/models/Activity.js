const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    action: {
      type: String,
      enum: ['deal_created', 'deal_updated', 'deal_closed', 'status_changed', 'lead_added', 'employee_added', 'client_added'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ employeeId: 1 });

module.exports = mongoose.model('Activity', activitySchema);
