const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const { User } = require("../../models/User_Model");
const connectTestDB = require("../utils/Setup_Test_DB");
const {
  createAndLoginAdmin,
  createAndLoginUser,
} = require("../utils/Auth_Helper");

let accessToken;
let TokenUser;
let ResLoginPassword;
beforeAll(async () => {
  await connectTestDB();
  accessToken = await createAndLoginAdmin();
  TokenUser = await createAndLoginUser();

  await User.create({
    name: "Password User",
    lastName: "Password User",
    email: "password@example.com",
    phone: "01091066789",
    password: "OldPass123",
    isVerified: true,
  });

  // سجل دخول
  ResLoginPassword = await request(app).post("/api/auth/login").send({
    email: "password@example.com",
    password: "OldPass123",
  });
}, 20000); // 20 ثانية

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
}, 20000);

describe("GET /api/users API", () => {
  it("should GET all /api/users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer " + accessToken);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should GET all /api/users is Admin", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer " + TokenUser);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "You do not have permission to access this path."
    );
  });
});

describe("Update /api/users API", () => {
  it("should update /api/users", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa1@gmail.com",
      password: "admin1234",
      phone: "01098766789",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa1@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    const res = await request(app)
      .put("/api/users/" + reslogin?.body.data._id)
      .set("Authorization", "Bearer " + reslogin?.body.accessToken)
      .send({
        name: "test",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("test");
    expect(res.body.data._id).toBe(reslogin?.body.data._id);
  });

  it("should update /api/users Not DI User", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa2@gmail.com",
      password: "admin1234",
      phone: "01098744789",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa2@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    const res = await request(app)
      .put("/api/users/" + reslogin?.body.data._id)
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        name: "test",
      });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You are not allowed to modify it.");
  });

  it("should update /api/users Not name 2", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa3@gmail.com",
      password: "admin1234",
      phone: "01098744789",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa3@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    const res = await request(app)
      .put("/api/users/" + reslogin?.body.data._id)
      .set("Authorization", "Bearer " + reslogin?.body.accessToken)
      .send({
        name: "te",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      '"name" length must be at least 3 characters long'
    );
  });

  it("should update /api/users Not User is data", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put("/api/users/" + nonExistingId)
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        name: "test",
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  it("should update /api/users Not admin", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa5@gmail.com",
      password: "admin1234",
      phone: "01098744789",
      role: "admin",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa5@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    const res = await request(app)
      .put("/api/users/" + reslogin?.body.data._id)
      .set("Authorization", "Bearer " + reslogin?.body.accessToken)
      .send({
        name: "Not Admin",
      });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "You do not have permission to access this path."
    );
  });
});

describe("Delete /api/users API", () => {
  it("should delete /api/users", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa6@gmail.com",
      password: "admin1234",
      phone: "01098744789",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa6@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    const res = await request(app)
      .delete("/api/users/" + reslogin?.body.data._id)
      .set("Authorization", "Bearer " + reslogin?.body.accessToken);
    expect(res.status).toBe(204);
  });

  it("should delete /api/users Not DI User", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa7@gmail.com",
      password: "admin1234",
      phone: "01098744789",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa7@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    const nonExistingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete("/api/users/" + nonExistingId)
      .set("Authorization", "Bearer " + reslogin?.body.accessToken);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You are not allowed to delete it.");
  });

  it("should delete /api/users Not admin", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa8@gmail.com",
      password: "admin1234",
      phone: "01098744789",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa8@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    const nonExistingId = new mongoose.Types.ObjectId();
    await User.deleteMany({ _id: reslogin?.body.data._id });
    const res = await request(app)
      .delete("/api/users/" + nonExistingId)
      .set("Authorization", "Bearer " + reslogin?.body.accessToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not found");
  });
});

describe("Update Pessword /api/users/forgot-password/:id API", () => {
  it("Password changed successfully", async () => {
    const res = await request(app)
      .put(`/api/users/forgot-password/${ResLoginPassword?.body.data._id}`)
      .set("Authorization", `Bearer ${ResLoginPassword?.body.accessToken}`)
      .send({ passwordCurrent: "OldPass123", passwordNew: "NewPass123" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password changed successfully");
  });

  it("You are not allowed to modify it.", async () => {
    const res = await request(app)
      .put(`/api/users/forgot-password/${ResLoginPassword?.body.data._id}`)
      .set("Authorization", `Bearer ${TokenUser}`)
      .send({ passwordCurrent: "OldPass123", passwordNew: "NewPass123" });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("You are not allowed to modify it.");
  });

  it("All fields are required", async () => {
    const res = await request(app)
      .put(`/api/users/forgot-password/${ResLoginPassword?.body.data._id}`)
      .set("Authorization", `Bearer ${ResLoginPassword?.body.accessToken}`)
      .send({ passwordCurrent: "OldPass123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });
  it("The new password must be different from the old one.", async () => {
    const res = await request(app)
      .put(`/api/users/forgot-password/${ResLoginPassword?.body.data._id}`)
      .set("Authorization", `Bearer ${ResLoginPassword?.body.accessToken}`)
      .send({ passwordCurrent: "OldPass123", passwordNew: "OldPass123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "The new password must be different from the old one."
    );
  });

  it("Password cannot be changed", async () => {
    await User.create({
      name: "test",
      lastName: "test",
      email: "aaaaaaaaa11@gmail.com",
      password: "admin1234",
      phone: "01098744789",
      isVerified: true,
    });
    const reslogin = await request(app).post("/api/auth/login").send({
      email: "aaaaaaaaa11@gmail.com",
      password: "admin1234",
    });
    expect(reslogin.status).toBe(200);
    let Not_password = await User.findById(reslogin?.body.data._id);

    if (Not_password) {
      Not_password.password = null;
      await Not_password.save();
    }
    const res = await request(app)
      .put(`/api/users/forgot-password/${reslogin?.body.data._id}`)
      .set("Authorization", `Bearer ${reslogin?.body.accessToken}`)
      .send({ passwordCurrent: "OldPass123", passwordNew: "NewPass123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password cannot be changed");
  });

  it("The password must contain at least 6 characters, a letter, and a phone.", async () => {
    const res = await request(app)
      .put(`/api/users/forgot-password/${ResLoginPassword?.body.data._id}`)
      .set("Authorization", `Bearer ${ResLoginPassword?.body.accessToken}`)
      .send({ passwordCurrent: "OldPass123", passwordNew: "abdo" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "The password must contain at least 6 characters, a letter, and a number."
    );
  });

  it("The old password is incorrect", async () => {
    const res = await request(app)
      .put(`/api/users/forgot-password/${ResLoginPassword?.body.data._id}`)
      .set("Authorization", `Bearer ${ResLoginPassword?.body.accessToken}`)
      .send({ passwordCurrent: "OldPass123Not", passwordNew: "NewPass123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("The old password is incorrect");
  });
});

// عدد ال test = 17
