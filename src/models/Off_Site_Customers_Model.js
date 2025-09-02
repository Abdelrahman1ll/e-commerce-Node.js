const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    data: {
        type: String,
        required: true,
    },
    
},{timestamps: true});

const validateCustomer = (customer) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        phoneNumber: Joi.string().pattern(/^01[0-25]\d{8}$/).required(),
        data: Joi.string().required(),
    });
    return schema.validate(customer);
};

const UpdateCustomer = (customer) => {
    const schema = Joi.object({
        name: Joi.string(),
        phoneNumber: Joi.string().pattern(/^01[0-25]\d{8}$/),
        data: Joi.string(),
    });
    return schema.validate(customer);
};

const Customer = mongoose.model("Customer", customerSchema);


module.exports = {Customer,validateCustomer,UpdateCustomer};
