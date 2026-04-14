const mongoose = require('mongoose');

const salesRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['lead', 'follow-up', 'negotiation', 'closed'],
      default: 'lead',
    },
    clientName: { type: String, required: true, trim: true },
    product: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    probability: { type: Number, min: 0, max: 100, default: 50 }, // % chance of closing
  },
  { timestamps: true }
);

// Indexes for performance
salesRecordSchema.index({ employeeId: 1, date: -1 });
salesRecordSchema.index({ date: -1 });
salesRecordSchema.index({ status: 1 });

module.exports = mongoose.model('SalesRecord', salesRecordSchema);
