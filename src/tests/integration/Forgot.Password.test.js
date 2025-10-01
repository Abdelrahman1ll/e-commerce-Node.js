const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const { User } = require("../../models/User_Model");
const connectTestDB = require("../utils/test-setup");
beforeAll(async () => {
  // await connectTestDB();

  await User.create({
    name: "Password User",
    lastName: "Password User",
    email: "abdoabdoyytt5678@gmail.com",
    number: "01091066789",
    password: "OldPass123",
    isVerified: true,
    resetCode: "111111",
    resetCodeExpires: Date.now() + 2 * 60 * 1000,
  });
}, 20000); // 20 ثانية

// afterAll(async () => {
//   await User.deleteMany({});
//   // await mongoose.connection.close();
// }, 20000);

describe("POST /api/forgot-password API", () => {
  it("should return 400 /api/forgot-password Not Email", async () => {
    const res = await request(app).post("/api/forgot-password").send({
      email: "test_7gihgg",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('"email" must be a valid email');
  });
  it("should return 404 /api/forgot-password User with this email does not exist", async () => {
    const res = await request(app).post("/api/forgot-password").send({
      email: "code_2@example.com",
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User with this email does not exist");
  });
  it("should return 200 /api/forgot-password", async () => {
    const res = await request(app).post("/api/forgot-password").send({
      email: "abdoabdoyytt5678@gmail.com",
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reset code sent successfully!");
  });
});

describe("POST /api/reset-code API", () => {
  it("should return 400 /api/reset-code Not Data", async () => {
    const res = await request(app).post("/api/reset-code").send({
      email: "abdoabdoyytt5678@gmail.com",
      // resetCode: user_Code.resetCode,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('"resetCode" is required');
  });
  it("should return 404 /api/reset-code User not found", async () => {
    const res = await request(app).post("/api/reset-code").send({
      email: "abdoabdoNot@gmail.com",
      resetCode: "12364",
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
  it("should return 400 /api/reset-code Reset code expired. Please request a new one.", async () => {
    await User.create({
      name: "test_code",
      lastName: "abdo",
      email: "test_code@gmail.com",
      number: "01291066789",
      passwoed: "admin1234",
      resetCodeExpires: Date.now() - 3 * 60 * 1000,
      resetCode: "12345",
    });
    const res = await request(app).post("/api/reset-code").send({
      email: "test_code@gmail.com",
      resetCode: "12345",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Reset code expired. Please request a new one."
    );
  });
  it("should return 400 /api/reset-code Invalid reset code.", async () => {
    const res = await request(app).post("/api/reset-code").send({
      email: "abdoabdoyytt5678@gmail.com",
      resetCode: "222222",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid reset code.");
  });
  it("should return 200 /api/reset-code Reset code verified successfully", async () => {
    await User.create({
      name: "test_code",
      lastName: "abdo",
      email: "test_code_5@gmail.com",
      number: "01391066789",
      passwoed: "admin1234",
      resetCodeExpires: Date.now() + 2 * 60 * 1000,
      resetCode: "111111",
    });
    const res = await request(app).post("/api/reset-code").send({
      email: "test_code_5@gmail.com",
      resetCode: "111111",
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reset code verified successfully");
  });
});

describe("POST /api/reset-password API", () => {
  it("should return 400 /api/reset-password Not Data", async () => {
    const res = await request(app).post("/api/reset-password").send({
      email: "abdoabdoyytt",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('"email" must be a valid email');
  });

  it("should return 404 /api/reset-password User not found", async () => {
    const res = await request(app).post("/api/reset-password").send({
      email: "abdo_Not@gmail.com",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should return 400 /api/reset-password theCodeIsCorrect Invalid reset code", async () => {
    await User.create({
      name: "test_code",
      lastName: "abdo",
      email: "test_code_3@gmail.com",
      number: "01391066789",
      passwoed: "admin1234",
      // theCodeIsCorrect: true,
    });
    const res = await request(app).post("/api/reset-password").send({
      email: "test_code_3@gmail.com",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid reset code");
  });

  it("should return 200 /api/reset-password Password reset successfully", async () => {
    await User.create({
      name: "test_code",
      lastName: "abdo",
      email: "test_code_4@gmail.com",
      number: "01391066789",
      passwoed: "admin1234",
      theCodeIsCorrect: true,
    });
    const res = await request(app).post("/api/reset-password").send({
      email: "test_code_4@gmail.com",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe("success");
    expect(res.body.message).toBe("Password reset successfully!");
  });
});
