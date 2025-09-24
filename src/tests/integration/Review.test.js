const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const { Review } = require("../../models/Review_Model");
const { Product } = require("../../models/Product_Model");
const { User } = require("../../models/User_Model");
const { Category } = require("../../models/Category_Model");
const { Brand } = require("../../models/Brand_Model");
const connectTestDB = require("../utils/db_Test");

let userToken, adminToken, product, user, admin, review;

beforeAll(async () => {
  await connectTestDB();

  // Create normal user
  user = await User.create({
    name: "Test User",
    lastName: "Test",
    email: "user_1@test.com",
    password: "12345678",
    passwordConfirm: "12345678",
    role: "user",
    isVerified: true,
  });

  // Create admin user
  admin = await User.create({
    name: "Admin User",
    lastName: "Admin",
    email: "admin_1@test.com",
    password: "12345678",
    passwordConfirm: "12345678",
    role: "admin",
    isVerified: true,
  });

  // Generate tokens (مفترض إن عندك endpoint login بيرجع JWT)
  const userRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "user_1@test.com", password: "12345678" });
  userToken = userRes.body.accessToken;

  const adminRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin_1@test.com", password: "12345678" });
  adminToken = adminRes.body.accessToken;

  const category = await Category.create({
    name: "Test Category12",
  });

  const brand = await Brand.create({
    name: "Test Brand12",
  });

  // Create product
  product = await Product.create({
    title: "Test Product",
    description: "This is a test product",
    images: ["image1.jpg", "image2.jpg"],
    quantity: 10,
    brand: brand._id,
    category: category._id,
    price: 100,
  });
});

afterAll(async () => {
  await Review.deleteMany();
  await Product.deleteMany();
  await Category.deleteMany();
  await Brand.deleteMany();
  await User.deleteMany();
  await mongoose.connection.close();
});

describe("Reviews", () => {
  describe("POST /api/reviews", () => {
    it("should create a new review", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ review: "Great product", rating: 5, product: product._id });

      expect(res.status).toBe(201);
      expect(res.body.data.review).toBe("Great product");
      review = res.body.data; // save review for later
    });

    it("should return 400 if review is missing", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ rating: 4, product: product._id });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch('"review" is required');
    });

    it("should return 400 if review is I have rated this product before", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ review: "Great product", rating: 5, product: product._id });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch("I have rated this product before");
    });
  });

  describe("PUT /api/reviews/:id", () => {
    it("should update review successfully if user owns it", async () => {
      const res = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ review: "Updated review", rating: 4 });

      expect(res.status).toBe(201);
      expect(res.body.data.review).toBe("Updated review");
    });

    it("should not allow another user to update review", async () => {
      await User.create({
        name: "Another",
        lastName: "User",
        number: "01223456789",
        email: "another@test.com",
        password: "12345678",
        passwordConfirm: "12345678",
        role: "user",
        isVerified: true,
      });

      const anotherRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "another@test.com", password: "12345678" });
      const anotherToken = anotherRes.body.accessToken;

      const res = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${anotherToken}`)
        .send({ review: "Hack review", rating: 1 });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "You are not authorized to edit this review."
      );
    });

    it("should return 404 if review id is invalid or not found", async () => {
      // id عشوائي مش موجود في الداتابيز
      const fakeId = "64a1f8b6c25e3c1234567890";

      const res = await request(app)
        .put(`/api/reviews/${fakeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ review: "Updated review", rating: 4 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Review not found");
    });
  });

  describe("DELETE /api/reviews/:id", () => {
    it("should not allow non-owner non-admin to delete", async () => {
      await User.create({
        name: "Other",
        lastName: "User",
        number: "01223456789",
        email: "other@test.com",
        password: "12345678",
        passwordConfirm: "12345678",
        role: "user",
        isVerified: true,
      });

      const otherRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "other@test.com", password: "12345678" });
      const otherToken = otherRes.body.accessToken;

      const res = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "You are not allowed to delete this review"
      );
    });

    it("should allow owner to delete review", async () => {
      const res = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(204);
    });

    it("should allow admin to delete review", async () => {
      const newReview = await Review.create({
        review: "Admin delete test",
        rating: 3,
        product: product._id,
        user: user._id,
      });

      const res = await request(app)
        .delete(`/api/reviews/${newReview._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it("should return 404 if review id is invalid or not found", async () => {
      // id عشوائي مش موجود في الداتابيز
      const fakeId = "64a1f8b6c25e3c1234567890";

      const res = await request(app)
        .delete(`/api/reviews/${fakeId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Review not found");
    });
  });

  describe("GET /api/reviews/product/:id", () => {
    it("should return all reviews for product", async () => {
      const res = await request(app).get(`/api/reviews/product/${product._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("amount");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return Not product", async () => {
      const fakeId = "64a1f8b6c25e3c1234567890";
      const res = await request(app).get(`/api/reviews/product/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Product not found");
    });
  });
});
