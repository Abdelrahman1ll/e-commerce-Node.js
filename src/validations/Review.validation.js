const Joi = require("joi");

const ValidationCreateReview = (odj) => {
    const schema = Joi.object({
      review: Joi.string().required(),
      rating: Joi.number().min(1).max(5).required(),
      product: Joi.string().required(),
    });
    return schema.validate(odj);
  };

  const ValidationUpdateReview = (odj) => {
    const schema = Joi.object({
      review: Joi.string(),
      rating: Joi.number().min(1).max(5),
    });
    return schema.validate(odj);
  };

  module.exports = {
    ValidationCreateReview,
    ValidationUpdateReview,
  };