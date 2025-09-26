const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");
const { Product } = require("../models/Product_Model");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// رفع منتج متعدد الصور
exports.uploadProductImages = upload.fields([{ name: "images", maxCount: 4 }]);

// Resize الصور قبل رفعها
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.images) {
    req.files.images = await Promise.all(
      req.files.images.map(async (file) => {
        const filename = `product-${uuidv4()}.jpeg`;
        const resizedBuffer = await sharp(file.buffer)
          .resize(800, 800, { fit: "inside", withoutEnlargement: true })
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

// رفع الصور على Cloudinary
exports.uploadImagesToCloudinary = asyncHandler(async (req, res, next) => {
  let UpdateImgs = [];

  if (req.params.id) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError("Invalid Product ID", 400));
    }

    UpdateImgs = await Product.findById(req.params.id);
    if (!UpdateImgs) {
      return next(new ApiError("Product not found", 404));
    }

    const dleteImages = req.body.dleteImages || [];

    // احذف الصور من Cloudinary
    for (const imgUrl of dleteImages) {
      const publicIdMatch = imgUrl.match(/\/([^/]+)\.jpg/); // استخرج public_id
      if (publicIdMatch) {
        try {
          await cloudinary.uploader.destroy(publicIdMatch[1]);
        } catch (err) {
          console.error(
            `❌ فشل حذف الصورة من Cloudinary: ${imgUrl}`,
            err.message
          );
        }
      }
    }

    UpdateImgs.images = UpdateImgs.images.filter(
      (img) => !dleteImages.includes(img)
    );

    await UpdateImgs.save();
  }

  // رفع الصور الجديدة
  if (req.files?.images) {
    const newUrls = await Promise.all(
      req.files.images.map(async (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      })
    );

    if (UpdateImgs && UpdateImgs.images) {
      req.body.images = [...UpdateImgs.images, ...newUrls];
      req.body.dleteImages = [];
    } else {
      req.body.images = newUrls;
    }
  }

  next();
});

// رفع صورة واحدة
exports.uploadSingleImage = upload.single("image");

exports.resizeAndUploadSingleImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `maintenance-${uuidv4()}.jpeg`;

    const resizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { fit: "inside" })
      .jpeg({ quality: 90 })
      .toBuffer();

    const uploadPromise = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "maintenance", public_id: filename },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(resizedBuffer).pipe(stream);
      });

    req.body.image = await uploadPromise();
    next();
  } catch (error) {
    return next(new ApiError("Failed to upload image to Cloudinary", 500));
  }
});
