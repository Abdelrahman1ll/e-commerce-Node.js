const Joi = require("joi");

const validateMaintenance = (odj) => {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .valid("ثلاجة", "ديب فريزر", "غسالة اتوماتيك", "سخان", "بوتجاز"),
    description: Joi.string().required(),
    image: Joi.string().required(),
    alias: Joi.string().required().valid("المنزل", "العمل"),
    details: Joi.string().required(),
    phone: Joi.string()
      .pattern(/^01[0-25]\d{8}$/)
      .required(),
    city: Joi.string().required(),
    postalCode: Joi.string(),
  });
  return schema.validate(odj);
};

module.exports = validateMaintenance;