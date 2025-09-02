// tests/fixtures/Product_Fixture.js
const { Product } = require("../../models/Product_Model");
const { Category } = require("../../models/Category_Model");
const { Brand } = require("../../models/Brand_Model");

const insertProducts = async () => {
  // اعمل category & brand
  const categories = await Category.insertMany([
    { name: "Laptops" },
    { name: "Mobiles" },
  ]);

  const brands = await Brand.insertMany([
    { name: "Apple" },
    { name: "Samsung" },
  ]);

  const products = [
    {
      title: "Product 1",
      price: 2500,
      description: "test product 1",
      images: ["image1.jpg", "image2.jpg"],
      quantity: 10,
      brand: brands[0]?._id,
      category: categories[0]?._id,
    },
    {
      title: "Product 2",
      price: 9500,
      description: "test product 2",
      images: ["image1.jpg", "image2.jpg"],
      quantity: 10,
      brand: brands[0]?._id,
      category: categories[0]?._id,
    },
    {
      title: "abdo",
      price: 4000,
      description: "test product 3",
      images: ["image1.jpg", "image2.jpg"],
      quantity: 10,
      brand: brands[1]?._id,
      category: categories[1]?._id,
    },
  ];

  await Product.insertMany(products);
};

module.exports = insertProducts;
