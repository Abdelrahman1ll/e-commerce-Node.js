const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const { google } = require("googleapis");
const { Readable } = require("stream");
const path = require("path");
const ApiError = require("../utils/ApiError");
const { Product } = require("../models/Product_Model");
const mongoose = require("mongoose");
// Use memory storage so file.buffer is available
const upload = multer({ storage: multer.memoryStorage() });

// Google Drive API setup
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({
  // credentials: {
  //   type: process.env.TYPE,
  //   project_id: process.env.PROJECT_ID,
  //   private_key_id: process.env.PRIVATE_KEY_ID,
  //   private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace newline characters
  //   client_email: process.env.CLIENT_EMAIL,
  //   client_id: process.env.CLIENT_ID,
  //   auth_uri: process.env.AUTH_URI,
  //   token_uri: process.env.TOKEN_URI,
  //   auth_provider_x509_cert_uri: process.env.AUTH_PROVIDER_x509_CERT_URI,
  //   client_x509_cert_uri: process.env.CLIENT_x509_CERT_URI,
  //   universe_domain: process.env.UNIVERSE_DOMAIN,
  // },
  credentials: {
    type: "service_account",
    project_id: "e-commerce-473312",
    private_key_id: "67b55ad0cb334c95e415a4d78cf0f41b6baa1061",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDftgIEaCG+ymsB\nj4iwLPqYIuKEjfdzfHTYV4P+AwIOSUhHc17zcNYI8nhJRfdh5RpqCW1dTHeAHRY2\nr3aF8ZpwFHEOU2EinBRhPQQmQhu9hvZ/FBcTCAqHuTHCU5Iiiw7NCbXJHSlAyXNN\n9tOa5NaxMbg/XsOaI8F2268+cPkJC43H+F/sUz04iZ3ncv+faAHa8Y0+2xgwfLCL\n2AQ9VC6RU6xhvAAd1esbo2Wwi3bDe6V+1wKMumJRnJj86FTuKrA777JvmQ4OHUlo\nqYI7uxmYsgcz9QK6ozxsYHhJyWNIRBi6tQxtggKCX6LWnx9vz9T9o3kQIs7qXtLq\ne+MW7sOFAgMBAAECggEASQBRxDJe4K2ZIZc/GY5z7/ViSbMyDqOMVZSpY9iDcToE\nthw13ebyUVUeX3rPcUibyAJvh8SOMmZLe2jimm7u4KgrBGu9BNg95kVM91cXSk+i\nXHGn3fP/y65pSGqRA2ixWcNTaN91OMkEMWrcPm1yibwZzcQUvFXyqeCiXRPskEBy\nvCS3taRkdBRUo66gpLvicpiJyf9DOsInOkHx1hiYpANOTmjbwOWQE4WxHPjuWynL\nNjNx+726D0TsfB2GErrk990Qz6wosKtbenq4kngM1hxoiDy5x6dP9iE5UjFzJyJI\nYivQ7KX47speV9Md+N5prM2L4t7QdWnZBhjb6aiL+QKBgQDzecu129xTRSfnz6Xi\nkb5QvhN/E8NGw2K6u+iYwuX/KkKf6HAOzPWSBlu7fwHqqTZdTNleEKxy+Gwb2dyS\n1zpE8cU625Se7piaf5HhEqfXmuaXyCUtX8ZwyipN71szKbgZU1JdrX8UrEbkLF9v\nhCdtmK0Hr0Q3sWW7lDWoRvs4SwKBgQDrN/CfT3/qHNaCpNJmiR6nJckaOmcSWofZ\nXZRY+LCEPemvomnFYybFPC/Jw3r/zs6gXqH4ep8XSzhYKOMtFBQeW8k2CwozEcaR\nGyZ790tucpyA3ceGlbhWi58CWuBGL5NachWs8uxJNac0F8LKO1QZ+ppDHp3c0OX1\nB8YGr9ExbwKBgQCZpCYUoKUsNtuzwKkhjG7YbNnIuyPjJ7DJvYJNw893caeRWRA9\nhsEAYNrKOp9vAVC5F6GjZkosUu+Fs7kpQIAYuaiIN8BVeqL5+76GlUstFyakaTxs\noZ+L1UdU3tJiOtVdxeKYEr+6v+wMWKPwryhiVJH743Hc4ykbca9afVBSeQKBgQDK\nFJU1SSesCnqAYvof/U3IbD4JuoMy0XRE2pDIn1+HPWm26uHUIwr8CGlF/ht+Cj6a\nqLKetzpW2NjfZMFHySg/rLuBIprwpSTjJWA6wIqdqPmr/N2eUqK8N9e0Pj7QDa+a\n1MiqfUli3CV6K6+97pqidxpw76zQOOhXSwZmWEZxIQKBgQDExwhNZWOu7xIg6yzB\ne8dxJIMldRhDMuC/oG93z65W9fKPyG7Oqf8bC5hUZy4WbuAz5UWnwfdI/rhG/Acu\nFMVG65FSNzJPcZQB+bbom9pMpybJAykXSDWwcIONi6JebiaerDADqQzMPsdZb7M1\n9hkdRuGuW8An5xPbQsJ2/7DGlA==\n-----END PRIVATE KEY-----\n",
    client_email: "e-commerce@e-commerce-473312.iam.gserviceaccount.com",
    client_id: "116980856358278535631",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/e-commerce%40e-commerce-473312.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  },
  scopes: SCOPES,
});
const drive = google.drive({ version: "v3", auth });

