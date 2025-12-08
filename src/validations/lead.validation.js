const Joi = require("joi");

const createLeadSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    service: Joi.string().min(2).max(100).required(),
    address: Joi.string().max(250).optional(),
    assignedTo: Joi.string().optional(),
});

const updateLeadSchema = Joi.object({
    status: Joi.string().valid("Ring","Follow Up","Sale Done","Not Interested","Switch Off","Incoming").optional(),
    remarks: Joi.string().max(500).optional(),
    assignedTo: Joi.string().optional(),
});


module.exports = { createLeadSchema, updateLeadSchema };
