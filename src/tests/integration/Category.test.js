const request = require("supertest");
const app = require("../../app");
const insertCategory = require("../fixtures/Category_Fixture");
const mongoose = require("mongoose");
const { Category } = require("../../models/Category_Model");
const { User } = require("../../models/User_Model");
// const connectTestDB = require("../utils/db_Test");
const {
  createAndLoginAdmin,
  createAndLoginUser,
} = require("../utils/Auth_Helper");

let accessToken;
let category;
beforeAll(async () => {
  // await connectTestDB();
  accessToken = await createAndLoginAdmin();
  TokenUser = await createAndLoginUser();
}, 20000); // 20 ثانية

beforeEach(async () => {
  await Category.deleteMany({});
  await insertCategory();
  category = await Category.find();
}, 20000);

// afterAll(async () => {
//   await Category.deleteMany({});
//   await User.deleteMany({});
//   // await mongoose.connection.close();
// }, 20000);

describe("GET /api/categorys API", () => {
  it("should return all /api/categorys", async () => {
    const response = await request(app).get("/api/categorys");
    expect(response?.status).toBe(200);
    expect(response?.body.data.length).toBe(2);
  });
});

describe("GET /api/categorys/:id API", () => {
  it("should return /api/categorys/:id", async () => {
    const res = await request(app).get(`/api/categorys/${category[1]?._id}`);
    expect(res?.status).toBe(200);
    expect(res?.body.status).toBe("success");
  }, 20000);

  it("should return 404 /api/categorys/:id not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/categorys/${fakeId}`);
    expect(res?.status).toBe(404);
    expect(res?.body.message).toBe("Category not found");
  }, 20000);
});

describe("POST /api/categorys API", () => {
  it("should return POST /api/categorys", async () => {
    const res = await request(app)
      .post("/api/categorys")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Abdo",
      });
    expect(res?.status).toBe(201);
    expect(res?.body.data.name).toBe("Abdo");
    expect(res?.body.status).toBe("success");
  });

  it("should return POST /api/categorys Not Found", async () => {
    const res = await request(app)
      .post("/api/categorys")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Ab",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.error).toContain("name");
  });

  it("should return POST /api/categorys Not Found Admin", async () => {
    const res = await request(app)
      .post("/api/categorys")
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        name: "Abdo2",
      });
    expect(res?.status).toBe(403);
    expect(res?.body.message).toContain(
      "You do not have permission to access this path."
    );
  });

  it("should return POST /api/categorys Not Found name", async () => {
    const res = await request(app)
      .post("/api/categorys")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Laptop",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.message).toBe("Category already exists");
  });
});

describe("PUT /api/categorys/:id API", () => {
  it("should return PUT /api/categorys/:id", async () => {
    const res = await request(app)
      .put(`/api/categorys/${category[0]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Abdo Updated",
      });
    expect(res?.status).toBe(201);
    expect(res?.body.data.name).toBe("Abdo Updated");
  });

  it("should return PUT /api/categorys/:id Not Found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/categorys/${fakeId}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Abdo Updated2",
      });
    expect(res?.status).toBe(404);
    expect(res?.body.message).toBe("Category not found");
  });

  it("should return PUT /api/categorys/:id Not Found Admin", async () => {
    const res = await request(app)
      .put(`/api/categorys/${category[0]._id}`)
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        name: "Abdo Updated2",
      });
    expect(res?.status).toBe(403);
    expect(res?.body.message).toBe(
      "You do not have permission to access this path."
    );
  });

  it("should return PUT /api/categorys/:id Not Found", async () => {
    const res = await request(app)
      .put(`/api/categorys/${category[1]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Ab",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.error).toContain("name");
  });

  it("should return PUT /api/categorys Not Found name", async () => {
    const res = await request(app)
      .put(`/api/categorys/${category[0]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "Laptop",
      });
    expect(res?.status).toBe(400);
    expect(res?.body.message).toBe("Category already exists");
  });
});

describe("DELETE /api/categorys/:id API", () => {
  it("should return DELETE /api/categorys/:id", async () => {
    const res = await request(app)
      .delete(`/api/categorys/${category[0]._id}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res?.status).toBe(204);
  });

  it("should return DELETE /api/categorys/:id Not Found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/categorys/${fakeId}`)
      .set("Authorization", "Bearer " + accessToken);
    expect(res?.status).toBe(404);
    expect(res?.body.message).toBe("Category not found");
  });

  it("should return DELETE /api/categorys/:id Not Found Admin", async () => {
    const res = await request(app)
      .delete(`/api/categorys/${category[0]._id}`)
      .set("Authorization", "Bearer " + TokenUser);
    expect(res?.status).toBe(403);
    expect(res?.body.message).toBe(
      "You do not have permission to access this path."
    );
  });
});
// عدد ال test = 15
