require("dotenv").config(); // ⚠️ يجب أن يكون أول أمر يتم تنفيذه
const express = require("express");
const ApiError = require("./utils/ApiError");
const cors = require("cors");
const connectDB = require("./config/dbConn");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");
const morgan = require("morgan");
require("colors");
const globalError = require("./middleware/errorMiddleware");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const Routers = require("./routes/index");

const PORT = process.env.PORT || 5000;


connectDB();
const app = express();
app.use(express.json());
app.use(compression()); // ضغط البيانات لتقليل حجم الاستجابة
app.use(cors());
app.options("*", cors());
app.use(helmet());

app.use(bodyParser.json()); // بيسمح للمتصفحات بالا��تجابة من الطلبات با��تخدام JSON
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static(path.join(__dirname, "uploads/Products"))); // ده لي الصور اللي فيها البيانات
app.use(express.static(path.join(__dirname, "uploads/Maintenance"))); // ده لي الصور اللي فيها البيانات
// app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode : ${process.env.NODE_ENV}`.yellow);
}



app.use(cookieParser()); // مهم جدًا لجلب الـ Refresh Token من الكوكيز
app.use(
  cors({
    origin: "*",
  })
);

// All the routers
Routers(app);

// Middleware لمعالجة الأخطاء والمسارات غير الموجودة
app.all("*", (req, res, next) => {
  // 3) Use a generic api error
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// ميدلوير معالجة الأخطاء
app.use(globalError);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB...".blue);
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server is running on port ${PORT}`.green);
  });
});
mongoose.connection.on("error", (err) => {
  console.log(`error: ${err}`);
});
