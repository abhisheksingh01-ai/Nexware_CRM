const Joi = require("joi");

// Helper for ObjectId validation
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

const createOrderSchema = Joi.object({
  customerName: Joi.string().trim().required(),
  address: Joi.string().trim().required(),

  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .message("Pincode must be exactly 6 digits")
    .required(),

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .message("Phone must be a valid 10-digit number starting with 6-9")
    .required(),

  productId: objectId.required().messages({ "string.pattern.base": "Invalid Product ID" }),
  agentId: objectId.required().messages({ "string.pattern.base": "Invalid Agent ID" }),
  
  quantity: Joi.number().min(1).default(1),
  priceAtOrderTime: Joi.number().min(0).required(),

  // Payment Mode
  paymentMode: Joi.string()
    .valid("COD", "Partial Payment", "Full Payment")
    .required(),

  // 🔥 FIXED: Changed min(1) to min(0) and added allow(null, "") for safety
  depositedAmount: Joi.when("paymentMode", {
    is: "Partial Payment",
    then: Joi.number().min(0).required().messages({
      "any.required": "Deposited amount is required for partial payment",
    }),
    otherwise: Joi.number().allow(null, "", 0).default(0),
  }),

  // 🔥 FIXED: Changed min(1) to min(0) 
  // (Remaining can be 0 if they pay fully in partial mode)
  remainingAmount: Joi.when("paymentMode", {
    is: "Partial Payment",
    then: Joi.number().min(0).required().messages({
      "any.required": "Remaining amount is required for partial payment",
    }),
    otherwise: Joi.number().allow(null, "", 0).default(0),
  }),

  // Statuses
  orderStatus: Joi.string().valid(
    "Pending", "Confirmed", "Packed", "Shipped", "In Transit", 
    "Out For Delivery", "Delivered", "RTO Initiated", "RTO Received", 
    "Returned", "Cancelled"
  ).default("Pending"),

  paymentStatus: Joi.string()
    .valid("Pending", "Paid", "Failed", "Refunded")
    .default("Pending"),

  awb: Joi.string().allow(null, ""),
  remarks: Joi.string().allow(null, ""),
});

// UPDATE ORDER SCHEMA
const updateOrderSchema = Joi.object({
  id: objectId.required().messages({
    "string.pattern.base": "Invalid order ID",
  }),
  customerName: Joi.string().trim(),
  address: Joi.string().trim(),
  pincode: Joi.string().pattern(/^\d{6}$/),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/),
  productId: objectId,
  quantity: Joi.number().min(1),
  priceAtOrderTime: Joi.number().min(0),
  agentId: objectId,
  awb: Joi.string().allow(null, ""),
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
  paymentStatus: Joi.string().valid("Pending", "Paid", "Failed", "Refunded"),
  paymentMode: Joi.string().valid("COD", "Partial Payment", "Full Payment"),
  
  // Fixed Update Logic as well
  depositedAmount: Joi.number().min(0).allow(null),
  remainingAmount: Joi.number().min(0).allow(null),
  
  remarks: Joi.string().allow(null, ""),
}).min(1);

module.exports = {
  createOrderSchema,
  updateOrderSchema,
};