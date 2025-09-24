const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const connectTestDB = require("../utils/db_Test");
const { DeliveryTax } = require("../../models/Delivery_And_Tax_Model");
const { User } = require("../../models/User_Model");
const { createAndLoginAdmin } = require("../utils/Auth_Helper");
let accessToken;
beforeAll(async () => {
  await connectTestDB();
  accessToken = await createAndLoginAdmin();
});

afterAll(async () => {
  await DeliveryTax.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("POST /api/delivery-tax API", () => {
  // ---------------- CREATE NEW ----------------
  it("should create a new delivery and tax record if not exists", async () => {
    const response = await request(app)
      .post("/api/delivery-tax")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        deliveryPrice: 50,
        taxPrice: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.deliveryPrice).toBe(50);
    expect(response.body.data.taxPrice).toBe(10);
  });

  // ---------------- UPDATE EXISTING ----------------
  it("should update only provided fields and keep others unchanged", async () => {
    // تحديث deliveryPrice فقط
    const response = await request(app)
      .post("/api/delivery-tax")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        deliveryPrice: 100,
        // taxPrice غير موجودة
      });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.deliveryPrice).toBe(100);
    expect(response.body.data.taxPrice).not.toBe(0);

    // تحديث taxPrice فقط
    const response2 = await request(app)
      .post("/api/delivery-tax")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        taxPrice: 20,
      });
    expect(response2.status).toBe(200);
    expect(response2.body.data.deliveryPrice).not.toBe(0);
    expect(response2.body.data.taxPrice).toBe(20);
  });

  // ---------------- NO CHANGE WHEN 0 ----------------

  it("should not update fields if value is 0", async () => {
    const response = await request(app)
      .post("/api/delivery-tax")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        deliveryPrice: 0,
        taxPrice: 0,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.deliveryPrice).not.toBe(0);
    expect(response.body.data.taxPrice).not.toBe(0);
  });
});

describe("GET /api/delivery-tax API", () => {
  it("should return deliveryTax if exists", async () => {
    const response = await request(app)
      .get("/api/delivery-tax")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });
});
