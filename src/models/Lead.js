const mongoose = require('mongoose');
const leadSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  service: { type: String },
  address: { type: String },
  status: { type: String, enum: ['Ring','Follow Up','Sale Done','Not Interested','Switch Off','Incoming'], default: 'Ring' },
  remarks: [{ text: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Lead', leadSchema);