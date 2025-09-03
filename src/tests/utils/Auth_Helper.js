const request = require("supertest");
const { User } = require("../../models/User_Model");
const app = require("../../../app");

async function createAndLoginAdmin() {
  // نمسح أي users قبل إنشاء admin
  await User.deleteMany({});

  // نعمل Admin جديد
  const admin = await User.create({
    name: "Admin",
    lastName: "abdo",
    email: "admin@gmail.com",
    number: "01076217980",
    password: "admin1234",
    passwordConfirm: "admin1234",
    role: "admin",
    isVerified: true,
  });
  await admin.save();

  // نعمل Login ونرجع الـ token
  const login = await request(app).post("/api/auth/login").send({
    email: "admin@gmail.com",
    password: "admin1234",
  });

  return login.body.accessToken;
}

async function createAndLoginUser() {
  const user = await User.create({
    name: "Normal",
    lastName: "User",
    email: "user@gmail.com",
    number: "01076217980",
    password: "user1234",
    passwordConfirm: "user1234",
    role: "user",
    isVerified: true,
  });
  await user.save();

  const login = await request(app).post("/api/auth/login").send({
    email: "user@gmail.com",
    password: "user1234",
  });

  return login.body.accessToken;
}
module.exports = { createAndLoginAdmin, createAndLoginUser };
