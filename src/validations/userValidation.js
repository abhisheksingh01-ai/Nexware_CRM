const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!value) return value;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const strongPassword = Joi.string()
  .min(8)
  .max(32)
  .pattern(/[A-Z]/, "uppercase letter")
  .pattern(/[a-z]/, "lowercase letter")
  .pattern(/[0-9]/, "number")
  .pattern(/[!@#$%^&*(),.?":{}|<>]/, "special character")
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters",
    "string.pattern.name": "Password must include at least {#name}",
  });

const phoneValidation = Joi.string()
  .pattern(/^[0-9]{10}$/)
  .allow("", null)
  .messages({ "string.pattern.base": "Phone must be a valid 10-digit number" });

const roleValidation = Joi.string()
  .valid("admin", "subadmin", "teamhead", "agent")
  .required();

const baseUserSchema = {
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: strongPassword,
  phone: phoneValidation,
  role: roleValidation,
  teamHeadId: Joi.when("role", {
    is: "agent",
    then: Joi.string().custom(objectId).required(),
    otherwise: Joi.string().allow(null, ""),
  }),
  status: Joi.string().valid("active", "inactive").default("active"),
};

// Create/Register Validation
exports.createUserValidation = (data) => {
  const schema = Joi.object(baseUserSchema).unknown(false);
  return schema.validate(data, { abortEarly: false });
};

exports.registerValidation = (data) => {
  const schema = Joi.object(baseUserSchema).unknown(false);
  return schema.validate(data, { abortEarly: false });
};

// Update Validation
exports.updateUserValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional(),
    phone: phoneValidation,
    status: Joi.string().valid("active", "inactive").optional(),
    role: roleValidation.optional(),
    teamHeadId: Joi.string().custom(objectId).allow(null, "").optional(),
    password: strongPassword.optional()
  }).unknown(false);
  return schema.validate(data, { abortEarly: false });
};

// Login Validation
exports.loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).required(),
  }).unknown(false);
  return schema.validate(data, { abortEarly: false });
};
