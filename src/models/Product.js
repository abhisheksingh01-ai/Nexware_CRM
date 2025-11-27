const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);