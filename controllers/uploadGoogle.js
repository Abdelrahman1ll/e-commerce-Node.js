// const sharp = require("sharp");
// const { v4: uuidv4 } = require("uuid");
// const asyncHandler = require("express-async-handler");
// const multer = require("multer");
// const { google } = require("googleapis");
// const { Readable } = require("stream");
// const path = require("path");

// // Use memory storage so file.buffer is available
// const upload = multer({ storage: multer.memoryStorage() });

// // Google Drive API setup
// const KEYFILEPATH = path.join(
//   __dirname,
//   "../myproject-455905-6b2ee3b7cbbd.json"
// );
// const SCOPES = ["https://www.googleapis.com/auth/drive"];
// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });
// const drive = google.drive({ version: "v3", auth });

// // 1) Middleware: upload product images
// exports.uploadProductImages = upload.fields([
//   { name: "image", maxCount: 1 },
//   { name: "images", maxCount: 5 },
// ]);

// // 2) Middleware: resize uploaded images
// exports.resizeProductImages = asyncHandler(async (req, res, next) => {
//   if (!req.files?.images) return next();

//   req.files.images = await Promise.all(
//     req.files.images.map(async ({ originalname, buffer }) => {
//       const ext = path.extname(originalname) || ".jpeg";
//       const filename = `product-${uuidv4()}${ext}`;

//       const resizedBuffer = await sharp(buffer)
//         .resize(800, 800)
//         .jpeg({ quality: 90 })
//         .toBuffer();
//       return {
//         originalname: filename,
//         mimetype: "image/jpeg",
//         buffer: resizedBuffer,
//       };
//     })
//   );

//   next();
// });

// // 3) Middleware: upload buffers to Google Drive, set public permissions, and attach URLs
// exports.uploadImagesToDrive = asyncHandler(async (req, res, next) => {
//   if (!req.files?.images) return next();
//   const folderId = "1IwjWIlbN1x7xEm-EBo3yTo84u13dBwMA";

//   // Ensure folder exists
//   await drive.files.get({
//     fileId: folderId,
//     fields: "id",
//     supportsAllDrives: true,
//   });

//   const urls = [];
//   for (const file of req.files.images) {
//     const { originalname, mimetype, buffer } = file;
//     // Upload file
//     const createRes = await drive.files.create({
//       resource: { name: originalname, parents: [folderId] },
//       media: { mimeType: mimetype, body: Readable.from(buffer) },
//       fields: "id",
//       supportsAllDrives: true,
//     });
//     const fileId = createRes.data.id;

//     // Make file public (anyone with link)
//     await drive.permissions.create({
//       fileId,
//       requestBody: { role: "reader", type: "anyone" },
//       supportsAllDrives: true,
//     });

//     // Get a direct link to the binary content
//     const meta = await drive.files.get({
//       fileId,
//       fields: "webContentLink",
//       supportsAllDrives: true,
//     });
//     urls.push(meta.data.webContentLink);
//   }

//   // Attach URLs to request body for product controller
//   req.body.images = urls;
//   req.body.image = urls[0] || null; // main image
//   next();
// });

// // 4) Middleware: upload single image (e.g., for repair feature)
// exports.uploadSingleImage = upload.single("image"); // اسم الفيلد هو "images" (صورة واحدة)

// exports.resizeAndUploadSingleImage = asyncHandler(async (req, res, next) => {
//   if (!req.file) return next();

//   const folderId = "1IwjWIlbN1x7xEm-EBo3yTo84u13dBwMA";
//   await drive.files.get({
//     fileId: folderId,
//     fields: "id",
//     supportsAllDrives: true,
//   });

//   const ext = path.extname(req.file.originalname) || ".jpeg";
//   const filename = `repair-${uuidv4()}${ext}`;

//   const resizedBuffer = await sharp(req.file.buffer)
//     .resize(800, 800)
//     .jpeg({ quality: 90 })
//     .toBuffer();

//   const createRes = await drive.files.create({
//     resource: { name: filename, parents: [folderId] },
//     media: { mimeType: "image/jpeg", body: Readable.from(resizedBuffer) },
//     fields: "id",
//     supportsAllDrives: true,
//   });

//   const fileId = createRes.data.id;

//   await drive.permissions.create({
//     fileId,
//     requestBody: { role: "reader", type: "anyone" },
//     supportsAllDrives: true,
//   });

//   const meta = await drive.files.get({
//     fileId,
//     fields: "webContentLink",
//     supportsAllDrives: true,
//   });

//   // نحط اللينك في الريكويست علشان يتسجل مع العنصر
//   req.body.image = meta.data.webContentLink;

