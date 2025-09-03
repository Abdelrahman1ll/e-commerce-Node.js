const request = require("supertest");
const app = require("../../../app");
const mongoose = require("mongoose");
const { User } = require("../../models/User_Model");
const connectTestDB = require("../utils/Setup_Test_DB");
const jwt = require("jsonwebtoken");
const { createAndLoginUser } = require("../utils/Auth_Helper");
beforeAll(async () => {
  await connectTestDB();
}, 20000); // 20 ثانية

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
}, 20000);

describe("POST /api/auth/signup-google API", () => {
  beforeEach(() => {
    const { OAuth2Client } = require("google-auth-library");
    jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockImplementation(() =>
      Promise.resolve({
        getPayload: () => ({
          email: "testuser@example.com",
          given_name: "Test",
          family_name: "User",
        }),
      })
    );
  });
  it("should sign up a user via Google and return success", async () => {
    const res = await request(app).post("/api/auth/signup-google").send({
      token:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkN2VkMzM4YzBmMTQ1N2IyMTRhMjc0YjVlMGU2NjdiNDRhNDJkZGUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI2NTQ2NjUzODE0NzgtajhybGpoZWVwaGlhOXU0aDl0bTMwczUwY2xtdW5lb20uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2NTQ2NjUzODE0NzgtajhybGpoZWVwaGlhOXU0aDl0bTMwczUwY2xtdW5lb20uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTQ4NzEwOTQ2MjE3MDk2MzA3MDUiLCJlbWFpbCI6ImFiZG9tb2hhbWVkMjIwMDA2NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzU2NjcyNDQ1LCJuYW1lIjoiQWJkZWxyYWhtYW4gbW9oYW1lZCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKUXhEVkdLc2p5cWJNckpkS2hNZVNFZ2tWQWNKRzBKMjZ0d3FUS2tNYmpoYk1fRWJJPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFiZGVscmFobWFuIiwiZmFtaWx5X25hbWUiOiJtb2hhbWVkIiwiaWF0IjoxNzU2NjcyNzQ1LCJleHAiOjE3NTY2NzYzNDUsImp0aSI6IjI5N2JmMGVjNzNiYmI2ZGY5MzA3MTA2YzM0MmQ1ZWMyMTZhMDhlOTkifQ.XUvNWfY547zHCA0g9Vu0AKFf-0aPpXvIdrxVKEvvBlIxv9czuDM81lk7eSqnQK-4vQT4O6zNeNS8VPZyxY7i8KzCgzJGSCEBM-4gWYQCP2TrdE7vXZy2EM5r2-xEWH0x2xaeUekJOaqPmTFgNd4cKv8jvZF05rLxmZz5GYx8CxKJc7cyrTUptHEgU57ghoiFRvXnX8zVshuuP4dWWPUyuN_3q39pymBQWj40GqIIhnJs9eWXE0JJ6vE1TAFG8v7gZVvLitlW8ecsL0zwoy5P7wf4jrbQwYw2EbJXkDdQCi4PqYNe1DjbqV-_Lf0F_Wc80nkdI4k0tzP5jJy3Khdvqw",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should sign up a user via Google and return Google token is required 400", async () => {
    const res = await request(app).post("/api/auth/signup-google").send({
      token: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Google token is required");
  });

  it("should return 500 if Google verification fails", async () => {
    const { OAuth2Client } = require("google-auth-library");

    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce(() => {
        throw new Error("Google verification failed");
      });

    const res = await request(app).post("/api/auth/signup-google").send({
      token:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkN2VkMzM4YzBmMTQ1N2IyMTRhMjc0YjVlMGU2NjdiNDRhNDJkZGUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI2NTQ2NjUzODE0NzgtajhybGpoZWVwaGlhOXU0aDl0bTMwczUwY2xtdW5lb20uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2NTQ2NjUzODE0NzgtajhybGpoZWVwaGlhOXU0aDl0bTMwczUwY2xtdW5lb20uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTQ4NzEwOTQ2MjE3MDk2MzA3MDUiLCJlbWFpbCI6ImFiZG9tb2hhbWVkMjIwMDA2NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzU2NjcyNDQ1LCJuYW1lIjoiQWJkZWxyYWhtYW4gbW9oYW1lZCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKUXhEVkdLc2p5cWJNckpkS2hNZVNFZ2tWQWNKRzBKMjZ0d3FUS2tNYmpoYk1fRWJJPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkFiZGVscmFobWFuIiwiZmFtaWx5X25hbWUiOiJtb2hhbWVkIiwiaWF0IjoxNzU2NjcyNzQ1LCJleHAiOjE3NTY2NzYzNDUsImp0aSI6IjI5N2JmMGVjNzNiYmI2ZGY5MzA3MTA2YzM0MmQ1ZWMyMTZhMDhlOTkifQ.XUvNWfY547zHCA0g9Vu0AKFf-0aPpXvIdrxVKEvvBlIxv9czuDM81lk7eSqnQK-4vQT4O6zNeNS8VPZyxY7i8KzCgzJGSCEBM-4gWYQCP2TrdE7vXZy2EM5r2-xEWH0x2xaeUekJOaqPmTFgNd4cKv8jvZF05rLxmZz5GYx8CxKJc7cyrTUptHEgU57ghoiFRvXnX8zVshuuP4dWWPUyuN_3q39pymBQWj40GqIIhnJs9eWXE0JJ6vE1TAFG8v7gZVvLitlW8ecsL0zwoy5P7wf4jrbQwYw2EbJXkDdQCi4PqYNe1DjbqV-_Lf0F_Wc80nkdI4k0tzP5jJy3Khdvqw",
    });

    expect(res.status).toBe(500);
    expect(res.body.status).toBe("error");
    expect(res.body.message).toBe("Google verification failed");
  });
});
describe("POST /api/auth/signup API", () => {
  it("should sign up a user and return success", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "name",
      lastName: "lastName",
      email: "email12@example.com",
      number: "01234567897",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
  });

  it("should sign up a user and return Not email 400", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "name",
      lastName: "lastName",
      // email:"email12@example.com",
      number: "01234567897",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('"email" is required');
  });

  it("should sign up a user and return If the email is in the database 400", async () => {
    await User.create({
      name: "name",
      lastName: "lastName",
      email: "email13@example.com",
      number: "01234567897",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    const res = await request(app).post("/api/auth/signup").send({
      name: "name",
      lastName: "lastName",
      email: "email12@example.com",
      number: "01234567897",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email or phone number is already in use");
  });

  it("should sign up a user and return The password must contain at least 6 characters, a letter, and a number. 400", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "name",
      lastName: "lastName",
      email: "email13@example.com",
      number: "01234567007",
      password: "admi",
      passwordConfirm: "admi",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      '"password" length must be at least 6 characters long'
    );
  });
});
describe("POST /api/auth/login API", () => {
  it("should login a user and return success", async () => {
    await createAndLoginUser();
    const res = await request(app).post("/api/auth/login").send({
      email: "user@gmail.com",
      password: "user1234",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should login a user and return Not email 400", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "user@",
      password: "user1234",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('"email" must be a valid email');
  });

  it("should login a user and return Email is incorrect 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "Null@gmail.com",
      password: "user1234",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email or password is incorrect");
  });

  it("should login a user and return password is incorrect 401", async () => {
    await User.create({
      name: "name_1",
      lastName: "lastName_1",
      email: "password_null@gmail.com",
      number: "01000567897",
      password: "user1234",
      passwordConfirm: "user1234",
      isVerified: true,
    });
    const res = await request(app).post("/api/auth/login").send({
      email: "password_null@gmail.com",
      password: "user1111",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email or password is incorrect");
  });

  it("should login a user and return Email is not is Verified 401", async () => {
    await User.create({
      name: "name_2",
      lastName: "lastName_2",
      email: "verified@gmail.com",
      number: "01000567897",
      password: "admin1234",
      passwordConfirm: "user1234",
      isVerified: false,
    });
    const res = await request(app).post("/api/auth/login").send({
      email: "verified@gmail.com",
      password: "admin1234",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email is not is Verified");
  });
});
describe("POST /api/auth/logout API", () => {
  it("should logout a user and return success", async () => {
    await User.create({
      name: "name_2",
      lastName: "lastName_2",
      email: "logout@gmail.com",
      number: "01001091197",
      password: "admin1234",
      passwordConfirm: "admin1234",
      isVerified: true,
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "logout@gmail.com",
      password: "admin1234",
    });
    const token = loginRes.body.accessToken;
    expect(loginRes.status).toBe(200);
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send();
      console.log(res.body)
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logout successful");
  });
});
describe("POST /api/auth/resend-verification API", () => {
  it("should resend verification email and return success", async () => {
    await User.create({
      name: "name_3",
      lastName: "lastName_3",
      email: "verification@gmail.com",
      number: "01000561197",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    const res = await request(app).post("/api/auth/resend-verification").send({
      email: "verification@gmail.com",
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "A new verification link has been sent to your email"
    );
  });

  it("should resend verification email and return Not email Email is required 400", async () => {
    const res = await request(app).post("/api/auth/resend-verification").send({
      email: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });

  it("should resend verification email and return User not found 400", async () => {
    const res = await request(app).post("/api/auth/resend-verification").send({
      email: "verification_1@gmail.com",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not found");
  });

  it("should resend verification email and return User already is Verified 400", async () => {
    await User.create({
      name: "name_3",
      lastName: "lastName_3",
      email: "resend-verification@gmail.com",
      number: "01000561197",
      password: "admin1234",
      passwordConfirm: "admin1234",
      isVerified: true,
    });
    const res = await request(app).post("/api/auth/resend-verification").send({
      email: "resend-verification@gmail.com",
    });
    console.log(res.body)
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already is Verified");
  });
});
describe("GET /api/auth/verify:token API", () => {
  it("should verify a user and return success", async () => {
    const user = await User.create({
      name: "name_4",
      lastName: "lastName_4",
      email: "verify@gmail.com",
      number: "01000011197",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const res = await request(app).get(`/api/auth/verify/${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Email verified successfully");
  });

  it("should verify a user and return Token is required", async () => {
    const token = "";
    const res = await request(app).get(`/api/auth/verify/${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Can't find this route: /api/auth/verify/");
  });

  it("should verify a user and return Invalid token", async () => {
    await User.create({
      name: "name_5",
      lastName: "lastName_5",
      email: "verify_5@gmail.com",
      number: "01005511197",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    const token = jwt.sign({ id: "" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const res = await request(app).get(`/api/auth/verify/${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid token");
  });

  it("should verify a user and return Not User", async () => {
    const user = await User.create({
      name: "name_6",
      lastName: "lastName_6",
      email: "verify_6@gmail.com",
      number: "01005566197",
      password: "admin1234",
      passwordConfirm: "admin1234",
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await User.findByIdAndDelete(user._id);
    const res = await request(app).get(`/api/auth/verify/${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid User");
  });
});
describe("POST /api/auth/refresh API", () => {
  it("should return success", async () => {
    await User.create({
      name: "name_7",
      lastName: "lastName_7",
      email: "refresh@gmail.com",
      number: "01005577197",
      password: "admin1234",
      passwordConfirm: "admin1234",
      isVerified: true,
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "refresh@gmail.com",
      password: "admin1234",
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.status).toBe("success");
    const res = await request(app).post("/api/auth/refresh").send({
      refreshToken: loginRes?.body.refreshToken,
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("should return Not Refresh Token 400", async () => {
    const res = await request(app).post("/api/auth/refresh").send({
      refreshToken: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Refresh token is required");
  });

  it("should return 400 if refresh token is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "invalidtoken123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid refresh token");
  });

  it("should return 404 if user not found", async () => {
    await User.create({
      name: "name_8",
      lastName: "lastName_8",
      email: "refresh_8@gmail.com",
      number: "01005588197",
      password: "admin1234",
      passwordConfirm: "admin1234",
      isVerified: true,
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "refresh_8@gmail.com",
      password: "admin1234",
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.status).toBe("success");
    await User.findByIdAndDelete(loginRes.body.data._id);
    const res = await request(app).post("/api/auth/refresh").send({
      refreshToken: loginRes?.body.refreshToken,
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
