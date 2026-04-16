const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: '' },
    email: { type: String, lowercase: true, default: '' },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

clientSchema.index({ name: 'text', company: 'text' });

module.exports = mongoose.model('Client', clientSchema);
