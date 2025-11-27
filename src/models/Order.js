const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  customerName: String,
  address: String,
  pincode: String,
  phone: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamHeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  awb: String,
  paymentStatus: { type: String, enum: ['Pending','Paid','Failed'], default: 'Pending' },
  status: { type: String, enum: ['Pending','In Transit','Delivered','RTO','Returned','Cancelled'], default: 'Pending' },
}, { timestamps: true });
module.exports = mongoose.model('Order', orderSchema);