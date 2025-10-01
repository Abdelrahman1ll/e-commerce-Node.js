const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app"); // لازم يكون عندك export للـ app
const { Customer } = require("../../models/Off_Site_Customers_Model");
const {
  createAndLoginAdmin,
  createAndLoginUser,
} = require("../utils/Auth_Helper");
let adminToken;
let userToken;

beforeAll(async () => {
  adminToken = await createAndLoginAdmin();
  userToken = await createAndLoginUser();
});

describe("Customers API Endpoints", () => {
  describe("GET /api/customers", () => {
    it("GET /api/customers → should return empty array initially", async () => {
      const res = await request(app)
        .get("/api/customers")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
    });

    it("GET /api/customers → should return User Not", async () => {
      const res = await request(app)
        .get("/api/customers")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe(
        "You do not have permission to access this path."
      );
    });
  });

  describe("POST /api/customers", () => {
    it("POST /api/customers → should create a new customer", async () => {
      const customerData = {
        name: "Ahmed",
        phoneNumber: "01000000000",
        data: "Notes",
      };

      const res = await request(app)
        .post("/api/customers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(customerData);
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
    });

    it("POST /api/customers → should not allow duplicate phoneNumber", async () => {
      const customerData = {
        name: "Ahmed",
        phoneNumber: "01000010000",
        data: "Notes",
      };
      await Customer.create(customerData);

      const res = await request(app)
        .post("/api/customers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(customerData);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe("Customer already exists.");
    });
  });

  it("PUT /api/customers/:id → should update a customer", async () => {
    const customer = await Customer.create({
      name: "Ali",
      phoneNumber: "01011111111",
      data: "Old",
    });

    const res = await request(app)
      .put(`/api/customers/${customer._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Ali Updated", phoneNumber: "01011111111", data: "New" });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.name).toBe("Ali Updated");
    expect(res.body.data.data).toBe("New");
  });

  describe("DELETE /api/customers/:id", () => {
    it("DELETE /api/customers/:id → should delete a customer", async () => {
      const customer = await Customer.create({
        name: "Omar",
        phoneNumber: "0102222222",
        data: "Delete Me",
      });
      const res = await request(app)
        .delete(`/api/customers/${customer._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);
    });

    it("DELETE /api/customers/:id → should return 404 if customer not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/customers/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch("No document found for this ID");
    });
  });
});
