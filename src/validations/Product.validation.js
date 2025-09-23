const Joi = require("joi");

const ValidationCreateProduct = (odj) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().required(),
    images: Joi.array().required(),
    brand: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/) // regex للـ ObjectId
      .required(),
    category: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/) // regex للـ ObjectId
      .required(),
    price: Joi.number().required(),
    PriceBeforeDiscount: Joi.number(),
    quantity: Joi.number().required(),
  });
  return schema.validate(odj);
};

const ValidationUpdateProduct = (odj) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/) // regex للـ ObjectId
      .required(),
    title: Joi.string().min(3),
    description: Joi.string(),
    images: Joi.array(),
    brand: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // regex للـ ObjectId
    category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // regex للـ ObjectId
    price: Joi.number(),
    PriceBeforeDiscount: Joi.number(),
    quantity: Joi.number(),
    // إذا كنت تستخدم Joi
    dleteImg: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string() // عشان لو جاية واحدة فقط
    ),
  });
  return schema.validate(odj);
};

module.exports = { ValidationCreateProduct, ValidationUpdateProduct };