const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");

// Storage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("only images allowed", 400), false);
  }
};

// Upload
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Single image upload
exports.uploadProductImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

// Resize images before saving them into the database
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (req.files.image) {
    const ext = req.files.image[0].mimetype.split("/")[1];
    const imageFilename = `products-${uuidv4()}-${Date.now()}-cover.${ext}`;
    await sharp(req.files.image[0].buffer)
      // .resize(2000, 1333)
      // .toFormat('jpeg')
      // .jpeg({ quality: 90 })
      .toFile(`uploads/Products/${imageFilename}`); // write into a file on the disk

    // Save image into database
    req.body.image = imageFilename;
  }
  req.body.images = [];
  // 2- Image processing for images
  if (req.files.images) {
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const ext = img.mimetype.split("/")[1];
        const filename = `products-${uuidv4()}-${Date.now()}-${
          index + 1
        }.${ext}`;
        await sharp(img.buffer)
          // .resize(800, 800)
          // .toFormat('jpeg')
          // .jpeg({ quality: 90 })
          .toFile(`uploads/Products/${filename}`);

        // Save images into database
        req.body.images.push(filename);
      })
    );
  }

  next();
});

// Maintenance image  
exports.MaintenanceImage = asyncHandler(async (req, res, next) => {
  if (req.files && req.files.image) {
    // استخراج امتداد الصورة من mimetype
    const ext = req.files.image[0].mimetype.split("/")[1];
    // إنشاء اسم فريد للصورة
    const imageFilename = `Maintenance-${uuidv4()}-${Date.now()}-cover.${ext}`;

    await sharp(req.files.image[0].buffer)
      // يمكنك تفعيل الأسطر التالية لتطبيق عمليات تعديل إضافية
      // .resize(2000, 1333)
      // .toFormat('jpeg')
      // .jpeg({ quality: 90 })
      .toFile(`uploads/Maintenance/${imageFilename}`);

    // إضافة اسم الصورة إلى جسم الطلب ليتم حفظه في قاعدة البيانات
    req.body.image = imageFilename;
  }
  next();
});