//   next();
// });



const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const { google } = require("googleapis");
const { Readable } = require("stream");
const path = require("path");

// ===========================================
//  إعدادات أساسية
// ===========================================
const KEYFILEPATH = path.join(__dirname, "../myproject-455905-6b2ee3b7cbbd.json");
const DRIVE_FOLDER_ID = "1IwjWIlbN1x7xEm-EBo3yTo84u13dBwMA";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ===========================================
//  تهيئة Google Drive
// ===========================================
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// ===========================================
//  إعدادات Multer
// ===========================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 6 // صورة رئيسية + 5 صور إضافية
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("أنواع الملفات المسموحة: JPEG, PNG, WEBP"), false);
    }
    cb(null, true);
  }
});

// ===========================================
//  Middlewares
// ===========================================

// 1) رفع الصور إلى الذاكرة
exports.uploadProductImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 5 }
]);

// 2) معالجة الصور
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  const processImage = async (file) => {
    const ext = path.extname(file.originalname) || ".jpeg";
    const filename = `product-${uuidv4()}${ext}`;

    return sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 90,
        mozjpeg: true 
      })
      .toBuffer()
      .then(buffer => ({
        originalname: filename,
        mimetype: "image/jpeg",
        buffer
      }));
  };

  if (req.files.image) {
    req.files.image[0] = await processImage(req.files.image[0]);
  }

  if (req.files.images) {
    req.files.images = await Promise.all(req.files.images.map(processImage));
  }

  next();
});

// 3) رفع الصور إلى Google Drive
exports.uploadImagesToDrive = asyncHandler(async (req, res, next) => {
  try {
    const uploadFile = async (file) => {
      const createRes = await drive.files.create({
        resource: { 
          name: file.originalname, 
          parents: [DRIVE_FOLDER_ID] 
        },
        media: {
          mimeType: file.mimetype,
          body: Readable.from(file.buffer)
        },
        fields: "id",
        supportsAllDrives: true,
      });

      await drive.permissions.create({
        fileId: createRes.data.id,
        requestBody: { 
          role: "reader", 
          type: "anyone" 
        },
        supportsAllDrives: true,
      });

      return `https://drive.google.com/uc?id=${createRes.data.id}&export=download`;
    };

    const urls = [];
    
    if (req.files.image) {
      urls.push(await uploadFile(req.files.image[0]));
    }

    if (req.files.images) {
      urls.push(...await Promise.all(req.files.images.map(uploadFile)));
    }

    req.body.images = urls;
    req.body.image = urls[0] || null;
    
    next();
  } catch (error) {
    console.error('Google Drive Error:', error);
    next(new ErrorResponse('فشل في رفع الصور إلى السحابة', 500));
  }
});

// ===========================================
//  معالجة الصور الفردية (للإصلاحات)
// ===========================================
exports.uploadSingleImage = upload.single("image");

exports.processSingleImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  try {
    const resizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    const filename = `repair-${uuidv4()}${path.extname(req.file.originalname) || ".jpeg"}`;

    const createRes = await drive.files.create({
      resource: { 
        name: filename, 
        parents: [DRIVE_FOLDER_ID] 
      },
      media: { 
        mimeType: "image/jpeg", 
        body: Readable.from(resizedBuffer) 
      },
      fields: "id",
      supportsAllDrives: true,
    });

    await drive.permissions.create({
      fileId: createRes.data.id,
      requestBody: { 
        role: "reader", 
        type: "anyone" 
      },
      supportsAllDrives: true,
    });

    req.body.image = `https://drive.google.com/uc?id=${createRes.data.id}&export=download`;
    
    next();
  } catch (error) {
    console.error('Single Image Error:', error);
    next(new ErrorResponse('فشل في معالجة الصورة', 500));
  }
});

// ===========================================
//  خدمة تنظيف الملفات القديمة
// ===========================================
// const cleanOldFiles = async () => {
//   try {
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     const { data } = await drive.files.list({
//       q: `'${DRIVE_FOLDER_ID}' in parents and createdTime < '${thirtyDaysAgo.toISOString()}'`,
//       fields: 'files(id, name)',
//       supportsAllDrives: true,
//     });

//     await Promise.all(data.files.map(async (file) => {
//       await drive.files.delete({
//         fileId: file.id,
//         supportsAllDrives: true,
//       });
//       console.log(`Deleted old file: ${file.name}`);
//     }));
//   } catch (error) {
//     console.error('Cleanup Error:', error);
//   }
// };

// // تشغيل التنظيف كل 24 ساعة
// setInterval(cleanOldFiles, 24 * 60 * 60 * 1000);