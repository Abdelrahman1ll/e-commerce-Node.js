const { Brand } = require("../../models/Brand_Model");

const BrandOne = {
  name: "Apple",
};

const BrandTwo = {
  name: "Samsung",
};

const insertBrand = async () => {
  await Brand.insertMany([BrandOne, BrandTwo]);
};

module.exports = insertBrand;
