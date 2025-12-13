const Order = require("../models/Order");
const {
  createOrderSchema,
  updateOrderSchema,
} = require("../validations/order.validation");

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    // 🔥 Payment logic
    if (value.paymentMode !== "Partial Payment") {
      value.depositedAmount = 0;
      value.remainingAmount = 0;
    }

    const order = new Order(value);
    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR →", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET ALL ORDERS
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("productId", "name price")
      .populate("agentId", "name email")
      .sort({ createdAt: -1 });

    const orderList = orders.map((o) => ({
      id: o._id,
      customerName: o.customerName,
      phone: o.phone,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMode: o.paymentMode,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
    }));

    res.status(200).json({ success: true, data: orderList });
  } catch (error) {
    console.error("GET ORDERS ERROR →", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.query;

    const order = await Order.findById(orderId)
      .populate("productId", "name price")
      .populate("agentId", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("GET ORDER ERROR →", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE ORDER
exports.updateOrder = async (req, res) => {
  try {
    const { error, value } = updateOrderSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    const { id, quantity, priceAtOrderTime, ...updateData } = value;

    // Fetch current order if price/quantity changes
    if (quantity !== undefined || priceAtOrderTime !== undefined) {
      const existingOrder = await Order.findById(id);
      if (!existingOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      const finalQuantity =
        quantity !== undefined ? quantity : existingOrder.quantity;
      const finalPrice =
        priceAtOrderTime !== undefined
          ? priceAtOrderTime
          : existingOrder.priceAtOrderTime;

      updateData.quantity = finalQuantity;
      updateData.priceAtOrderTime = finalPrice;
      updateData.totalAmount = finalQuantity * finalPrice;
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("productId", "name price")
      .populate("agentId", "name email");

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE ORDER ERROR →", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE ORDER
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR →", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
