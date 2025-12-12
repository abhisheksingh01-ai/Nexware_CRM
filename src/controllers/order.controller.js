const Order = require("../models/Order");
const { createOrderSchema, updateOrderSchema } = require("../validations/order.validation");
const mongoose = require("mongoose");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { error } = createOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    // totalAmount will be calculated automatically in pre("save")
    const order = new Order(req.body);
    const savedOrder = await order.save();

    res.status(201).json({ success: true, data: savedOrder });
  } catch (err) {
    console.error("ORDER SAVE ERROR →", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("productId", "name price")
      .populate("agentId", "name email")
      .sort({ createdAt: -1 });

    const orderList = orders.map(o => ({
      id: o._id,
      customerName: o.customerName,
      phone: o.phone,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount,
      date: o.createdAt,
    }));

    res.status(200).json({ success: true, data: orderList });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ success: false, message: "Order ID required" });

    const order = await Order.findById(orderId)
      .populate("productId", "name price")
      .populate("agentId", "name email");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const { error } = updateOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ success: false, errors: messages });
    }

    const { id, quantity, priceAtOrderTime, ...rest } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Order ID required" });

    // Recalculate totalAmount if quantity or priceAtOrderTime is provided
    const updateData = { ...rest };
    if (quantity !== undefined) updateData.quantity = quantity;
    if (priceAtOrderTime !== undefined) updateData.priceAtOrderTime = priceAtOrderTime;
    if (quantity !== undefined || priceAtOrderTime !== undefined) {
      const currentOrder = await Order.findById(id);
      if (!currentOrder) return res.status(404).json({ success: false, message: "Order not found" });

      const finalQuantity = quantity !== undefined ? quantity : currentOrder.quantity;
      const finalPrice = priceAtOrderTime !== undefined ? priceAtOrderTime : currentOrder.priceAtOrderTime;
      updateData.totalAmount = finalQuantity * finalPrice;
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("productId", "name price")
      .populate("agentId", "name email");

    if (!updatedOrder) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order updated successfully", data: updatedOrder });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "Order ID required" });

    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
