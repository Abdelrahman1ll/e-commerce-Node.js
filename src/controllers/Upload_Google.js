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
  credentials: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // Replace newline characters
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_uri: process.env.AUTH_PROVIDER_x509_CERT_URI,
    client_x509_cert_uri: process.env.CLIENT_x509_CERT_URI,
    universe_domain: process.env.UNIVERSE_DOMAIN,
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
