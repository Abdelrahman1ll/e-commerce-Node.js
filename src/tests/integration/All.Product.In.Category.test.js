const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const connectTestDB = require("../utils/Setup_Test_DB");
const { Brand } = require("../../models/Brand_Model");
const { Product } = require("../../models/Product_Model");
const { Category } = require("../../models/Category_Model");
let brandId;
let productId;
let categoryId;
beforeAll(async () => {
  await connectTestDB();

  // إنشاء براند للتجارب
  const brand = await Brand.create({ name: "Test Brand" });
  brandId = brand._id;

  const category = await Category.create({ name: "Test category" });
  categoryId = category._id;

  // إنشاء منتج تابع للبراند
  const product = await Product.create({
    title: "Test Product",
    description: "Test Description",
    images: ["image1.jpg", "image2.jpg"],
    quantity: 10,
    price: 100,
    brand: brandId,
    category: categoryId,
  });
  productId = product._id;
}, 20000); // 20 ثانية

afterAll(async () => {
  await Product.deleteMany({});
  await Brand.deleteMany({});
  await Category.deleteMany({});
  await mongoose.connection.close();
}, 20000);

describe("GET /api/product-category/:id API", () => {
  // ---------------- GET SUCCESS ----------------
  it("should return all products of a category successfully", async () => {
    const response = await request(app).get(
      `/api/product-category/${categoryId}`
    );
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.results).toBeGreaterThan(0);
    expect(response.body.data[0]._id.toString()).toBe(productId.toString());
  });

  // ---------------- GET CATEGORY NOT FOUND ----------------
  it("should return 404 if category does not exist", async () => {
    const fakeCategoryId = "64f0c1f0c1f0c1f0c1f0c1f0"; // ObjectId وهمي
    const response = await request(app).get(
      `/api/product-category/${fakeCategoryId}`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Category not found");
  });
});
