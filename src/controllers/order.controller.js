const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.getOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'agent') filter.agentId = req.user._id;
    const orders = await Order.find(filter).populate('productId');
    res.json(orders);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};