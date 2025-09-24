const Joi = require("joi");

const ValidationSignup = (odj) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^01[0-25]\d{8}$/)
      .required(),
    password: Joi.string()
      .min(6)
      .max(30)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,30}$/)
      .required(),
    passwordConfirm: Joi.string().valid(Joi.ref("password")).required(),
    role: Joi.string().valid("user", "admin").default("user"),
  });
  return schema.validate(odj);
};

const ValidationLogin = (odj) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });
  return schema.validate(odj);
};
const ValidationUpdate = (odj) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    name: Joi.string().min(3).max(20),
    lastName: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^01[0-25]\d{8}$/),
  });
  return schema.validate(odj);
};

const validateEmail = (odj) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(odj);
};

const validateResetCode = (odj) => {
  const schema = Joi.object({
    resetCode: Joi.number().required(),
    email: Joi.string().email().required(),
  });
  return schema.validate(odj);
};

const validatePassword = (odj) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    passwordConfirm: Joi.string().valid(Joi.ref("password")).required(),
  });
  return schema.validate(odj);
};

const validateAddress = (odj) => {
  const schema = Joi.object({
    details: Joi.string().required(),
    phone: Joi.string()
      .pattern(/^01[0-25]\d{8}$/)
      .required(),
    city: Joi.string().required(),
    postalCode: Joi.string(),
    alias: Joi.string().required(),
  });
  return schema.validate(odj);
};

const validateUpdateAddress = (odj) => {
  const schema = Joi.object({
    details: Joi.string(),
    phone: Joi.string().pattern(/^01[0-25]\d{8}$/),
    city: Joi.string(),
    postalCode: Joi.string(),
    alias: Joi.string(),
  });
  return schema.validate(odj);
};


module.exports = {
  ValidationSignup,
  ValidationLogin,
  ValidationUpdate,
  validateEmail,
  validateResetCode,
  validatePassword,
  validateAddress,
  validateUpdateAddress,
};