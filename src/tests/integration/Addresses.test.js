const request = require("supertest");
const app = require("../../app");
const { User } = require("../../models/User_Model");

let TokenUser;
beforeAll(async () => {
  await User.create({
    name: "addresses",
    lastName: "addres",
    email: "addresses@gmil.com",
    phone: "01209876543",
    password: "admin1234",
    passwordConfirm: "admin1234",
    isVerified: true,
  });

  TokenUser = await request(app).post("/api/auth/login").send({
    email: "addresses@gmil.com",
    password: "admin1234",
  });
}, 20000); // 20 ثانية

describe("POST /api/addresses API", () => {
  it("should create a new address", async () => {
    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "المنزل",
        details: "123 شارع النيل",
        phone: "01000000000",
        city: "القاهرة",
        postalCode: "12345",
      });
    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.addresses).toHaveLength(1);
  });

  it("should return 400 if required fields are missing", async () => {
    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "المنزل",
        details: "", // تفاصيل ناقصة
        phone: "01000000000",
        city: "القاهرة",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("should return 404 if user does not exist", async () => {
    const fakeUserToken = "Bearer faketoken";
    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", fakeUserToken)
      .send({
        alias: "المنزل",
        details: "123 شارع النيل",
        phone: "01000000000",
        city: "القاهرة",
        postalCode: "12345",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("jwt malformed");
  });
});
describe("GET /api/addresses API", () => {
  // ---------------- GET SUCCESS ----------------
  it("should get all addresses successfully", async () => {
    await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "المنزل",
        details: "123 شارع النيل",
        phone: "01000000000",
        city: "القاهرة",
        postalCode: "12345",
      });

    const response = await request(app)
      .get("/api/addresses")
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.addresses.length).toBeGreaterThan(0);
    expect(response.body.addresses[0].alias).toBe("المنزل");
  });

  // ---------------- GET USER NOT FOUND ----------------
  it("should return 404 if user does not exist", async () => {
    const fakeUserToken = "Bearer faketoken";
    const response = await request(app)
      .get("/api/addresses")
      .set("Authorization", fakeUserToken);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("jwt malformed");
  });
});

describe("PUT /api/addresses/:id API", () => {
  let addressId;

  beforeAll(async () => {
    // أولاً نضيف عنوان للمستخدم عشان يكون موجود للتحديث
    const res = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "المنزل",
        details: "123 شارع النيل",
        phone: "01000000000",
        city: "القاهرة",
        postalCode: "12345",
      });
    addressId = res.body.addresses[0]._id;
  });

  // ---------------- PUT SUCCESS ----------------
  it("should update an existing address successfully", async () => {
    const response = await request(app)
      .put(`/api/addresses/${addressId}`)
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "العمل",
        details: "456 شارع التحرير",
        phone: "01111111111",
        city: "الجيزة",
        postalCode: "54321",
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.alias).toBe("العمل");
    expect(response.body.data.details).toBe("456 شارع التحرير");
  });

  // ---------------- PUT WITH MISSING FIELDS ----------------
  it("should return 400 if required fields are missing", async () => {
    const response = await request(app)
      .put(`/api/addresses/${addressId}`)
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "", // ناقص
        details: "456 شارع التحرير",
        phone: "01111111111",
        city: "الجيزة",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  // ---------------- PUT USER NOT FOUND ----------------
  it("should return 404 if user does not exist", async () => {
    const fakeUserToken = "Bearer faketoken"; // JWT لمستخدم غير موجود
    const response = await request(app)
      .put(`/api/addresses/${addressId}`)
      .set("Authorization", fakeUserToken)
      .send({
        alias: "العمل",
        details: "456 شارع التحرير",
        phone: "01111111111",
        city: "الجيزة",
        postalCode: "54321",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("jwt malformed");
  });

  // ---------------- PUT ADDRESS NOT FOUND ----------------
  it("should return 404 if address does not exist", async () => {
    const fakeAddressId = "64f0c1f0c1f0c1f0c1f0c1f0"; // ObjectId وهمي
    const response = await request(app)
      .put(`/api/addresses/${fakeAddressId}`)
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "العمل",
        details: "456 شارع التحرير",
        phone: "01111111111",
        city: "الجيزة",
        postalCode: "54321",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Address not found");
  });
});

describe("DELETE /api/addresses/:id API", () => {
  let addressId;

  beforeAll(async () => {
    // أولاً نضيف عنوان للمستخدم ليتم حذفه
    const res = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`)
      .send({
        alias: "المنزل",
        details: "123 شارع النيل",
        phone: "01000000000",
        city: "القاهرة",
        postalCode: "12345",
      });
    addressId = res.body.addresses[0]._id;
  });

  // ---------------- DELETE SUCCESS ----------------
  it("should delete an existing address successfully", async () => {
    const response = await request(app)
      .delete(`/api/addresses/${addressId}`)
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe("success");
    expect(response.body.message).toBe("Address deleted successfully");

    // التأكد أن العنوان تم حذفه من قاعدة البيانات
    const user = await User.findById(TokenUser?.body.data._id);
    expect(
      user.addresses.find((a) => a._id.toString() === addressId)
    ).toBeUndefined();
  });

  // ---------------- DELETE USER NOT FOUND ----------------
  it("should return 404 if user does not exist", async () => {
    const fakeUserToken = "Bearer faketoken"; // JWT لمستخدم غير موجود
    const response = await request(app)
      .delete(`/api/addresses/${addressId}`)
      .set("Authorization", fakeUserToken);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("jwt malformed");
  });

  // ---------------- DELETE ADDRESS NOT FOUND ----------------
  it("should return 404 if address does not exist", async () => {
    const fakeAddressId = "64f0c1f0c1f0c1f0c1f0c1f0"; // ObjectId وهمي
    const response = await request(app)
      .delete(`/api/addresses/${fakeAddressId}`)
      .set("Authorization", `Bearer ${TokenUser?.body.accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Address not found");
  });
});
