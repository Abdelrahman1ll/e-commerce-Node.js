const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const { Order } = require("../../models/Order_Model");
const { User } = require("../../models/User_Model");
const { Cart } = require("../../models/Cart_Model");
const { Product } = require("../../models/Product_Model");
const connectTestDB = require("../utils/Setup_Test_DB");
const { Category } = require("../../models/Category_Model");
const { Brand } = require("../../models/Brand_Model");
const { createAndLoginAdmin } = require("../utils/Auth_Helper");

// user mock
let token;
let product;
let cart;
let tokenAdmin;
let orderid;
beforeAll(async () => {
  await connectTestDB();
  tokenAdmin = await createAndLoginAdmin();
  await User.create({
    name: "Test User",
    lastName: "Test",
    number: "01234567809",
    email: "orders@test.com",
    password: "12345678",
    passwordConfirm: "12345678",
    isVerified: true,
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "orders@test.com", password: "12345678" });

  token = loginRes.body.accessToken;

  const category = await Category.create({ name: "Test category Orders" });
  const brand = await Brand.create({ name: "Test Brand Orders" });

  product = await Product.create({
    title: "test",
    price: 20,
    description: "test",
    images: ["image1.jpg", "image2.jpg"],
    quantity: 10,
    brand: brand._id,
    category: category._id,
  });

  cart = await request(app)
    .post("/api/carts")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId: product._id, quantity: 2 });
}, 20000);

afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
  await mongoose.connection.close();
}, 20000);

describe("Orders API", () => {
  describe("POST /api/orders", () => {
    it("should create new order", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({
          cartId: cart?.body.data._id,
          shippingAddress: {
            alias: "العمل",
            details: "شارع 1",
            phone: "01000000000",
            city: "Cairo",
          },
        })
        .set("Authorization", `Bearer ${token}`);
      orderid = res.body.data._id;
      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.cartItems.length).toBe(1);
    });

    it("should return 404 if cart not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/api/orders")
        .send({
          cartId: fakeId,
          shippingAddress: {
            alias: "العمل",
            details: "شارع 1",
            phone: "01000000000",
            city: "Cairo",
          },
        })
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Cart not found");
    });
  });

  describe("GET /api/orders", () => {
    it("should return all orders", async () => {
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });

    it("should return all orders Not User", async () => {
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/orders/user", () => {
    it("should return all orders for a user", async () => {
      const res = await request(app)
        .get("/api/orders/user")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe("PUT /api/orders/:id/deliver", () => {
    it("should mark order as delivered", async () => {
      const res = await request(app)
        .put(`/api/orders/${orderid}/deliver`)
        .set("Authorization", `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.data.isDelivered).toBe(true);
    });

    it("should return 404 if order not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/orders/${fakeId}/deliver`)
        .set("Authorization", `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Order not found");
    });
  });

  describe("PUT /api/orders/:id/pay", () => {
    it("should mark order as paid", async () => {
      const res = await request(app)
        .put(`/api/orders/${orderid}/pay`)
        .set("Authorization", `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.data.isPaid).toBe(true);
    });

    it("should return 404 if order not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/orders/${fakeId}/pay`)
        .set("Authorization", `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Order not found");
    });
  });
}, 20000);
