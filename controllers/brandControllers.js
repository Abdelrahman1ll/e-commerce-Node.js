const asyncHandler = require("express-async-handler");
const { Brand,ValidationCreateBrand,ValidationUpdateBrand } = require("../models/brand");
const ApiError = require("../utils/ApiError");
const {deleteOne,getAll,getOne} = require("./handlerFactory");

/**
 * @desc   get Brands 
 * @route   /api/brand
 * @method  GET
 * @access  Public
**/
const getBrands = getAll(Brand);

/**
 * @desc   get Brand by id
 * @route   /api/brand/:id
 * @method  GET
 * @access  Public
**/
const getBrandById = getOne(Brand);

/**
 * @desc   create a Brand
 * @route   /api/brand
 * @method  POST
 * @access  Private
**/
const createBrand = asyncHandler(async (req, res) => {
    const { error } = ValidationCreateBrand(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const brand = new Brand({name: req.body.name});

    await brand.save();
    res.status(201).send({
         data: { brand },
         status: 'success',
    });
});

/**
 * @desc   update a Brand
 * @route   /api/brand/:id
 * @method  PUT
 * @access  Private
**/
const updateBrand = asyncHandler(async (req, res) => {
    const { error } = ValidationUpdateBrand(req.body);
    if (error) {
        return res.status(400).json({error: error.details[0].message});
    }
    const brand = await Brand.findByIdAndUpdate(req.params.id,
    {name: req.body.name},
    {new: true});
    
    res.status(201).send({
         data: { brand },
         status: 'success',
    });
});

/**
 * @desc   delete a Brand
 * @route   /api/brand/:id
 * @method  DELETE
 * @access  Private
**/
const deleteBrand = deleteOne(Brand);

module.exports = {getBrands,getBrandById,createBrand,updateBrand,deleteBrand};