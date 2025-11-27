const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const payload = req.body;
    if (req.file) payload.image = req.file.path;
    const p = await Product.create(payload);
    res.status(201).json(p);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) updates.image = req.file.path;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(product);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};
