const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const {getAll,deleteOne} = require("./handlerFactory");
const {Customer,validateCustomer,UpdateCustomer} = require("../models/CustomersWhoAreNotOnTheSite");

/**
 * @desc   Get All Customers Who Are Not On The Site
 * @route   /api/customers
 * @method GET
 * @access Public
**/
const GetAllCustomer = getAll(Customer);

/**
 * @desc   Create Customer
 * @route   /api/customers
 * @method POST
 * @access Private
**/
const createCustomer = asyncHandler(async (req, res) => {
    const { name, phoneNumber, data } = req.body;
    const { error } = validateCustomer(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    const customerExists = await Customer.findOne({ phoneNumber });
    if(customerExists){
        throw new ApiError("Customer already exists.", 409);
    }
    const customer = await Customer.create({ name, phoneNumber, data });
    res.status(201).send({
      data: { customer },
      status: "success",
    });
});

/**
 * @desc   update a Customer
 * @route   /api/customers/:id
 * @method PUT
 * @access Private
**/
const updateCustomer = asyncHandler(async (req, res) => {
    const { name, phoneNumber, data } = req.body;
    const { error } = UpdateCustomer(req.body);
    if (error) {
      return res.status(400).json({error: error.details[0].message});
    }
    const customer = await Customer.findByIdAndUpdate(req.params.id,
      {name, phoneNumber, data},
      {new: true});
      
    res.status(201).send({
         data: { customer },
         status: 'success',
    });
});

/**
 * @desc   Delete Customer  
 * @route   /api/customers/:id
 * @method DELETE
 * @access Private
**/
const deleteCustomer = deleteOne(Customer);



module.exports = {GetAllCustomer,createCustomer,updateCustomer,deleteCustomer};