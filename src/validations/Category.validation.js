const Joi = require("joi");
const ValidationCreateCategory = (odj) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
  });
  return schema.validate(odj);
};

const ValidationUpdateCategory = (odj) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/) // regex للـ ObjectId
      .required(),
    name: Joi.string().min(3).max(20),
  });
  return schema.validate(odj);
};

module.exports = {
  ValidationCreateCategory,
  ValidationUpdateCategory,
};
