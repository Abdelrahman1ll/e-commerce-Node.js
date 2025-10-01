const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const { User } = require("../../models/User_Model");
const { Maintenance } = require("../../models/Maintenance_Model");
const {
  createAndLoginUser,
  createAndLoginAdmin,
} = require("../utils/Auth_Helper");

let userToken;
let adminToken;

beforeAll(async () => {
  adminToken = await createAndLoginAdmin();
  userToken = await createAndLoginUser();
});

//
// 🟢 POST /api/maintenances
//
describe("POST /api/maintenances", () => {
  it("should create a new maintenance", async () => {
    const res = await request(app)
      .post("/api/maintenances")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "ثلاجة", // ✅ valid title
        description: "مش بتبرد كويس",
        image: "http://example.com/image.png",
        alias: "العمل",
        details: "شارع ١٢٣",
        phone: "01012345678",
        city: "القاهرة",
        postalCode: "12345",
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.title).toBe("ثلاجة");
  });

  it("should return 400 if validation fails", async () => {
    const res = await request(app)
      .post("/api/maintenances")
      .set("Authorization", `Bearer ${userToken}`)
      .send({}); // missing required fields

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// 🟢 GET /api/maintenances
describe("GET /api/maintenances", () => {
  it("should get all maintenances (admin only)", async () => {
    const res = await request(app)
      .get("/api/maintenances")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return 403 if user role is not admin", async () => {
    await User.create({
      name: "Maintenance",
      lastName: "Maintenance",
      number: "01012345678",
      email: "Maintenance@gmil.com",
      password: "admin1234",
      passwordConfirm: "admin1234",
      role: "user",
      isVerified: true,
    });

    const user = await request(app).post("/api/auth/login").send({
      email: "Maintenance@gmil.com",
      password: "admin1234",
    });

    const userToken = user.body.accessToken;

    const res = await request(app)
      .get("/api/maintenances")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "You do not have permission to access this path."
    );
  });
});

// 🟢 GET /api/maintenances/user
describe("GET /api/maintenances/user", () => {
  let localUserToken;

  beforeAll(async () => {
    // إنشاء يوزر جديد علشان الـ test
    await User.create({
      name: "UserTwo",
      lastName: "Test",
      number: "01099999999",
      email: "usertwo@gmail.com",
      password: "test1234",
      passwordConfirm: "test1234",
      role: "user",
      isVerified: true,
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "usertwo@gmail.com",
      password: "test1234",
    });

    localUserToken = login.body.accessToken;
  });

  it("should get user maintenances", async () => {
    const res = await request(app)
      .get("/api/maintenances/user")
      .set("Authorization", `Bearer ${localUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return 401 if user not found in DB", async () => {
    await User.deleteMany({ email: "usertwo@gmail.com" });

    const res = await request(app)
      .get("/api/maintenances/user")
      .set("Authorization", `Bearer ${localUserToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not found");
  });
});

//
// 🟢 DELETE /api/maintenances/:id
//
describe("DELETE /api/maintenances/:id", () => {
  it("should delete a maintenance", async () => {
    // إنشاء طلب جديد علشان نجرب حذفه
    const newMaintenance = await Maintenance.create({
      title: "سخان",
      description: "Battery issue",
      image: "http://example.com/image.png",
      alias: "المنزل",
      details: "456 Street",
      phone: "0111111111",
      city: "Giza",
      user: "64fa7c6f2f5d123456789abc",
      orderNumber: 2001,
    });

    const res = await request(app)
      .delete(`/api/maintenances/${newMaintenance._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it("should return 404 if maintenance not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/maintenances/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Maintenance not found");
  });
});
