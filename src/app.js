// app.js
require("dotenv").config();
const express = require("express");
const ApiError = require("./utils/ApiError");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");
require("colors");
const globalError = require("./middleware/errorMiddleware");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const Routers = require("./routes/index");

const app = express();

app.use(express.json());
app.use(compression()); // ضغط البيانات لتقليل حجم الاستجابة
app.use(cors());
app.options("*", cors());
app.use(helmet()); // ده لي الحماية من المخاطر المحتملة
app.use(cookieParser()); // مهم جدًا لجلب الـ Refresh Token من الكوكيز
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json()); // بيسمح للمتصفحات بالا��تجابة من الطلبات با��تخدام JSON
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // ده لي الحماية من المخاطر المحتملة
app.use(express.static(path.join(__dirname, "uploads/Products"))); // ده لي الصور اللي فيها البيانات
app.use(express.static(path.join(__dirname, "uploads/Maintenance"))); // ده لي الصور اللي فيها البيانات

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`.yellow);
} else {
  console.log(`Mode: ${process.env.NODE_ENV || "production"}`.yellow);
}

app.get("/", (red, res, next) => {
  res.status(200).json({
    message: "Welcome to the first API 🚀",
  });
});

// All the routers
Routers(app);

// development
if (process.env.NODE_ENV === "development") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerFile = require("./swagger/swagger.json");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// Middleware لمعالجة الأخطاء والمسارات غير الموجودة
app.all("*", (req, res, next) => {
  // 3) Use a generic api error
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error gandling middleware for express
app.use(globalError);

module.exports = app;
