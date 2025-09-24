require("dotenv").config();
const express = require("express");
const path = require("path");
require("colors");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");

const ApiError = require("./utils/ApiError");
const globalError = require("./middleware/errorMiddleware");
const Routers = require("./routes/index");

// Prometheus client
const {
  register,
  metricsMiddleware,
  startMemoryWatcher,
} = require("./utils/metrics");

const app = express();

// ============================
// Middleware
// ============================

// ضغط الاستجابة لتقليل حجم البيانات
app.use(compression());

// حماية الـ HTTP headers
app.use(helmet());

// السماح بالطلبات من أي مصدر (CORS)
app.use(cors());
app.options("*", cors());

// Logging في وضع التطوير
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`.yellow);
} else {
  console.log(`Mode: ${process.env.NODE_ENV || "production"}`.yellow);
}

// Parsing للـ JSON والـ URL-encoded
app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// قراءة الكوكيز
app.use(cookieParser());

// حماية من NoSQL Injection على body فقط
app.use((req, res, next) => {
  if (req.body) {
    const sanitizedBody = mongoSanitize.sanitize(req.body); // بدون تعديل req.query أو req.params
    req.body = sanitizedBody;
  }
  next();
});

// ملفات ثابتة (صور المنتجات والصيانة)
// app.use(express.static(path.join(__dirname, "uploads/Products")));
// app.use(express.static(path.join(__dirname, "uploads/Maintenance")));

// Prometheus middleware
// app.use(metricsMiddleware);

// Endpoint لعرض الـ metrics
// app.get("/metrics", async (req, res) => {
//   res.set("Content-Type", register.contentType);
//   res.end(await register.metrics());
// });

// Memory watcher
// startMemoryWatcher();

// ============================
// Routes
// ============================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the first API 🚀",
  });
});

// ربط جميع الروترات
Routers(app);

// Swagger UI للـ documentation في وضع التطوير
if (process.env.NODE_ENV === "development") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerFile = require("./swagger/swagger.json");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// ============================
// Handle unknown routes
// ============================
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// ============================
// Global error handler
// ============================
app.use(globalError);

// تصدير التطبيق
module.exports = app;
