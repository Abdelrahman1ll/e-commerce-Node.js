const request = require("supertest");
const app = require("../../app");
const insertProducts = require("../fixtures/Product_Fixture");
const mongoose = require("mongoose");
const { Product } = require("../../models/Product_Model");
const { Brand } = require("../../models/Brand_Model");
const { Category } = require("../../models/Category_Model");
const { User } = require("../../models/User_Model");
const connectTestDB = require("../utils/db_Test");
const {
  createAndLoginAdmin,
  createAndLoginUser,
} = require("../utils/Auth_Helper");

let accessToken;
let brands;
let categories;
let TokenUser;
let products;
beforeAll(async () => {
  await connectTestDB();
  accessToken = await createAndLoginAdmin();
  TokenUser = await createAndLoginUser();
}, 20000); // 20 ثانية

beforeEach(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
  await insertProducts();
  brands = await Brand.find();
  categories = await Category.find();
  products = await Product.find();
}, 20000);

afterAll(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
}, 20000);

describe("GET /api/products API", () => {
  it("should return all products", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  }, 10000);

  it("should sort from lowest to highest price", async () => {
    const res = await request(app).get("/api/products?sort=price");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products[0].price).toBe(2500); // أرخص منتج
    expect(res.body.data.products[2].price).toBe(9500); // أغلى منتج
  });

  it("should sort from highest to lowest price", async () => {
    const res = await request(app).get("/api/products?sort=-price");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products[0].price).toBe(9500); // أغلى منتج
    expect(res.body.data.products[2].price).toBe(2500); // أرخص منتج
  });

  it("should filter products between 2000 and 5000", async () => {
    const res = await request(app).get(
      "/api/products?price[gte]=2000&price[lte]=5000"
    );
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(2); // Product 1 (2500) & Product 3 (4000)
  });

  it("should filter products by category", async () => {
    const categories = await Category.find();
    const res = await request(app).get(
      `/api/products?category=${categories[0]._id}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products.length).toBe(2);
  });

  it("should filter products by brand", async () => {
    const brands = await Brand.find();
    const res = await request(app).get(`/api/products?brand=${brands[0]._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.products.length).toBe(2);
  });

  it("should filter products by search term", async () => {
    const res = await request(app).get("/api/products?title=abdo");
    expect(res.status).toBe(200);
    expect(res?.body.data.products[0].title).toBe("abdo");
    expect(res?.body.data.products.length).toBe(1);
  });
});

describe("GET /api/products/:id API", () => {
  it("should return a single product", async () => {
    const res = await request(app).get(`/api/products/${products[0]?._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.title).toBe(products[0].title);
  });

  it("should return a single product:id not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });
});

describe("POST /api/products API", () => {
  it("should create a new product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        title: "test",
        price: 4000,
        description: "test product 3",
        images: ["image1.jpg", "image2.jpg"],
        quantity: 10,
        brand: brands[0]?._id,
        category: categories[0]?._id,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
  });

  it("should create a new product not Category", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        title: "test",
        price: 4000,
        description: "test product 3",
        images: ["image1.jpg", "image2.jpg"],
        quantity: 10,
        brand: brands[0]?._id,
        category: fakeId,
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Category not found");
  });

  it("should create a new product not Brand", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        title: "test",
        price: 4000,
        description: "test product 3",
        images: ["image1.jpg", "image2.jpg"],
        quantity: 10,
        brand: fakeId,
        category: categories[0]._id,
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("should create a new product not Title", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        // title: "test",
        price: 4000,
        description: "test product 3",
        images: ["image1.jpg", "image2.jpg"],
        quantity: 10,
        brand: brands[0]._id,
        category: categories[0]._id,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('"title" is required');
  });

  it("should create a new product is Admin", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        title: "user",
        price: 4000,
        description: "test product 3",
        images: ["image1.jpg", "image2.jpg"],
        quantity: 10,
        brand: brands[0]._id,
        category: categories[0]._id,
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "You do not have permission to access this path."
    );
  });
});

describe("PUT /api/products API", () => {
  it("should Update a new product", async () => {
    const res = await request(app)
      .put(`/api/products/${products[1]?._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        title: "PUT",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.title).toBe("PUT");
  });

  it("should Update a new product not Category", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/products/${products[0]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        category: fakeId,
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Category not found");
  });

  it("should Update a new product not Brand", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/products/${products[0]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        brand: fakeId,
      });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("should Update a new product not ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/products/${fakeId}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        title: "test not ID",
      });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });

  it("should Update a new product is Admin", async () => {
    const res = await request(app)
      .put(`/api/products/${products[0]._id}`)
      .set("Authorization", "Bearer " + TokenUser)
      .send({
        title: "not is user",
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "You do not have permission to access this path."
    );
  });

  it("should Update a new product is title", async () => {
    const res = await request(app)
      .put(`/api/products/${products[0]._id}`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        title: "no",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain(
      '"title" length must be at least 3 characters long'
    );
  });
});

// عدد ال test = 20
