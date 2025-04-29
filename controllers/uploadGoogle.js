const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const { google } = require("googleapis");
const { Readable } = require("stream");
const path = require("path");

// Use memory storage so file.buffer is available
const upload = multer({ storage: multer.memoryStorage() });


// Google Drive API setup
const KEYFILEPATH = path.join(__dirname, "../myproject-455905-6b2ee3b7cbbd.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({ keyFile: KEYFILEPATH, scopes: SCOPES });
const drive = google.drive({ version: "v3", auth });

// 1) Middleware: upload product images
exports.uploadProductImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

// 2) Middleware: resize uploaded images
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files?.images) return next();

  req.files.images = await Promise.all(
    req.files.images.map(async ({ originalname, buffer }) => {
      const ext = path.extname(originalname) || ".jpeg";
      const filename = `product-${uuidv4()}${ext}`;

      const resizedBuffer = await sharp(buffer)
        .resize(800, 800)
        .jpeg({ quality: 90 })
        .toBuffer();
      return { originalname: filename, mimetype: "image/jpeg", buffer: resizedBuffer };
    })


  );

  

  next();
});

// 3) Middleware: upload buffers to Google Drive, set public permissions, and attach URLs
exports.uploadImagesToDrive = asyncHandler(async (req, res, next) => {
  if (!req.files?.images) return next();
  const folderId = "1IwjWIlbN1x7xEm-EBo3yTo84u13dBwMA";

  // Ensure folder exists
  await drive.files.get({ fileId: folderId, fields: "id", supportsAllDrives: true });

  const urls = [];
  for (const file of req.files.images) {
    const { originalname, mimetype, buffer } = file;
    // Upload file
    const createRes = await drive.files.create({
      resource: { name: originalname, parents: [folderId] },
      media: { mimeType: mimetype, body: Readable.from(buffer) },
      fields: "id",
      supportsAllDrives: true,
    });
    const fileId = createRes.data.id;

    // Make file public (anyone with link)
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });

    // Get a direct link to the binary content
    const meta = await drive.files.get({
      fileId,
      fields: "webContentLink",
      supportsAllDrives: true,
    });
    urls.push(meta.data.webContentLink);
  }

  // Attach URLs to request body for product controller
  req.body.images = urls;
  req.body.image = urls[0] || null; // main image
  next();
});




// 4) Middleware: upload single image (e.g., for repair feature)
exports.uploadSingleImage = upload.single("image"); // اسم الفيلد هو "images" (صورة واحدة)

exports.resizeAndUploadSingleImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const folderId = "1IwjWIlbN1x7xEm-EBo3yTo84u13dBwMA";
  await drive.files.get({ fileId: folderId, fields: "id", supportsAllDrives: true });

  const ext = path.extname(req.file.originalname) || ".jpeg";
  const filename = `repair-${uuidv4()}${ext}`;

  const resizedBuffer = await sharp(req.file.buffer)
    .resize(800, 800)
    .jpeg({ quality: 90 })
    .toBuffer();

  const createRes = await drive.files.create({
    resource: { name: filename, parents: [folderId] },
    media: { mimeType: "image/jpeg", body: Readable.from(resizedBuffer) },
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

  // نحط اللينك في الريكويست علشان يتسجل مع العنصر
  req.body.image = meta.data.webContentLink;

  next();
});
