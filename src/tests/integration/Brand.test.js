const request = require("supertest");
const app = require("../../app");
const insertBrand = require("../fixtures/Brand_Fixture");
const mongoose = require("mongoose");
const { Brand } = require("../../models/Brand_Model");
const { User } = require("../../models/User_Model");
const connectTestDB = require("../utils/db_Test");
const {
  createAndLoginAdmin,
  createAndLoginUser,
} = require("../utils/Auth_Helper");

let accessToken;
let brands;
beforeAll(async () => {
  await connectTestDB();
  accessToken = await createAndLoginAdmin();
  TokenUser = await createAndLoginUser();
}, 20000); // 20 ثانية

beforeEach(async () => {
  await Brand.deleteMany({});
  await insertBrand();
  brands = await Brand.find();
}, 20000);

afterAll(async () => {
  await Brand.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
}, 20000);

describe("GET /api/brands API", () => {
  it("should return all /api/brands", async () => {
    const response = await request(app).get("/api/brands");
    expect(response?.status).toBe(200);
    expect(response?.body.data.length).toBe(2);
  });
});

describe("GET /api/brands/:id API", () => {
  it("should return /api/brands/:id", async () => {
    const res = await request(app).get(`/api/brands/${brands[1]?._id}`);
    expect(res?.status).toBe(200);
    expect(res?.body.status).toBe("success");
  }, 20000);

  it("should return 404 /api/brands/:id not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/brands/${fakeId}`);
    expect(res?.status).toBe(404);
    expect(res?.body.message).toBe("Brand not found");
  }, 20000);
});

describe("POST /api/brands API", () => {
  it("should return POST /api/brands", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Abdo",
      });
    expect(res?.status).toBe(201);
    expect(res?.body.data.name).toBe("Abdo");
    expect(res?.body.status).toBe("success");
  });

  it("should return POST /api/brands Not Found", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Ab",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.error).toContain("name");
  });

  it("should return POST /api/brands Not Found Admin", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        name: "Abdo2",
      });
    expect(res?.status).toBe(403);
    expect(res?.body.message).toContain(
      "You do not have permission to access this path."
    );
  });

  it("should return POST /api/brands Not Found name", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Apple",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.message).toBe("Brand already exists");
  });
});

describe("PUT /api/brands/:id API", () => {
  it("should return PUT /api/brands/:id", async () => {
    const res = await request(app)
      .put(`/api/brands/${brands[0]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Abdo Updated",
      });
    expect(res?.status).toBe(201);
    expect(res?.body.data.name).toBe("Abdo Updated");
  });

  it("should return PUT /api/brands/:id Not Found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/brands/${fakeId}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Abdo Updated2",
      });
    expect(res?.status).toBe(404);
    expect(res?.body.message).toBe("Brand not found");
  });

  it("should return PUT /api/brands/:id Not Found Admin", async () => {
    const res = await request(app)
      .put(`/api/brands/${brands[0]._id}`)
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        name: "Abdo Updated2",
      });
    expect(res?.status).toBe(403);
    expect(res?.body.message).toBe(
      "You do not have permission to access this path."
    );
  });

  it("should return PUT /api/brands/:id Not Found", async () => {
    const res = await request(app)
      .put(`/api/brands/${brands[0]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Ab",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.error).toContain("name");
  });

  it("should return PUT /api/brands Not Found name", async () => {
    const res = await request(app)
      .put(`/api/brands/${brands[1]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Samsung",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.message).toBe("Brand already exists");
  });
});

describe("DELETE /api/brands/:id API", () => {
  it("should return DELETE /api/brands/:id", async () => {
    const res = await request(app)
      .delete(`/api/brands/${brands[0]._id}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res?.status).toBe(204);
  });

  it("should return DELETE /api/brands/:id Not Found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/brands/${fakeId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res?.status).toBe(404);
    expect(res?.body.message).toBe("Brand not found");
  });

  it("should return DELETE /api/brands/:id Not Found Admin", async () => {
    const res = await request(app)
      .delete(`/api/brands/${brands[0]._id}`)
      .set("Authorization", "Bearer " + TokenUser);
    expect(res?.status).toBe(403);
    expect(res?.body.message).toBe(
      "You do not have permission to access this path."
    );
  });
});
// عدد ال test = 15
