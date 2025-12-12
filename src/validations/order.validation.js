const Joi = require("joi");

const createOrderSchema = Joi.object({
  customerName: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  productId: Joi.string().required(),
  quantity: Joi.number().min(1).default(1),
  priceAtOrderTime: Joi.number().min(0).required(),
  agentId: Joi.string().required(),
  awb: Joi.string().allow(null, ""),
  orderStatus: Joi.string().valid(
    "Pending","Confirmed","Packed","Shipped","In Transit",
    "Out For Delivery","Delivered","RTO Initiated","RTO Received",
    "Returned","Cancelled"
  ).default("Pending"),
  paymentStatus: Joi.string().valid("Pending","Paid","Failed","Refunded").default("Pending"),
  paymentMode: Joi.string().valid("COD","Online").default("COD"),
  remarks: Joi.string().allow(null, "")
});

const updateOrderSchema = Joi.object({
  id: Joi.string().required(),
  customerName: Joi.string().trim(),
  address: Joi.string().trim(),
  pincode: Joi.string().pattern(/^\d{6}$/),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/),
  productId: Joi.string(),
  quantity: Joi.number().min(1),
  priceAtOrderTime: Joi.number().min(0),
  agentId: Joi.string(),
  awb: Joi.string().allow(null, ""),
  orderStatus: Joi.string().valid(
    "Pending","Confirmed","Packed","Shipped","In Transit",
    "Out For Delivery","Delivered","RTO Initiated","RTO Received",
    "Returned","Cancelled"
  ),
  paymentStatus: Joi.string().valid("Pending","Paid","Failed","Refunded"),
  paymentMode: Joi.string().valid("COD","Online"),
  remarks: Joi.string().allow(null, "")
}).or(
  "customerName", "address", "pincode", "phone", "productId", 
  "quantity", "priceAtOrderTime", "agentId", "awb", 
  "orderStatus", "paymentStatus", "paymentMode", "remarks"
); 

module.exports = { createOrderSchema, updateOrderSchema };
