const mongoose = require('mongoose');
const priceListSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number },
}, { timestamps: true });
module.exports = mongoose.model('PriceList', priceListSchema);