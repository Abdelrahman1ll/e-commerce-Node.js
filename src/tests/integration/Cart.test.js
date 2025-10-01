const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app"); // لازم تعمل export للـ app
const { Cart } = require("../../models/Cart_Model");
const { Product } = require("../../models/Product_Model");
const { Category } = require("../../models/Category_Model");
const { Brand } = require("../../models/Brand_Model");
// const connectTestDB = require("../utils/db_Test");
const { createAndLoginUser } = require("../utils/Auth_Helper");
const { User } = require("../../models/User_Model");

let product;
let userToken;
beforeAll(async () => {
  // await connectTestDB();
  await User.deleteMany();
  userToken = await createAndLoginUser();
  const category = await Category.create({ name: "Test category Cart" });
  const brand = await Brand.create({ name: "Test Brand Cart" });

  product = await Product.create({
    title: "Choco",
    price: 10,
    description: "test",
    images: ["image1.jpg", "image2.jpg"],
    quantity: 10,
    brand: brand._id,
    category: category._id,
  });
});

// afterAll(async () => {
//   await Cart.deleteMany();
//   await Product.deleteMany();
//   await User.deleteMany();
//   await Category.deleteMany();
//   await Brand.deleteMany();
//   // await mongoose.connection.close();
// });

describe("Cart API Endpoints", () => {
  describe("POST /api/carts (addToCart)", () => {
    it("should add product to cart", async () => {
      const res = await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.totalCartPrice).toBe(20);
    });

    it("should update quantity if product already in cart", async () => {
      const res = await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products[0].count).toBe(5);
    });

    it("should return 400 if quantity invalid", async () => {
      const res = await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 0 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("The requested quantity is invalid");
    });
  });

  describe("GET /api/carts (getCart)", () => {
    it("should return user cart", async () => {
      await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 2 });

      const res = await request(app)
        .get("/api/carts")
        .set("Authorization", "Bearer " + userToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
    });

    it("should return 404 if cart not found", async () => {
      await Cart.deleteMany();
      const res = await request(app)
        .get("/api/carts")
        .set("Authorization", "Bearer " + userToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Cart not found");
    });
  });

  describe("PUT /api/carts/:id (updateCartProductCount)", () => {
    it("should update product count", async () => {
      const addRes = await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 2 });
      const itemId = addRes?.body.data.products[0]._id;

      const res = await request(app)
        .put(`/api/carts/${itemId}`)
        .set("Authorization", "Bearer " + userToken)
        .send({ count: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products[0].count).toBe(10);
    });

    it("should remove product if count <= 0", async () => {
      const addRes = await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 2 });

      const itemId = addRes.body.data.products[0]._id;

      const res = await request(app)
        .put(`/api/carts/${itemId}`)
        .set("Authorization", "Bearer " + userToken)
        .send({ count: 0 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products.length).toBe(0);
    });
  });

  describe("DELETE /api/carts/:id (removeCartProduct)", () => {
    it("should remove product from cart", async () => {
     const addRes = await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 2 });
      const itemId = addRes.body.data.products[0]._id;
      const res = await request(app)
        .delete(`/api/carts/${itemId}`)
        .set("Authorization", "Bearer " + userToken);

      expect(res.statusCode).toBe(204);
    });

    it("should return 404 if cart not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/carts/${fakeId}`)
        .set("Authorization", "Bearer " + userToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/carts (clearLoggedUserCart)", () => {
    it("should clear logged user cart", async () => {
      await request(app)
        .post("/api/carts")
        .set("Authorization", "Bearer " + userToken)
        .send({ productId: product._id, quantity: 1 });

      const res = await request(app)
        .delete("/api/carts")
        .set("Authorization", "Bearer " + userToken);

      expect(res.statusCode).toBe(204);
    });
  });
});
