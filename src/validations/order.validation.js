const Joi = require("joi");
const mongoose = require("mongoose");

// Custom ObjectId validator
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};


const createOrderSchema = Joi.object({
  customerName: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  productId: Joi.string().custom(objectId).required(),
  quantity: Joi.number().min(1).default(1),
  priceAtOrderTime: Joi.number().min(0).required(),
  totalAmount: Joi.number().min(0).required(),
  agentId: Joi.string().custom(objectId).required(),
  teamHeadId: Joi.string().custom(objectId).allow(null),
  createdBy: Joi.string().custom(objectId).required(),
  awb: Joi.string().trim().allow(null, ""),
  courierPartner: Joi.string().trim().allow(null, ""),
  expectedDelivery: Joi.date().allow(null),
  paymentMode: Joi.string().valid("COD", "Online").default("COD"),
  paymentStatus: Joi.string()
    .valid("Pending", "Paid", "Failed", "Refunded")
    .default("Pending"),
  transactionId: Joi.string().allow(null, ""),
  remarks: Joi.string().allow(null, ""),
});

// -------------------------
// UPDATE ORDER (FULL UPDATE)
// -------------------------
const updateOrderSchema = Joi.object({
  customerName: Joi.string().trim(),
  address: Joi.string().trim(),
  pincode: Joi.string().trim(),
  phone: Joi.string().trim(),
  productId: Joi.string().custom(objectId),
  quantity: Joi.number().min(1),
  priceAtOrderTime: Joi.number().min(0),
  totalAmount: Joi.number().min(0),
  agentId: Joi.string().custom(objectId),
  teamHeadId: Joi.string().custom(objectId).allow(null),
  createdBy: Joi.string().custom(objectId),
  awb: Joi.string().trim().allow(null, ""),
  courierPartner: Joi.string().trim().allow(null, ""),
  expectedDelivery: Joi.date().allow(null),
  paymentMode: Joi.string().valid("COD", "Online"),
  paymentStatus: Joi.string().valid("Pending", "Paid", "Failed", "Refunded"),
  orderStatus: Joi.string().valid(
    "Pending",
    "Confirmed",
    "Packed",
    "Shipped",
    "In Transit",
    "Out For Delivery",
    "Delivered",
    "RTO Initiated",
    "RTO Received",
    "Returned",
    "Cancelled"
  ),
  transactionId: Joi.string().allow(null, ""),
  remarks: Joi.string().allow(null, ""),
});

// -------------------------
// UPDATE ORDER STATUS ONLY
// -------------------------
const updateStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid(
      "Pending",
      "Confirmed",
      "Packed",
      "Shipped",
      "In Transit",
      "Out For Delivery",
      "Delivered",
      "RTO Initiated",
      "RTO Received",
      "Returned",
      "Cancelled"
    )
    .required(),
});

// -------------------------
// UPDATE PAYMENT STATUS
// -------------------------
const updatePaymentSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid("Pending", "Paid", "Failed", "Refunded")
    .required(),

  transactionId: Joi.string().allow(null, ""),
});

// -------------------------
// UPDATE AWB / COURIER
// -------------------------
const updateCourierSchema = Joi.object({
  awb: Joi.string().trim().required(),
  courierPartner: Joi.string().trim().required(),
});

// -------------------------
// FILTER / SEARCH / PAGINATION
// -------------------------
const getOrdersSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).default(20),
  agentId: Joi.string().custom(objectId).allow(null),
  teamHeadId: Joi.string().custom(objectId).allow(null),
  productId: Joi.string().custom(objectId).allow(null),
  paymentStatus: Joi.string().valid("Pending", "Paid", "Failed", "Refunded"),
  orderStatus: Joi.string().valid(
    "Pending",
    "Confirmed",
    "Packed",
    "Shipped",
    "In Transit",
    "Out For Delivery",
    "Delivered",
    "RTO Initiated",
    "RTO Received",
    "Returned",
    "Cancelled"
  ),
  startDate: Joi.date(),
  endDate: Joi.date(),
});
module.exports = {
  createOrderSchema,
  updateOrderSchema,
  updateStatusSchema,
  updatePaymentSchema,
  updateCourierSchema,
  getOrdersSchema,
};
