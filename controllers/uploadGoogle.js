const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const { google } = require("googleapis");
const { Readable } = require("stream");
const path = require("path");
const { Product } = require("../models/Product");
// Use memory storage so file.buffer is available
const upload = multer({ storage: multer.memoryStorage() });

// Google Drive API setup
const KEYFILEPATH = path.join(
  __dirname,
  "../myproject-455905-6b2ee3b7cbbd.json"
);
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
const drive = google.drive({ version: "v3", auth });

// Product image upload to handle file uploads and resizing
exports.uploadProductImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

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

  // معالجة الصورة الرئيسية
  if (req.files.image) {
    const ext = path.extname(req.files.image[0].originalname) || ".jpeg";
    const filename = `product-${uuidv4()}${ext}`;
    const resizedBuffer = await sharp(req.files.image[0].buffer)
      .resize(800, 800)
      .jpeg({ quality: 90 })
      .toBuffer();
    req.files.image[0] = {
      originalname: filename,
      mimetype: "image/jpeg",
      buffer: resizedBuffer,
    };
  }

  next();
});


// Product image upload to upload images to Google Drive
exports.uploadImagesToDrive = asyncHandler(async (req, res, next) => {
  const folderId = "1IwjWIlbN1x7xEm-EBo3yTo84u13dBwMA";

  // التأكد من وجود المجلد في Google Drive
  await drive.files.get({
    fileId: folderId,
    fields: "id",
    supportsAllDrives: true,
  });

  // رفع الصور الإضافية الجديدة
  let newUrls = [];
  if (req.files?.images) {
    newUrls = await Promise.all(
      req.files.images.map(async (file) => {
        const { originalname, mimetype, buffer } = file;
        const createRes = await drive.files.create({
          resource: { name: originalname, parents: [folderId] },
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
  }

  // التحقق من إذا كان تحديث أو إضافة
  if (req.params.id) {
    // تحديث منتج موجود
    const product = await Product.findById(req.params.id);
    if (product) {
      // إضافة الصور الجديدة للصور القديمة
      req.body.images = [...product.images, ...newUrls];
    } else {
      req.body.images = newUrls;
    }
  } else {
    // إضافة منتج جديد
    req.body.images = newUrls;
  }

  // التعامل مع الصورة الرئيسية
  if (req.files?.image) {
    const mainImageFile = req.files.image[0];
    const { originalname, mimetype, buffer } = mainImageFile;
    const createRes = await drive.files.create({
      resource: { name: originalname, parents: [folderId] },
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
    req.body.image = meta.data.webContentLink;
  } else if (req.params.id) {
    // إذا كان تحديث ومفيش صورة رئيسية جديدة، حافظ على القديمة
    const product = await Product.findById(req.params.id);
    req.body.image = product ? product.image : null;
  } else {
    // إذا كان منتج جديد ومفيش صورة رئيسية، استخدم أول صورة إضافية
    req.body.image = newUrls[0] || null;
  }

  next();
});

// Middleware to upload a single image to Google Drive
exports.uploadSingleImage = upload.single("image");


// Middleware to resize and upload a single image to Google Drive
exports.resizeAndUploadSingleImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  try {
    const folderId = "1IwjWIlbN1x7xEm-EBo3yTo84u13dBwMA";

    // 1. التحقق من وجود المجلد
    await drive.files.get({
      fileId: folderId,
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
        parents: [folderId],
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
    console.error("Upload Error:", error);
    return next(new Error("فشل في رفع الصورة"));
  }
});
