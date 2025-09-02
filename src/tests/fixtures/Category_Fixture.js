const { Category } = require("../../models/Category_Model");

const CategoryOne = {
  name: "Mobile",
};

const CategoryTwo = {
  name: "Laptop",
};

const insertCategory = async () => {
  await Category.insertMany([CategoryOne, CategoryTwo]);
};

module.exports = insertCategory;
