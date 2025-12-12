const Order = require("../models/Order");
const {
  createOrderSchema,
  updateOrderSchema,
  updateStatusSchema,
  updatePaymentSchema,
  updateCourierSchema,
  getOrdersSchema,
} = require("../validations/order.validation");

// ---------------------------------------------------------
// CREATE ORDER
// ---------------------------------------------------------
exports.createOrder = async (req, res) => {
  try {
    const { error } = createOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const order = await Order.create(req.body);

    res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// GET ALL ORDERS (FILTER + PAGINATION)
// ---------------------------------------------------------
exports.getAllOrders = async (req, res) => {
  try {
    const { error } = getOrdersSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const {
      page = 1,
      limit = 20,
      agentId,
      teamHeadId,
      productId,
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
    } = req.body;

    let filter = {};

    if (agentId) filter.agentId = agentId;
    if (teamHeadId) filter.teamHeadId = teamHeadId;
    if (productId) filter.productId = productId;
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate("productId")
      .populate("agentId")
      .populate("teamHeadId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      message: "Orders fetched successfully",
      total,
      page,
      limit,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// GET ONE ORDER
// ---------------------------------------------------------
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.body.orderId;  // <-- FIXED

    if (!orderId)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findById(orderId)
      .populate("productId")
      .populate("agentId")
      .populate("teamHeadId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// UPDATE ORDER
// ---------------------------------------------------------
exports.updateOrder = async (req, res) => {
  try {
    const { error } = updateOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const orderId = req.body.orderId;

    if (!orderId)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// UPDATE ORDER STATUS
// ---------------------------------------------------------
exports.updateOrderStatus = async (req, res) => {
  try {
    const { error } = updateStatusSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    if (!req.body.id)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findByIdAndUpdate(
      req.body.id,
      {
        orderStatus: req.body.orderStatus,
        $push: {
          trackingLogs: {
            status: req.body.orderStatus,
            message: req.body.message || "Status updated",
          },
        },
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      message: "Order status updated",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// UPDATE PAYMENT STATUS
// ---------------------------------------------------------
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { error } = updatePaymentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    if (!req.body.id)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findByIdAndUpdate(
      req.body.id,
      {
        paymentStatus: req.body.paymentStatus,
        transactionId: req.body.transactionId,
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      message: "Payment status updated",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// UPDATE COURIER DETAILS (AWB + PARTNER)
// ---------------------------------------------------------
exports.updateCourierDetails = async (req, res) => {
  try {
    const { error } = updateCourierSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    if (!req.body.id)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findByIdAndUpdate(
      req.body.id,
      {
        awb: req.body.awb,
        courierPartner: req.body.courierPartner,
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      message: "Courier details updated",
      data: order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------
// DELETE ORDER
// ---------------------------------------------------------
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;  

    if (!orderId)
      return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

