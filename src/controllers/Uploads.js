const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// إعداد التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../Uploads/Products"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      "Product-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// إعداد multer
const upload = multer({
  storage: storage,
  limits: {
    files: 4, // الحد الأقصى للملفات
    fileSize: 5 * 1024 * 1024, // 5MB لكل ملف
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed (jpeg, jpg, png, gif)"));
    }
  },
});

// Middleware لرفع الصور
const uploadImagesProduct = async (req, res, next) => {
  // dleteImg ده لو في صور محذوفة من الداتا[dleteImages]

  if (req.body.dleteImages) {
    req.body.dleteImages.forEach((filename) => {
      const filePath = path.join(__dirname, "../../Uploads/Products", filename);
      console.log("filePath" + filePath);
      fs.unlink(filePath);
      // if (fs.existsSync(filePath)) {
      //   try {
      //     fs.unlinkSync(filePath);
      //     console.log(`Deleted old image: ${filename}`);
      //   } catch (err) {
      //     console.error(`Error deleting file ${filename}:`, err);
      //   }
      // }
    });
  }

  const uploadHandler = upload.array("images", 4);
  uploadHandler(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // تجهيز روابط الصور الجديدة
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => `${file.filename}`);
    }

    next();
  });
};

module.exports = uploadImagesProduct;
