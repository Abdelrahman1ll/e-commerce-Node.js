const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const { Order } = require("../../models/Order_Model");
const { User } = require("../../models/User_Model");
const { Cart } = require("../../models/Cart_Model");
const { Product } = require("../../models/Product_Model");
const { Category } = require("../../models/Category_Model");
const { Brand } = require("../../models/Brand_Model");

const connectTestDB = require("../utils/db_Test");
const { createAndLoginAdmin } = require("../utils/Auth_Helper");
const crypto = require("crypto");

describe("Paymob Integration", () => {
  let token;
  let user;
  let product;
  let cart;

  beforeAll(async () => {
    await connectTestDB();

    // 🔹 إنشاء admin user وتسجيل الدخول
    token = await createAndLoginAdmin();

    // 🔹 إنشاء user عادي
    user = await User.create({
      name: "Abdo",
      lastName: "Mohamed",
      email: "abdo@test.com",
      phone: "0123456789",
      password: "12345678",
    });

    // 🔹 إنشاء category & brand & product
    const category = await Category.create({ name: "Choco" });
    const brand = await Brand.create({ name: "Nestle" });

    product = await Product.create({
      title: "Test Chocolate",
      price: 100,
      category: category._id,
      brand: brand._id,
    });

    // 🔹 إنشاء cart
    cart = await Cart.create({
      user: user._id,
      products: [{ product: product._id, count: 2, price: 100 }],
      taxPrice: 10,
      deliveryPrice: 20,
      totalCartPrice: 200,
      totalPrice: 230,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // ✅ 1- اختبار إنشاء order والدفع بالبطاقة
  it("should create order and return redirectURL", async () => {
    const res = await request(app)
      .post("/api/order-card")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cartId: cart._id,
        shippingAddress: {
          alias: "Home",
          details: "Street 1",
          phone: "0123456789",
          city: "Cairo",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body).toHaveProperty("redirectURL");
  });

  // ✅ 2- اختبار الـ webhook (نجاح الدفع)
  it("should verify webhook and mark order as paid", async () => {
    const order = await Order.create({
      user: user._id,
      cartItems: [{ product: product._id, count: 1, price: 100 }],
      shippingAddress: {
        alias: "Home",
        details: "Street 1",
        phone: "0123456789",
        city: "Cairo",
      },
      totalPrice: 100,
      isPaid: false,
    });

    // البيانات اللي Paymob بيبعتها
    const obj = {
      amount_cents: "10000",
      created_at: new Date().toISOString(),
      currency: "EGP",
      error_occured: false,
      has_parent_transaction: false,
      id: "txn123",
      integration_id: process.env.INTEGRATION_ID || "123456",
      is_3d_secure: true,
      is_auth: false,
      is_capture: false,
      is_refunded: false,
      is_standalone_payment: true,
      is_voided: false,
      order: { id: order._id.toString() },
      owner: "paymob",
      pending: false,
      source_data: { pan: "2345", sub_type: "MasterCard", type: "card" },
      success: true,
    };

    // بناء HMAC الصحيح
    const orderedKeys = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "id",
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refunded",
      "is_standalone_payment",
      "is_voided",
      "order.id",
      "owner",
      "pending",
      "source_data.pan",
      "source_data.sub_type",
      "source_data.type",
      "success",
    ];

    const concatenated = orderedKeys
      .map((key) => {
        const keys = key.split(".");
        let value = obj;
        keys.forEach((k) => {
          if (value) value = value[k];
        });
        return value !== undefined && value !== null ? value.toString() : "";
      })
      .join("");

    const hmac = crypto
      .createHmac("sha512", process.env.HMAC_SECRET || "hmac_secret")
      .update(concatenated)
      .digest("hex");

    const res = await request(app)
      .post("/api/paymob/webhook")
      .send({ obj, hmac });

    expect(res.status).toBe(200);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.isPaid).toBe(true);
  });

  // ✅ 3- اختبار API isPaid
  it("should mark order as paid manually", async () => {
    const order = await Order.create({
      user: user._id,
      cartItems: [{ product: product._id, count: 1, price: 100 }],
      shippingAddress: {
        alias: "Home",
        details: "Street 1",
        phone: "0123456789",
        city: "Cairo",
      },
      totalPrice: 100,
      isPaid: false,
    });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Order marked as paid");

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.isPaid).toBe(true);
  });
});