// Product image upload to handle file uploads and resizing
exports.uploadProductImages = upload.fields([{ name: "images", maxCount: 4 }]);

// Product image upload to resize images before uploading to Google Drive
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  // معالجة الصور الإضافية
  if (req.files.images) {
    req.files.images = await Promise.all(
      req.files.images.map(async (file) => {
        const ext = path.extname(file.originalname) || ".jpeg";
        const filename = `product-${uuidv4()}${ext}`;
        const resizedBuffer = await sharp(file.buffer)
          .resize(800, 800)
          .jpeg({ quality: 90 })
          .toBuffer();
        return {
          originalname: filename,
          mimetype: "image/jpeg",
          buffer: resizedBuffer,
        };
      })
    );
  }

  next();
});

// Upload to Google Drive
exports.uploadImagesToDrive = asyncHandler(async (req, res, next) => {
  // تأكد من وجود المجلد
  await drive.files.get({
    fileId: process.env.FOLDER_ID,
    fields: "id",
    supportsAllDrives: true,
  });

  let UpdateImgs = [];

  if (req.params.id) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError("Invalid Product ID", 400));
    }
    // تحديث منتج موجود
    UpdateImgs = await Product.findById(req.params.id);
    if (!UpdateImgs) {
      return next(new ApiError("Product not found", 404));
    }

    const dleteImg = req.body.dleteImg || [];

    // لو في صور محذوفة من الداتا احذفها من Google Drive كمان
    for (const imgUrl of dleteImg) {
      const match = imgUrl.match(/id=([^&]+)/); // استخرج fileId من اللينك
      if (match && match[1]) {
        const fileId = match[1];
        try {
          await drive.files.delete({
            fileId,
            supportsAllDrives: true,
          });
        } catch (err) {
          console.error(
            `❌ فشل حذف الصورة من Google Drive: ${fileId}`,
            err.message
          );
        }
      }
    }

    // فلترة الصور الحالية لإزالة الصور اللي اتحذفت
    UpdateImgs.images = UpdateImgs.images.filter(
      (img) => !dleteImg.includes(img)
    );

    // حفظ التحديث
    await UpdateImgs.save();
  }
  // رفع الصور الإضافية الجديدة
  if (req.files?.images) {
    const newUrls = await Promise.all(
      req.files.images.map(async (file) => {
        const { originalname, mimetype, buffer } = file;
        const createRes = await drive.files.create({
          resource: { name: originalname, parents: [process.env.FOLDER_ID] },
          media: { mimeType: mimetype, body: Readable.from(buffer) },
          fields: "id",
          supportsAllDrives: true,
        });
        const fileId = createRes.data.id;
        await drive.permissions.create({
          fileId,
          requestBody: { role: "reader", type: "anyone" },
          supportsAllDrives: true,
        });

        const meta = await drive.files.get({
          fileId,
          fields: "webContentLink",
          supportsAllDrives: true,
        });
        return meta.data.webContentLink;
      })
    );
    if (UpdateImgs && UpdateImgs.images) {
      // إذا كان تحديث، أضف الصور الجديدة للصور القديمة
      req.body.images = [...UpdateImgs.images, ...newUrls];
      req.body.dleteImg = [];
    } else {
      // إذا كان إضافة منتج جديد
      req.body.images = newUrls;
    }
  }

  next();
});

// Middleware to upload a single image to Google Drive
exports.uploadSingleImage = upload.single("image");

// Middleware to resize and upload a single image to Google Drive
exports.resizeAndUploadSingleImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  try {
    // 1. التحقق من وجود المجلد
    await drive.files.get({
      fileId: process.env.FOLDER_ID,
      fields: "id",
      supportsAllDrives: true,
    });

    // 2. معالجة الصورة
    const ext = path.extname(req.file.originalname) || ".jpeg";
    const filename = `maintenance-${uuidv4()}${ext}`;

    const resizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { fit: "inside" })
      .jpeg({ quality: 90 })
      .toBuffer();

    // 3. رفع الصورة
    const createRes = await drive.files.create({
      resource: {
        name: filename,
        parents: [process.env.FOLDER_ID],
      },
      media: {
        mimeType: "image/jpeg",
        body: Readable.from(resizedBuffer),
      },
      fields: "id",
      supportsAllDrives: true,
    });

    const fileId = createRes.data.id;

    // 4. إعداد الصلاحيات
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
        allowFileDiscovery: true,
      },
      supportsAllDrives: true,
    });
    const meta = await drive.files.get({
      fileId,
      fields: "webContentLink",
      supportsAllDrives: true,
    });
    // 5. الحصول على الرابط المباشر
    // req.body.image = `https://drive.google.com/uc?id=${fileId}&export=download`;
    req.body.image = meta.data.webContentLink;
    next();
  } catch (error) {
    return next(new ApiError("Failed to upload image to Google", 500));
  }
});
